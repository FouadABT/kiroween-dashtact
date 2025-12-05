import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
import {
  CreateMemberDto,
  UpdateMemberDto,
  AssignCoachDto,
  UpdateOnboardingDto,
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
} from './dto';
import { ConversationType } from '@prisma/client';

@Injectable()
export class MembersService {
  private readonly logger = new Logger(MembersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly messagingService: MessagingService,
  ) {}

  // Member Profile Methods

  async findAll(userId: string, role: string) {
    // Admin sees all members
    if (role === 'Admin' || role === 'Super Admin') {
      return this.prisma.memberProfile.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
          coach: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
    }

    // Coach sees only their members
    if (role === 'Coach') {
      return this.prisma.memberProfile.findMany({
        where: { coachId: userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
          coach: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      });
    }

    // Members can only see their own profile
    if (role === 'Member') {
      const profile = await this.prisma.memberProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
          coach: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      });
      return profile ? [profile] : [];
    }

    return [];
  }

  async findOne(id: string, userId: string, role: string) {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Member profile not found');
    }

    // Check access permissions
    if (role === 'Member' && profile.userId !== userId) {
      throw new BadRequestException('You can only view your own profile');
    }

    if (role === 'Coach' && profile.coachId !== userId) {
      throw new BadRequestException('You can only view your own members');
    }

    return profile;
  }

  async create(dto: CreateMemberDto) {
    // Check if profile already exists
    const existing = await this.prisma.memberProfile.findUnique({
      where: { userId: dto.userId },
    });

    if (existing) {
      throw new ConflictException(
        'Member profile already exists for this user',
      );
    }

    // If coach is specified, validate coach capacity
    if (dto.coachId) {
      await this.validateCoachCapacity(dto.coachId);
    }

    const profile = await this.prisma.memberProfile.create({
      data: {
        userId: dto.userId,
        coachId: dto.coachId,
        goals: dto.goals,
        healthInfo: dto.healthInfo,
        membershipStatus: 'active',
        onboardingStatus: 'pending',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create conversation if coach is assigned
    if (dto.coachId) {
      try {
        await this.messagingService.createConversation(dto.coachId, {
          type: ConversationType.DIRECT,
          participantIds: [dto.userId],
        });
        this.logger.log(
          `Created conversation between coach ${dto.coachId} and member ${dto.userId}`,
        );
      } catch (error) {
        this.logger.error(`Failed to create conversation: ${error.message}`);
      }

      // Send notification to coach about new member
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: dto.userId },
        });
        await this.prisma.notification.create({
          data: {
            userId: dto.coachId,
            title: 'New Member Assigned',
            message: `${user?.name || user?.email || 'A new member'} has been assigned to you`,
            category: 'SYSTEM',
            priority: 'NORMAL',
            actionUrl: `/dashboard/coaching/members/${profile.id}`,
            actionLabel: 'View Member',
          },
        });
        this.logger.log(`Sent new member notification to coach ${dto.coachId}`);
      } catch (error) {
        this.logger.error(`Failed to send notification: ${error.message}`);
      }
    }

    this.logger.log(`Created member profile for user ${dto.userId}`);
    return profile;
  }

  async update(id: string, dto: UpdateMemberDto) {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('Member profile not found');
    }

    const updated = await this.prisma.memberProfile.update({
      where: { id },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(`Updated member profile ${id}`);
    return updated;
  }

  async assignCoach(memberId: string, dto: AssignCoachDto) {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { id: memberId },
    });

    if (!profile) {
      throw new NotFoundException('Member profile not found');
    }

    // Validate coach capacity
    await this.validateCoachCapacity(dto.coachId);

    // Update member profile
    const updated = await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { coachId: dto.coachId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create conversation between coach and member
    try {
      await this.messagingService.createConversation(dto.coachId, {
        type: ConversationType.DIRECT,
        participantIds: [profile.userId],
      });
      this.logger.log(
        `Created conversation between coach ${dto.coachId} and member ${profile.userId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to create conversation: ${error.message}`);
    }

    // Send notification to coach about new member assignment
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: profile.userId },
      });
      await this.prisma.notification.create({
        data: {
          userId: dto.coachId,
          title: 'New Member Assigned',
          message: `${user?.name || user?.email || 'A member'} has been assigned to you`,
          category: 'SYSTEM',
          priority: 'NORMAL',
          actionUrl: `/dashboard/coaching/members/${memberId}`,
          actionLabel: 'View Member',
        },
      });
      this.logger.log(`Sent member assignment notification to coach ${dto.coachId}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`);
    }

    this.logger.log(`Assigned coach ${dto.coachId} to member ${memberId}`);
    return updated;
  }

  async updateOnboardingStatus(memberId: string, dto: UpdateOnboardingDto) {
    const profile = await this.prisma.memberProfile.findUnique({
      where: { id: memberId },
    });

    if (!profile) {
      throw new NotFoundException('Member profile not found');
    }

    const updated = await this.prisma.memberProfile.update({
      where: { id: memberId },
      data: { onboardingStatus: dto.status },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
        coach: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(
      `Updated onboarding status for member ${memberId} to ${dto.status}`,
    );
    return updated;
  }

  async getMembersByCoach(coachId: string) {
    return this.prisma.memberProfile.findMany({
      where: { coachId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
  }

  // Coach Profile Methods

  async createCoachProfile(userId: string, dto: CreateCoachProfileDto) {
    // Check if profile already exists
    const existing = await this.prisma.coachProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ConflictException('Coach profile already exists for this user');
    }

    const profile = await this.prisma.coachProfile.create({
      data: {
        userId,
        specialization: dto.specialization,
        bio: dto.bio,
        certifications: dto.certifications,
        maxMembers: dto.maxMembers || 20,
        isAcceptingMembers:
          dto.isAcceptingMembers !== undefined ? dto.isAcceptingMembers : true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(`Created coach profile for user ${userId}`);
    return profile;
  }

  async updateCoachProfile(userId: string, dto: UpdateCoachProfileDto) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }

    const updated = await this.prisma.coachProfile.update({
      where: { userId },
      data: dto,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    this.logger.log(`Updated coach profile for user ${userId}`);
    return updated;
  }

  async getCoachProfile(userId: string) {
    const profile = await this.prisma.coachProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Coach profile not found');
    }

    // Get current member count
    const memberCount = await this.prisma.memberProfile.count({
      where: {
        coachId: userId,
        membershipStatus: 'active',
      },
    });

    // Calculate average rating from completed sessions
    const ratingStats = await this.prisma.session.aggregate({
      where: {
        coachId: userId,
        status: 'completed',
        rating: { not: null },
      },
      _avg: {
        rating: true,
      },
      _count: {
        rating: true,
      },
    });

    return {
      ...profile,
      currentMemberCount: memberCount,
      availableCapacity: profile.maxMembers - memberCount,
      averageRating: ratingStats._avg.rating || null,
      totalRatings: ratingStats._count.rating || 0,
    };
  }

  async getAvailableCoaches() {
    const coaches = await this.prisma.coachProfile.findMany({
      where: {
        isAcceptingMembers: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Add member count and rating to each coach
    const coachesWithCount = await Promise.all(
      coaches.map(async (coach) => {
        const memberCount = await this.prisma.memberProfile.count({
          where: {
            coachId: coach.userId,
            membershipStatus: 'active',
          },
        });

        // Calculate average rating
        const ratingStats = await this.prisma.session.aggregate({
          where: {
            coachId: coach.userId,
            status: 'completed',
            rating: { not: null },
          },
          _avg: {
            rating: true,
          },
          _count: {
            rating: true,
          },
        });

        return {
          ...coach,
          currentMemberCount: memberCount,
          availableCapacity: coach.maxMembers - memberCount,
          isAtCapacity: memberCount >= coach.maxMembers,
          averageRating: ratingStats._avg.rating || null,
          totalRatings: ratingStats._count.rating || 0,
        };
      }),
    );

    // Filter out coaches at capacity
    return coachesWithCount.filter((coach) => !coach.isAtCapacity);
  }

  // Helper Methods

  private async validateCoachCapacity(coachId: string) {
    const coachProfile = await this.prisma.coachProfile.findUnique({
      where: { userId: coachId },
    });

    if (!coachProfile) {
      throw new NotFoundException('Coach profile not found');
    }

    if (!coachProfile.isAcceptingMembers) {
      throw new BadRequestException(
        'This coach is not currently accepting new members',
      );
    }

    const currentMemberCount = await this.prisma.memberProfile.count({
      where: {
        coachId,
        membershipStatus: 'active',
      },
    });

    if (currentMemberCount >= coachProfile.maxMembers) {
      throw new BadRequestException(
        'Coach has reached maximum member capacity',
      );
    }
  }
}
