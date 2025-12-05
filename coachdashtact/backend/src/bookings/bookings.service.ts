import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SessionsService } from '../sessions/sessions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateBookingDto, CancelBookingDto } from './dto';
import { BookingWithRelations } from './interfaces/booking.interface';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sessionsService: SessionsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Create a booking with capacity management and auto-confirmation
   */
  async create(dto: CreateBookingDto): Promise<BookingWithRelations> {
    try {
      // Debug: Log the incoming DTO
      this.logger.debug(`Creating booking with DTO: ${JSON.stringify(dto)}`);
      
      // Validate coach and member exist
      const [coach, coachProfile, member, memberProfile] = await Promise.all([
        this.prisma.user.findUnique({
          where: { id: dto.coachId },
        }),
        this.prisma.coachProfile.findUnique({
          where: { userId: dto.coachId },
        }),
        this.prisma.user.findUnique({
          where: { id: dto.memberId },
        }),
        this.prisma.memberProfile.findUnique({
          where: { userId: dto.memberId },
        }),
      ]);

      if (!coach || !coachProfile) {
        throw new NotFoundException('Coach not found');
      }

      if (!member || !memberProfile) {
        this.logger.error(`Member validation failed: member=${!!member}, memberProfile=${!!memberProfile}, memberId=${dto.memberId}`);
        throw new NotFoundException('Member not found');
      }
      
      this.logger.debug(`Member validated: userId=${member.id}, profileId=${memberProfile.id}`);

      // Parse requested date and time
      const requestedDate = new Date(dto.requestedDate);
      const [hours, minutes] = dto.requestedTime.split(':').map(Number);
      const scheduledAt = new Date(requestedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      // Verify the requested time falls within coach availability
      const dayOfWeek = scheduledAt.getDay();
      const timeString = dto.requestedTime;

      const availability = await this.prisma.coachAvailability.findFirst({
        where: {
          coachId: dto.coachId,
          dayOfWeek,
          isActive: true,
          startTime: { lte: timeString },
          endTime: { gt: timeString },
        },
      });

      if (!availability) {
        throw new BadRequestException(
          'The requested time is outside coach availability',
        );
      }

      // Use transaction to prevent race conditions
      const result = await this.prisma.$transaction(async (tx) => {
        // Check slot capacity
        const existingBookings = await tx.sessionBooking.count({
          where: {
            coachId: dto.coachId,
            requestedDate: {
              gte: new Date(requestedDate.setHours(0, 0, 0, 0)),
              lt: new Date(requestedDate.setHours(23, 59, 59, 999)),
            },
            requestedTime: dto.requestedTime,
            status: { in: ['confirmed', 'pending'] },
          },
        });

        // Check if slot is at capacity
        if (existingBookings >= availability.maxSessionsPerSlot) {
          // Send rejection notification
          await this.notificationsService.create({
            userId: member.id,
            title: 'Booking Rejected',
            message: 'This slot is now full, please choose another',
            category: 'CALENDAR',
            priority: 'HIGH',
            actionUrl: '/member/book-session',
            actionLabel: 'Book Another Slot',
          });

          throw new ConflictException(
            'This slot is now full, please choose another',
          );
        }

        // Auto-confirm booking - create session first
        const session = await this.sessionsService.create(
          {
            memberId: memberProfile.id, // Use member profile ID, not user ID
            coachId: dto.coachId,
            scheduledAt: scheduledAt.toISOString(),
            duration: dto.duration,
            type: 'regular',
            memberNotes: dto.memberNotes,
            createGroupChat: dto.createGroupChat,
          },
          dto.coachId,
        );

        // Create confirmed booking
        const booking = await tx.sessionBooking.create({
          data: {
            memberId: memberProfile.id, // Use member profile ID, not user ID
            coachId: dto.coachId,
            requestedDate: scheduledAt,
            requestedTime: dto.requestedTime,
            duration: dto.duration,
            memberNotes: dto.memberNotes,
            status: 'confirmed',
            sessionId: session.id,
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
            session: true,
          },
        });

        // Send confirmation notification
        await this.notificationsService.create({
          userId: member.id,
          title: 'Booking Confirmed',
          message: `Your coaching session with ${coach.name || coach.email} has been confirmed for ${scheduledAt.toLocaleDateString()} at ${dto.requestedTime}`,
          category: 'CALENDAR',
          priority: 'NORMAL',
          actionUrl: `/member/sessions/${session.id}`,
          actionLabel: 'View Session',
        });

        return booking;
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create booking: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Find all bookings with role-based filtering
   */
  async findAll(userId: string, role: string): Promise<BookingWithRelations[]> {
    try {
      const where: any = {};

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
      // Admin sees all bookings (no filter)

      const bookings = await this.prisma.sessionBooking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
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
          session: true,
        },
      });

      return bookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch bookings: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Find a single booking by ID
   */
  async findOne(
    id: string,
    userId: string,
    role: string,
  ): Promise<BookingWithRelations> {
    try {
      const booking = await this.prisma.sessionBooking.findUnique({
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
          session: true,
        },
      });

      if (!booking) {
        throw new NotFoundException('Booking not found');
      }

      // Permission check
      if (role === 'Coach' && booking.coachId !== userId) {
        throw new ForbiddenException('You can only view your own bookings');
      }

      if (role === 'Member') {
        const memberProfile = await this.prisma.memberProfile.findUnique({
          where: { userId },
        });
        if (!memberProfile || booking.memberId !== memberProfile.id) {
          throw new ForbiddenException('You can only view your own bookings');
        }
      }

      return booking;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch booking: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Cancel a booking and free capacity
   */
  async cancelBooking(
    id: string,
    dto: CancelBookingDto,
    userId: string,
    role: string,
  ): Promise<void> {
    try {
      const booking = await this.findOne(id, userId, role);

      // Verify booking is not already cancelled
      if (booking.status === 'cancelled') {
        throw new BadRequestException('Booking is already cancelled');
      }

      // Use transaction to ensure consistency
      await this.prisma.$transaction(async (tx) => {
        // Update booking status
        await tx.sessionBooking.update({
          where: { id },
          data: {
            status: 'cancelled',
          },
        });

        // Cancel associated session if it exists
        if (booking.sessionId) {
          await this.sessionsService.cancel(
            booking.sessionId,
            { reason: dto.reason || 'Booking cancelled' },
            userId,
            role,
          );
        }
      });

      // Send cancellation notification
      const notificationUserId =
        role === 'Member' ? booking.coachId : booking.member.userId;
      const notificationMessage =
        role === 'Member'
          ? `${booking.member.user.name || booking.member.user.email} has cancelled their booking for ${booking.requestedDate.toLocaleDateString()} at ${booking.requestedTime}`
          : `Your booking for ${booking.requestedDate.toLocaleDateString()} at ${booking.requestedTime} has been cancelled`;

      await this.notificationsService.create({
        userId: notificationUserId,
        title: 'Booking Cancelled',
        message: notificationMessage,
        category: 'CALENDAR',
        priority: 'HIGH',
      });

      this.logger.log(`Booking ${id} cancelled successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to cancel booking: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Check slot capacity for a specific date and time
   */
  async checkSlotCapacity(
    coachId: string,
    date: Date,
    time: string,
  ): Promise<number> {
    try {
      const dayOfWeek = date.getDay();

      // Get availability for this slot
      const availability = await this.prisma.coachAvailability.findFirst({
        where: {
          coachId,
          dayOfWeek,
          isActive: true,
          startTime: { lte: time },
          endTime: { gt: time },
        },
      });

      if (!availability) {
        return 0;
      }

      // Count existing bookings for this slot
      const existingBookings = await this.prisma.sessionBooking.count({
        where: {
          coachId,
          requestedDate: {
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lt: new Date(date.setHours(23, 59, 59, 999)),
          },
          requestedTime: time,
          status: { in: ['confirmed', 'pending'] },
        },
      });

      return availability.maxSessionsPerSlot - existingBookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to check slot capacity: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Get pending bookings for a coach
   */
  async getPendingBookings(
    coachId: string,
    userId: string,
    role: string,
  ): Promise<BookingWithRelations[]> {
    try {
      // Permission check
      if (role === 'Coach' && coachId !== userId) {
        throw new ForbiddenException(
          'You can only view your own pending bookings',
        );
      }

      const bookings = await this.prisma.sessionBooking.findMany({
        where: {
          coachId,
          status: 'pending',
        },
        orderBy: { requestedDate: 'asc' },
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
          session: true,
        },
      });

      return bookings;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to fetch pending bookings: ${errorMessage}`);
      throw error;
    }
  }
}
