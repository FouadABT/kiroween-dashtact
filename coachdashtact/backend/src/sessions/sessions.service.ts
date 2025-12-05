import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { NotificationsService } from '../notifications/notifications.service';
import { MessagingService } from '../messaging/messaging.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CompleteSessionDto,
  CancelSessionDto,
  AddNotesDto,
  RateSessionDto,
} from './dto';
import { ConversationType } from '@prisma/client';

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calendarService: CalendarService,
    private readonly notificationsService: NotificationsService,
    private readonly messagingService: MessagingService,
  ) {}

  /**
   * Create a new session with calendar event and notifications
   */
  async create(dto: CreateSessionDto, userId: string): Promise<any> {
    try {
      // Validate coach and member exist and are active
      // Validate coach and member exist
      // Note: dto.memberId is the member profile ID, not user ID
      const [coach, coachProfile, memberProfile] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: dto.coachId },
        }),
        this.prisma.coachProfile.findUnique({
          where: { userId: dto.coachId },
        }),
        this.prisma.memberProfile.findUnique({
          where: { id: dto.memberId },
          include: {
            user: true,
          },
        }),
      ]);

      if (!coach || !coachProfile) {
        throw new NotFoundException('Coach not found');
      }

      if (!memberProfile) {
        throw new NotFoundException('Member not found');
      }

      // Get coaching session category
      let category = await this.prisma.eventCategory.findFirst({
        where: { name: 'Coaching Session' },
      });

      if (!category) {
        // Create category if it doesn't exist
        category = await this.prisma.eventCategory.create({
          data: {
            name: 'Coaching Session',
            slug: 'coaching-session',
            color: '#10b981',
            isActive: true,
          },
        });
      }

      // Calculate end time
      const startTime = new Date(dto.scheduledAt);
      const endTime = new Date(startTime.getTime() + dto.duration * 60000);

      // Create calendar event
      const calendarEvent = await this.calendarService.create(
        {
          title: `Coaching Session: ${memberProfile.user.name || memberProfile.user.email}`,
          description: dto.memberNotes || 'Coaching session',
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          categoryId: category.id,
          attendeeIds: [memberProfile.userId], // Use user ID for calendar attendees
          visibility: 'PRIVATE',
        },
        dto.coachId,
      );

      // Create session
      const session = await this.prisma.session.create({
        data: {
          calendarEventId: calendarEvent.id,
          memberId: dto.memberId,
          coachId: dto.coachId,
          type: dto.type,
          duration: dto.duration,
          scheduledAt: startTime,
          memberNotes: dto.memberNotes,
          status: 'scheduled',
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      // Send notifications to both coach and member
      await Promise.all([
        this.notificationsService.create({
          userId: dto.coachId,
          title: 'New Coaching Session',
          message: `You have a new coaching session scheduled with ${memberProfile.user.name || memberProfile.user.email} on ${startTime.toLocaleDateString()}`,
          category: 'CALENDAR',
          priority: 'NORMAL',
          actionUrl: `/dashboard/coaching/sessions/${session.id}`,
          actionLabel: 'View Session',
        }),
        this.notificationsService.create({
          userId: memberProfile.userId,
          title: 'Coaching Session Scheduled',
          message: `Your coaching session with ${coach.name || coach.email} is scheduled for ${startTime.toLocaleDateString()}`,
          category: 'CALENDAR',
          priority: 'NORMAL',
          actionUrl: `/member/sessions/${session.id}`,
          actionLabel: 'View Session',
        }),
      ]);

      // Create group chat if requested
      if (dto.createGroupChat) {
        try {
          await this.messagingService.createConversation(dto.coachId, {
            type: ConversationType.GROUP,
            name: `Session: ${startTime.toLocaleDateString()}`,
            participantIds: [dto.memberId],
          });
        } catch (error) {
          this.logger.error(`Failed to create group chat: ${error.message}`);
        }
      }

      return session;
    } catch (error) {
      this.logger.error(`Failed to create session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all sessions with role-based filtering
   */
  async findAll(userId: string, role: string): Promise<any[]> {
    try {
      const where: any = {
        status: { not: 'cancelled' },
      };

      // Role-based filtering
      if (role === 'Coach') {
        where.coachId = userId;
      } else if (role === 'Member') {
        // Find member profile
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (memberProfile) {
          where.memberId = memberProfile.id;
        } else {
          return [];
        }
      }
      // Admin sees all sessions (no filter)

      const sessions = await this.prisma.session.findMany({
        where,
        orderBy: { scheduledAt: 'desc' },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return sessions;
    } catch (error) {
      this.logger.error(`Failed to fetch sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a single session by ID with permission check
   */
  async findOne(id: string, userId: string, role: string): Promise<any> {
    try {
      const session = await this.prisma.session.findUnique({
        where: { id },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      if (!session) {
        throw new NotFoundException('Session not found');
      }

      // Permission check
      if (role === 'Coach' && session.coachId !== userId) {
        throw new ForbiddenException('You can only view your own sessions');
      }

      if (role === 'Member') {
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (!memberProfile || session.memberId !== memberProfile.id) {
          throw new ForbiddenException('You can only view your own sessions');
        }
      }

      return session;
    } catch (error) {
      this.logger.error(`Failed to fetch session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update session with calendar sync
   */
  async update(
    id: string,
    dto: UpdateSessionDto,
    userId: string,
    role: string,
  ): Promise<any> {
    try {
      const session = await this.findOne(id, userId, role);

      // Only coach can update
      if (role !== 'Admin' && session.coachId !== userId) {
        throw new ForbiddenException('Only the coach can update this session');
      }

      const updateData: any = {};

      if (dto.scheduledAt) {
        const newStartTime = new Date(dto.scheduledAt);
        updateData.scheduledAt = newStartTime;

        // Update calendar event
        const duration = dto.duration || session.duration;
        const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

        await this.calendarService.update(
          session.calendarEventId,
          {
            startTime: newStartTime.toISOString(),
            endTime: newEndTime.toISOString(),
          },
          session.coachId,
        );
      }

      if (dto.duration) {
        updateData.duration = dto.duration;

        // Update calendar event end time
        const startTime = dto.scheduledAt
          ? new Date(dto.scheduledAt)
          : session.scheduledAt;
        const newEndTime = new Date(startTime.getTime() + dto.duration * 60000);

        await this.calendarService.update(
          session.calendarEventId,
          {
            endTime: newEndTime.toISOString(),
          },
          session.coachId,
        );
      }

      if (dto.type) {
        updateData.type = dto.type;
      }

      if (dto.memberNotes !== undefined) {
        updateData.memberNotes = dto.memberNotes;
      }

      const updatedSession = await this.prisma.session.update({
        where: { id },
        data: updateData,
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return updatedSession;
    } catch (error) {
      this.logger.error(`Failed to update session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Complete a session
   */
  async complete(
    id: string,
    dto: CompleteSessionDto,
    userId: string,
    role: string,
  ): Promise<any> {
    try {
      const session = await this.findOne(id, userId, role);

      // Only coach can complete
      if (role !== 'Admin' && session.coachId !== userId) {
        throw new ForbiddenException(
          'Only the coach can complete this session',
        );
      }

      // Verify session is scheduled
      if (session.status !== 'scheduled') {
        throw new BadRequestException(
          'Only scheduled sessions can be completed',
        );
      }

      const completedSession = await this.prisma.session.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          coachNotes: dto.coachNotes,
          outcomes: dto.outcomes,
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      // Send notifications
      await Promise.all([
        this.notificationsService.create({
          userId: session.member.userId,
          title: 'Session Completed',
          message: `Your coaching session has been completed. Please rate your experience.`,
          category: 'CALENDAR',
          priority: 'NORMAL',
          actionUrl: `/member/sessions/${session.id}`,
          actionLabel: 'Rate Session',
        }),
        this.notificationsService.create({
          userId: session.coachId,
          title: 'Session Completed',
          message: `Session with ${session.member.user.name || session.member.user.email} has been marked as completed`,
          category: 'CALENDAR',
          priority: 'NORMAL',
        }),
      ]);

      return completedSession;
    } catch (error) {
      this.logger.error(`Failed to complete session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cancel a session
   */
  async cancel(
    id: string,
    dto: CancelSessionDto,
    userId: string,
    role: string,
  ): Promise<any> {
    try {
      const session = await this.findOne(id, userId, role);

      // Verify session is not already completed
      if (session.status === 'completed') {
        throw new BadRequestException('Cannot cancel a completed session');
      }

      // Update session
      const cancelledSession = await this.prisma.session.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancellationReason: dto.reason,
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      // Update calendar event status
      await this.calendarService.update(
        session.calendarEventId,
        { status: 'CANCELLED' },
        session.coachId,
      );

      // Send notifications to both parties
      await Promise.all([
        this.notificationsService.create({
          userId: session.coachId,
          title: 'Session Cancelled',
          message: `Session with ${session.member.user.name || session.member.user.email} has been cancelled${dto.reason ? `: ${dto.reason}` : ''}`,
          category: 'CALENDAR',
          priority: 'HIGH',
        }),
        this.notificationsService.create({
          userId: session.member.userId,
          title: 'Session Cancelled',
          message: `Your coaching session has been cancelled${dto.reason ? `: ${dto.reason}` : ''}`,
          category: 'CALENDAR',
          priority: 'HIGH',
        }),
      ]);

      return cancelledSession;
    } catch (error) {
      this.logger.error(`Failed to cancel session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add coach notes (visible only to coaches and admins)
   */
  async addCoachNotes(
    id: string,
    dto: AddNotesDto,
    userId: string,
    role: string,
  ): Promise<any> {
    try {
      const session = await this.findOne(id, userId, role);

      // Only coach can add coach notes
      if (role !== 'Admin' && session.coachId !== userId) {
        throw new ForbiddenException('Only the coach can add coach notes');
      }

      const updatedSession = await this.prisma.session.update({
        where: { id },
        data: {
          coachNotes: dto.notes,
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return updatedSession;
    } catch (error) {
      this.logger.error(`Failed to add coach notes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Add member notes (visible to member, coach, and admins)
   */
  async addMemberNotes(
    id: string,
    dto: AddNotesDto,
    userId: string,
    role: string,
  ): Promise<any> {
    try {
      const session = await this.findOne(id, userId, role);

      // Only member can add member notes
      if (role === 'Member') {
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (!memberProfile || session.memberId !== memberProfile.id) {
          throw new ForbiddenException(
            'You can only add notes to your own sessions',
          );
        }
      }

      const updatedSession = await this.prisma.session.update({
        where: { id },
        data: {
          memberNotes: dto.notes,
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return updatedSession;
    } catch (error) {
      this.logger.error(`Failed to add member notes: ${error.message}`);
      throw error;
    }
  }

  /**
   * Rate a session
   */
  async rateSession(
    id: string,
    dto: RateSessionDto,
    userId: string,
    role: string,
  ): Promise<any> {
    try {
      const session = await this.findOne(id, userId, role);

      // Only member can rate
      if (role === 'Member') {
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (!memberProfile || session.memberId !== memberProfile.id) {
          throw new ForbiddenException('You can only rate your own sessions');
        }
      } else if (role !== 'Admin') {
        throw new ForbiddenException('Only members can rate sessions');
      }

      // Verify session is completed
      if (session.status !== 'completed') {
        throw new BadRequestException('Only completed sessions can be rated');
      }

      // Verify not already rated
      if (session.rating !== null) {
        throw new BadRequestException('This session has already been rated');
      }

      const ratedSession = await this.prisma.session.update({
        where: { id },
        data: {
          rating: dto.rating,
          ratingFeedback: dto.feedback,
        },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      // Notify coach of rating
      await this.notificationsService.create({
        userId: session.coachId,
        title: 'Session Rated',
        message: `${session.member.user.name || session.member.user.email} rated your session ${dto.rating}/5 stars`,
        category: 'SYSTEM',
        priority: 'NORMAL',
      });

      return ratedSession;
    } catch (error) {
      this.logger.error(`Failed to rate session: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get upcoming sessions
   */
  async getUpcomingSessions(userId: string, role: string): Promise<any[]> {
    try {
      const where: any = {
        status: 'scheduled',
        scheduledAt: { gte: new Date() },
      };

      // Role-based filtering
      if (role === 'Coach') {
        where.coachId = userId;
      } else if (role === 'Member') {
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (memberProfile) {
          where.memberId = memberProfile.id;
        } else {
          return [];
        }
      }

      const sessions = await this.prisma.session.findMany({
        where,
        orderBy: { scheduledAt: 'asc' },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return sessions;
    } catch (error) {
      this.logger.error(`Failed to fetch upcoming sessions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sessions by member
   */
  async getSessionsByMember(
    memberId: string,
    userId: string,
    role: string,
  ): Promise<any[]> {
    try {
      // Permission check
      if (role === 'Member') {
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (!memberProfile || memberProfile.id !== memberId) {
          throw new ForbiddenException('You can only view your own sessions');
        }
      } else if (role === 'Coach') {
        // Verify member is assigned to this coach
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { id: memberId },
        });
        if (!memberProfile || memberProfile.coachId !== userId) {
          throw new ForbiddenException(
            'You can only view sessions for your assigned members',
          );
        }
      }

      const sessions = await this.prisma.session.findMany({
        where: { memberId },
        orderBy: { scheduledAt: 'desc' },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return sessions;
    } catch (error) {
      this.logger.error(`Failed to fetch sessions by member: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get sessions by coach
   */
  async getSessionsByCoach(
    coachId: string,
    userId: string,
    role: string,
  ): Promise<any[]> {
    try {
      // Permission check
      if (role === 'Coach' && coachId !== userId) {
        throw new ForbiddenException('You can only view your own sessions');
      }

      const sessions = await this.prisma.session.findMany({
        where: { coachId },
        orderBy: { scheduledAt: 'desc' },
        include: {
          member: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
          coach: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          calendarEvent: true,
        },
      });

      return sessions;
    } catch (error) {
      this.logger.error(`Failed to fetch sessions by coach: ${error.message}`);
      throw error;
    }
  }
}
