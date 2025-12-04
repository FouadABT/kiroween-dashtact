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
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  authTimeout?: NodeJS.Timeout;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class NotificationWebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationWebSocketGateway.name);
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
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

    // Store timeout so we can clear it on successful auth
    client.authTimeout = timeout;
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: AuthenticatedSocket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clear auth timeout if it exists
    if (client.authTimeout) {
      clearTimeout(client.authTimeout);
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

      // Leave all rooms
      void client.leave(`user:${client.userId}`);
      if (client.userRole) {
        void client.leave(`role:${client.userRole}`);
      }

      this.logger.log(
        `User ${client.userId} disconnected. Remaining connections: ${this.userSockets.get(client.userId)?.size || 0}`,
      );
    }
  }

  /**
   * Handle authentication event
   * Client must send JWT token to authenticate
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

      // Get user from database to verify they still exist
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: true,
        },
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

      // Join user to role room
      await client.join(`role:${user.role.name}`);

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
   * Check if token is blacklisted
   */
  private async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }

  /**
   * Send notification to specific user
   * @param userId User ID to send notification to
   * @param notification Notification data
   */
  sendToUser(userId: string, notification: any): void {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Sent notification to user ${userId}`);
  }

  /**
   * Broadcast notification to all users with specific role
   * @param role Role name
   * @param notification Notification data
   */
  broadcastToRole(role: string, notification: any): void {
    this.server.to(`role:${role}`).emit('notification', notification);
    this.logger.log(`Broadcast notification to role ${role}`);
  }

  /**
   * Emit notification created event
   * @param userId User ID
   * @param notification Notification data
   */
  emitNotificationCreated(userId: string, notification: any): void {
    this.server.to(`user:${userId}`).emit('notification:created', {
      notification,
      createdAt: new Date().toISOString(),
    });
    this.logger.log(`Emitted created event for notification ${notification.id}`);
  }

  /**
   * Emit notification read event
   * @param userId User ID
   * @param notificationId Notification ID
   */
  emitNotificationRead(userId: string, notificationId: string): void {
    this.server.to(`user:${userId}`).emit('notification:read', {
      notificationId,
      readAt: new Date().toISOString(),
    });
    this.logger.log(`Emitted read event for notification ${notificationId}`);
  }

  /**
   * Emit notification deleted event
   * @param userId User ID
   * @param notificationId Notification ID
   */
  emitNotificationDeleted(userId: string, notificationId: string): void {
    this.server.to(`user:${userId}`).emit('notification:deleted', {
      notificationId,
      deletedAt: new Date().toISOString(),
    });
    this.logger.log(`Emitted deleted event for notification ${notificationId}`);
  }

  /**
   * Get connected user count
   */
  getConnectedUserCount(): number {
    return this.userSockets.size;
  }

  /**
   * Get user connection count
   */
  getUserConnectionCount(userId: string): number {
    return this.userSockets.get(userId)?.size || 0;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
