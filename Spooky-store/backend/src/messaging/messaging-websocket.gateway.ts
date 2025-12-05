import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { MessagingService } from './messaging.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  authTimeout?: NodeJS.Timeout;
}

interface TypingIndicator {
  userId: string;
  conversationId: string;
  timeout: NodeJS.Timeout;
}

@WebSocketGateway({
  namespace: '/messaging',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagingWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingWebSocketGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private typingIndicators = new Map<string, TypingIndicator>(); // socketId -> TypingIndicator

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => MessagingService))
    private readonly messagingService: MessagingService,
  ) {}

  /**
   * Handle new WebSocket connection
   */
  handleConnection(client: AuthenticatedSocket): void {
    this.logger.log(`Client attempting to connect: ${client.id}`);

    // Client must authenticate within 10 seconds
    const timeout = setTimeout(() => {
      if (!client.userId) {
        this.logger.warn(`Client ${client.id} failed to authenticate in time`);
        client.emit('error', { message: 'Authentication timeout' });
        client.disconnect();
      }
    }, 10000);

    client.authTimeout = timeout;
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clear auth timeout
    if (client.authTimeout) {
      clearTimeout(client.authTimeout);
    }

    // Clear typing indicator
    const typingIndicator = this.typingIndicators.get(client.id);
    if (typingIndicator) {
      clearTimeout(typingIndicator.timeout);
      this.typingIndicators.delete(client.id);
      
      // Notify others that user stopped typing
      this.server
        .to(`conversation:${typingIndicator.conversationId}`)
        .emit('message:typing:stop', {
          userId: typingIndicator.userId,
          conversationId: typingIndicator.conversationId,
        });
    }

    // Remove from user-socket mapping
    if (client.userId) {
      const sockets = this.userSockets.get(client.userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(client.userId);
        }
      }

      // Leave user room
      void client.leave(`user:${client.userId}`);

      this.logger.log(
        `User ${client.userId} disconnected. Remaining connections: ${this.userSockets.get(client.userId)?.size || 0}`,
      );
    }
  }

  /**
   * Handle authentication event
   */
  @SubscribeMessage('authenticate')
  async handleAuthenticate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { token: string },
  ): Promise<void> {
    try {
      // Clear auth timeout
      if (client.authTimeout) {
        clearTimeout(client.authTimeout);
      }

      if (!data.token) {
        client.emit('error', { message: 'Token is required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync<JwtPayload>(data.token);

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(data.token);
      if (isBlacklisted) {
        this.logger.warn(`Blacklisted token used: ${client.id}`);
        client.emit('error', { message: 'Token has been revoked' });
        client.disconnect();
        return;
      }

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { role: true },
      });

      if (!user || !user.isActive) {
        this.logger.warn(`Invalid or inactive user: ${payload.sub}`);
        client.emit('error', { message: 'User not found or inactive' });
        client.disconnect();
        return;
      }

      // Store user info on socket
      client.userId = user.id;
      client.userEmail = user.email;
      client.userRole = user.role.name;

      // Add to user-socket mapping
      if (!this.userSockets.has(user.id)) {
        this.userSockets.set(user.id, new Set());
      }
      this.userSockets.get(user.id)!.add(client.id);

      // Join user to personal room
      await client.join(`user:${user.id}`);

      // Join user to all their conversation rooms
      await this.joinUserConversations(client, user.id);

      // Send authentication success
      client.emit('authenticated', {
        userId: user.id,
        email: user.email,
        role: user.role.name,
      });

      this.logger.log(
        `User ${user.email} authenticated successfully. Socket: ${client.id}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Authentication failed: ${errorMessage}`);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Join user to all their conversation rooms
   */
  private async joinUserConversations(
    client: AuthenticatedSocket,
    userId: string,
  ): Promise<void> {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
      select: { id: true },
    });

    for (const conversation of conversations) {
      await client.join(`conversation:${conversation.id}`);
    }

    this.logger.log(
      `User ${userId} joined ${conversations.length} conversation rooms`,
    );
  }

  /**
   * Handle send message event
   */
  @SubscribeMessage('message:send')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; content: string; type?: string; metadata?: any },
  ): Promise<void> {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Send message using service
      const message = await this.messagingService.sendMessage(client.userId, {
        conversationId: data.conversationId,
        content: data.content,
        type: data.type as any,
        metadata: data.metadata,
      });

      // Broadcast message to all participants in the conversation
      this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
        message,
        conversationId: data.conversationId,
      });

      // Send confirmation to sender
      client.emit('message:sent', {
        messageId: message.id,
        conversationId: data.conversationId,
      });

      this.logger.log(
        `Message sent by ${client.userId} in conversation ${data.conversationId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send message: ${errorMessage}`);
      client.emit('error', { message: 'Failed to send message', error: errorMessage });
    }
  }

  /**
   * Handle typing indicator event
   */
  @SubscribeMessage('message:typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ): Promise<void> {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Verify user is participant
      await this.messagingService.getConversation(data.conversationId, client.userId);

      if (data.isTyping) {
        // Clear existing timeout if any
        const existing = this.typingIndicators.get(client.id);
        if (existing) {
          clearTimeout(existing.timeout);
        }

        // Set new timeout (3 seconds)
        const timeout = setTimeout(() => {
          this.typingIndicators.delete(client.id);
          this.server
            .to(`conversation:${data.conversationId}`)
            .emit('message:typing:stop', {
              userId: client.userId,
              conversationId: data.conversationId,
            });
        }, 3000);

        this.typingIndicators.set(client.id, {
          userId: client.userId,
          conversationId: data.conversationId,
          timeout,
        });

        // Broadcast typing indicator to others in conversation (except sender)
        client.to(`conversation:${data.conversationId}`).emit('message:typing:start', {
          userId: client.userId,
          conversationId: data.conversationId,
        });
      } else {
        // Clear typing indicator
        const existing = this.typingIndicators.get(client.id);
        if (existing) {
          clearTimeout(existing.timeout);
          this.typingIndicators.delete(client.id);
        }

        // Broadcast stop typing
        client.to(`conversation:${data.conversationId}`).emit('message:typing:stop', {
          userId: client.userId,
          conversationId: data.conversationId,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to handle typing indicator: ${errorMessage}`);
    }
  }

  /**
   * Handle mark message as read event
   */
  @SubscribeMessage('message:read')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ): Promise<void> {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Mark message as read
      await this.messagingService.markMessageAsRead(data.messageId, client.userId);

      // Broadcast read status to conversation participants
      this.server.to(`conversation:${data.conversationId}`).emit('message:status', {
        messageId: data.messageId,
        userId: client.userId,
        status: 'READ',
        timestamp: new Date().toISOString(),
      });

      this.logger.log(
        `Message ${data.messageId} marked as read by ${client.userId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to mark message as read: ${errorMessage}`);
    }
  }

  /**
   * Handle join conversation room
   */
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ): Promise<void> {
    try {
      if (!client.userId) {
        client.emit('error', { message: 'Not authenticated' });
        return;
      }

      // Verify user is participant
      await this.messagingService.getConversation(data.conversationId, client.userId);

      // Join conversation room
      await client.join(`conversation:${data.conversationId}`);

      client.emit('conversation:joined', {
        conversationId: data.conversationId,
      });

      this.logger.log(
        `User ${client.userId} joined conversation ${data.conversationId}`,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to join conversation: ${errorMessage}`);
      client.emit('error', { message: 'Failed to join conversation' });
    }
  }

  /**
   * Handle leave conversation room
   */
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ): Promise<void> {
    try {
      if (!client.userId) {
        return;
      }

      // Leave conversation room
      await client.leave(`conversation:${data.conversationId}`);

      client.emit('conversation:left', {
        conversationId: data.conversationId,
      });

      this.logger.log(
        `User ${client.userId} left conversation ${data.conversationId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to leave conversation: ${error}`);
    }
  }

  /**
   * Check if token is blacklisted
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }

  /**
   * Broadcast message to conversation participants
   */
  broadcastMessage(conversationId: string, message: any): void {
    this.server.to(`conversation:${conversationId}`).emit('message:new', {
      message,
      conversationId,
    });
    this.logger.log(`Broadcast message to conversation ${conversationId}`);
  }

  /**
   * Broadcast message status update
   */
  broadcastMessageStatus(
    conversationId: string,
    messageId: string,
    userId: string,
    status: string,
  ): void {
    this.server.to(`conversation:${conversationId}`).emit('message:status', {
      messageId,
      userId,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Notify user about new conversation
   */
  notifyNewConversation(userId: string, conversation: any): void {
    this.server.to(`user:${userId}`).emit('conversation:new', {
      conversation,
    });
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get connected user count
   */
  getConnectedUserCount(): number {
    return this.userSockets.size;
  }
}
