import { Injectable, NotFoundException, ForbiddenException, BadRequestException, forwardRef, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  UpdateMessagingConfigDto,
} from './dto';
import { ConversationType, MessageStatusType } from '@prisma/client';
import { MessagingNotificationService } from './messaging-notification.service';
import { MessagingWebSocketGateway } from './messaging-websocket.gateway';

@Injectable()
export class MessagingService {
  constructor(
    private prisma: PrismaService,
    private messagingNotificationService: MessagingNotificationService,
    @Inject(forwardRef(() => MessagingWebSocketGateway))
    private messagingGateway: MessagingWebSocketGateway,
  ) {}

  // Conversations
  async createConversation(userId: string, dto: CreateConversationDto) {
    // Validate group conversation has a name
    if (dto.type === ConversationType.GROUP && !dto.name) {
      throw new BadRequestException('Group conversations must have a name');
    }

    // Validate direct conversation has exactly 2 participants
    if (dto.type === ConversationType.DIRECT && dto.participantIds.length !== 1) {
      throw new BadRequestException('Direct conversations must have exactly one other participant');
    }

    // Check if direct conversation already exists
    if (dto.type === ConversationType.DIRECT) {
      const existingConversation = await this.findDirectConversation(userId, dto.participantIds[0]);
      if (existingConversation) {
        return existingConversation;
      }
    }

    // Create conversation with participants
    const conversation = await this.prisma.conversation.create({
      data: {
        type: dto.type,
        name: dto.name,
        createdById: userId,
        participants: {
          create: [
            { userId, isActive: true },
            ...dto.participantIds.map(id => ({ userId: id, isActive: true })),
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        createdBy: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return conversation;
  }

  async findDirectConversation(userId1: string, userId2: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        type: ConversationType.DIRECT,
        participants: {
          every: {
            userId: { in: [userId1, userId2] },
            isActive: true,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    return conversations.find(conv => conv.participants.length === 2) || null;
  }

  async getUserConversations(userId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      participants: {
        some: {
          userId,
          isActive: true,
        },
      },
    };

    if (query.type) {
      where.type = query.type;
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive === 'true';
    }

    const [conversations, total, unreadCount] = await Promise.all([
      this.prisma.conversation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { lastMessageAt: 'desc' },
        include: {
          participants: {
            where: { isActive: true },
            include: {
              user: {
                select: { id: true, email: true, name: true, avatarUrl: true },
              },
            },
          },
          messages: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            where: { deletedAt: null },
            include: {
              sender: {
                select: { id: true, email: true, name: true, avatarUrl: true },
              },
            },
          },
        },
      }),
      this.prisma.conversation.count({ where }),
      this.prisma.messageStatus.count({
        where: {
          userId,
          status: { not: 'READ' },
          message: {
            deletedAt: null,
            senderId: { not: userId },
          },
        },
      }),
    ]);

    // Calculate unread count for each conversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conv) => {
        const conversationUnreadCount = await this.prisma.messageStatus.count({
          where: {
            userId,
            status: { not: 'READ' },
            message: {
              conversationId: conv.id,
              deletedAt: null,
              senderId: { not: userId },
            },
          },
        });

        return {
          ...conv,
          lastMessage: conv.messages && conv.messages.length > 0 ? conv.messages[0] : null,
          messages: undefined, // Remove messages array
          unreadCount: conversationUnreadCount,
        };
      })
    );

    return {
      conversations: conversationsWithUnreadCount,
      unreadCount,
      total,
      page,
      limit,
    };
  }

  async getConversation(conversationId: string, userId: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
        createdBy: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Check if user is a participant
    const isParticipant = conversation.participants.some(p => p.userId === userId);
    if (!isParticipant) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }

  async updateConversation(conversationId: string, userId: string, dto: UpdateConversationDto) {
    await this.getConversation(conversationId, userId);

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: dto,
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    return conversation;
  }

  async deleteConversation(conversationId: string, userId: string) {
    const conversation = await this.getConversation(conversationId, userId);

    // Only creator can delete
    if (conversation.createdById !== userId) {
      throw new ForbiddenException('Only the conversation creator can delete it');
    }

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { message: 'Conversation deleted successfully' };
  }

  async leaveConversation(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);

    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    return { message: 'Left conversation successfully' };
  }

  async muteConversation(conversationId: string, userId: string, muted: boolean) {
    await this.getConversation(conversationId, userId);

    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId,
      },
      data: {
        isMuted: muted,
      },
    });

    return { message: `Conversation ${muted ? 'muted' : 'unmuted'} successfully` };
  }

  async addParticipants(conversationId: string, userId: string, participantIds: string[]) {
    const conversation = await this.getConversation(conversationId, userId);

    // Only allow adding participants to group conversations
    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('Can only add participants to group conversations');
    }

    // Check max participants limit
    const settings = await this.getSettings();
    const currentParticipantCount = conversation.participants.length;
    const newParticipantCount = currentParticipantCount + participantIds.length;

    if (newParticipantCount > settings.maxGroupParticipants) {
      throw new BadRequestException(
        `Cannot exceed maximum of ${settings.maxGroupParticipants} participants in a group conversation`
      );
    }

    // Get existing participant IDs
    const existingParticipantIds = conversation.participants.map(p => p.userId);

    // Filter out participants that are already in the conversation
    const newParticipantIds = participantIds.filter(id => !existingParticipantIds.includes(id));

    if (newParticipantIds.length === 0) {
      throw new BadRequestException('All specified users are already participants');
    }

    // Add new participants
    await this.prisma.conversationParticipant.createMany({
      data: newParticipantIds.map(id => ({
        conversationId,
        userId: id,
        isActive: true,
      })),
    });

    // Create system message
    const addedUsers = await this.prisma.user.findMany({
      where: { id: { in: newParticipantIds } },
      select: { name: true, email: true },
    });

    const addedNames = addedUsers.map(u => u.name || u.email).join(', ');
    await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: `${addedNames} ${newParticipantIds.length === 1 ? 'was' : 'were'} added to the conversation`,
        type: 'SYSTEM',
        isSystemMessage: true,
      },
    });

    return { message: 'Participants added successfully', addedCount: newParticipantIds.length };
  }

  async removeParticipant(conversationId: string, userId: string, participantIdToRemove: string) {
    const conversation = await this.getConversation(conversationId, userId);

    // Only allow removing participants from group conversations
    if (conversation.type !== ConversationType.GROUP) {
      throw new BadRequestException('Can only remove participants from group conversations');
    }

    // Check if the participant exists and is active
    const participant = conversation.participants.find(p => p.userId === participantIdToRemove && p.isActive);
    if (!participant) {
      throw new NotFoundException('Participant not found in this conversation');
    }

    // Only creator or the participant themselves can remove
    if (conversation.createdById !== userId && participantIdToRemove !== userId) {
      throw new ForbiddenException('Only the conversation creator or the participant themselves can remove a participant');
    }

    // Mark participant as inactive
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: participantIdToRemove,
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });

    // Create system message
    const removedUser = await this.prisma.user.findUnique({
      where: { id: participantIdToRemove },
      select: { name: true, email: true },
    });

    const removedName = removedUser?.name || removedUser?.email || 'User';
    const action = participantIdToRemove === userId ? 'left' : 'was removed from';
    await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: `${removedName} ${action} the conversation`,
        type: 'SYSTEM',
        isSystemMessage: true,
      },
    });

    return { message: 'Participant removed successfully' };
  }

  async searchConversations(userId: string, query: string) {
    if (!query || query.trim().length === 0) {
      return { conversations: [] };
    }

    const searchTerm = query.trim().toLowerCase();

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            lastMessageText: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            participants: {
              some: {
                user: {
                  OR: [
                    {
                      name: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                    {
                      email: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      take: 20,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, email: true, name: true, avatarUrl: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          where: { deletedAt: null },
          include: {
            sender: {
              select: { id: true, email: true, name: true },
            },
          },
        },
      },
    });

    return { conversations };
  }

  // Messages
  async sendMessage(userId: string, dto: SendMessageDto) {
    // Verify user is participant
    await this.getConversation(dto.conversationId, userId);

    // Check message length
    const settings = await this.getSettings();
    if (dto.content.length > settings.maxMessageLength) {
      throw new BadRequestException(`Message exceeds maximum length of ${settings.maxMessageLength} characters`);
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        senderId: userId,
        content: dto.content,
        type: dto.type || 'TEXT',
        metadata: dto.metadata,
      },
      include: {
        sender: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    // Update conversation last message
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: {
        lastMessageAt: new Date(),
        lastMessageText: dto.content.substring(0, 100),
      },
    });

    // Create message statuses for all participants
    const participants = await this.prisma.conversationParticipant.findMany({
      where: {
        conversationId: dto.conversationId,
        isActive: true,
      },
    });

    await this.prisma.messageStatus.createMany({
      data: participants.map(p => ({
        messageId: message.id,
        userId: p.userId,
        status: p.userId === userId ? MessageStatusType.READ : MessageStatusType.SENT,
      })),
    });

    // Create notifications for other participants
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      select: { name: true, type: true },
    });

    for (const participant of participants) {
      if (participant.userId !== userId && !participant.isMuted) {
        await this.messagingNotificationService.createMessageNotification(
          participant.userId,
          userId,
          dto.conversationId,
          dto.content,
          conversation?.name || undefined,
        );
      }
    }

    // Broadcast message via WebSocket to all participants
    this.messagingGateway.broadcastMessage(dto.conversationId, message);

    return message;
  }

  async getMessages(conversationId: string, userId: string, query: any) {
    await this.getConversation(conversationId, userId);

    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      conversationId,
      deletedAt: null,
    };

    if (query.before) {
      where.id = { lt: query.before };
    }

    if (query.after) {
      where.id = { gt: query.after };
    }

    const messages = await this.prisma.message.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' }, // Changed to 'asc' for chronological order (oldest first)
      include: {
        sender: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        statuses: {
          where: { userId },
        },
      },
    });

    const total = await this.prisma.message.count({ where });

    return {
      messages,
      total,
      hasMore: skip + messages.length < total,
    };
  }

  async getMessage(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        sender: {
          select: { id: true, email: true, name: true },
        },
        conversation: {
          include: {
            participants: {
              where: { userId, isActive: true },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.conversation.participants.length === 0) {
      throw new ForbiddenException('You do not have access to this message');
    }

    return message;
  }

  async updateMessage(messageId: string, userId: string, dto: UpdateMessageDto) {
    const message = await this.getMessage(messageId, userId);

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only edit your own messages');
    }

    const updated = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: dto.content,
        editedAt: new Date(),
      },
      include: {
        sender: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    return updated;
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.getMessage(messageId, userId);

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: {
        deletedAt: new Date(),
        content: '[Message deleted]',
      },
    });

    return { message: 'Message deleted successfully' };
  }

  async searchMessages(userId: string, query: string, conversationId?: string) {
    if (!query || query.trim().length === 0) {
      return { messages: [] };
    }

    const searchTerm = query.trim().toLowerCase();

    // Build where clause
    const where: any = {
      deletedAt: null,
      content: {
        contains: searchTerm,
        mode: 'insensitive',
      },
      conversation: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
      },
    };

    // Filter by specific conversation if provided
    if (conversationId) {
      where.conversationId = conversationId;
    }

    const messages = await this.prisma.message.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: { id: true, email: true, name: true, avatarUrl: true },
        },
        conversation: {
          select: {
            id: true,
            type: true,
            name: true,
          },
        },
        statuses: {
          where: { userId },
        },
      },
    });

    return { messages };
  }

  async updateMessageStatus(messageId: string, userId: string, status: MessageStatusType) {
    const message = await this.getMessage(messageId, userId);

    await this.prisma.messageStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        status,
        timestamp: new Date(),
      },
      create: {
        messageId,
        userId,
        status,
      },
    });

    return { message: 'Message status updated successfully', status };
  }

  async markMessageAsRead(messageId: string, userId: string) {
    const message = await this.getMessage(messageId, userId);

    await this.prisma.messageStatus.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        status: MessageStatusType.READ,
        timestamp: new Date(),
      },
      create: {
        messageId,
        userId,
        status: MessageStatusType.READ,
      },
    });

    // Update participant's last read
    await this.prisma.conversationParticipant.updateMany({
      where: {
        conversationId: message.conversationId,
        userId,
      },
      data: {
        lastReadAt: new Date(),
        lastReadMessageId: messageId,
      },
    });

    return { message: 'Message marked as read' };
  }

  async markConversationAsRead(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);

    // Mark ALL unread messages in this conversation as read
    await this.prisma.messageStatus.updateMany({
      where: {
        userId,
        status: { not: MessageStatusType.READ },
        message: {
          conversationId,
          deletedAt: null,
          senderId: { not: userId }, // Don't update own messages
        },
      },
      data: {
        status: MessageStatusType.READ,
        timestamp: new Date(),
      },
    });

    // Update participant's last read to the most recent message
    const lastMessage = await this.prisma.message.findFirst({
      where: {
        conversationId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (lastMessage) {
      await this.prisma.conversationParticipant.updateMany({
        where: {
          conversationId,
          userId,
        },
        data: {
          lastReadAt: new Date(),
          lastReadMessageId: lastMessage.id,
        },
      });
    }

    return { message: 'Conversation marked as read' };
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.messageStatus.count({
      where: {
        userId,
        status: { not: MessageStatusType.READ },
        message: {
          deletedAt: null,
          senderId: { not: userId },
        },
      },
    });

    return { count };
  }

  async getConversationUnreadCount(conversationId: string, userId: string) {
    await this.getConversation(conversationId, userId);

    const count = await this.prisma.messageStatus.count({
      where: {
        userId,
        status: { not: MessageStatusType.READ },
        message: {
          conversationId,
          deletedAt: null,
          senderId: { not: userId },
        },
      },
    });

    return { count };
  }

  // Settings
  async getSettings() {
    let settings = await this.prisma.messagingSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.messagingSettings.create({
        data: {},
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateMessagingConfigDto) {
    const settings = await this.getSettings();

    const updated = await this.prisma.messagingSettings.update({
      where: { id: settings.id },
      data: dto,
    });

    return updated;
  }

  async toggleMessagingSystem(enabled: boolean) {
    return this.updateSettings({ enabled });
  }
}
