import { Test, TestingModule } from '@nestjs/testing';
import { MembersService } from './members.service';
import { PrismaService } from '../prisma/prisma.service';
import { MessagingService } from '../messaging/messaging.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { ConversationType } from '@prisma/client';

describe('MembersService', () => {
  let service: MembersService;
  let prismaService: PrismaService;
  let messagingService: MessagingService;

  const mockPrismaService = {
    memberProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    coachProfile: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockMessagingService = {
    createConversation: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MembersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MessagingService,
          useValue: mockMessagingService,
        },
      ],
    }).compile();

    service = module.get<MembersService>(MembersService);
    prismaService = module.get<PrismaService>(PrismaService);
    messagingService = module.get<MessagingService>(MessagingService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createMemberDto = {
      userId: 'user-123',
      coachId: 'coach-456',
      goals: 'Get fit',
      healthInfo: 'No issues',
    };

    const mockMemberProfile = {
      id: 'member-789',
      userId: 'user-123',
      coachId: 'coach-456',
      membershipStatus: 'active',
      onboardingStatus: 'pending',
      goals: 'Get fit',
      healthInfo: 'No issues',
      coachNotes: null,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-123',
        email: 'member@example.com',
        name: 'John Doe',
        avatarUrl: null,
      },
      coach: {
        id: 'coach-456',
        email: 'coach@example.com',
        name: 'Jane Coach',
        avatarUrl: null,
      },
    };

    it('should create a member profile successfully', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.coachProfile.findUnique.mockResolvedValue({
        userId: 'coach-456',
        maxMembers: 20,
        isAcceptingMembers: true,
      });
      mockPrismaService.memberProfile.count.mockResolvedValue(5);
      mockPrismaService.memberProfile.create.mockResolvedValue(
        mockMemberProfile,
      );
      mockMessagingService.createConversation.mockResolvedValue({});

      const result = await service.create(createMemberDto);

      expect(result).toEqual(mockMemberProfile);
      expect(mockPrismaService.memberProfile.create).toHaveBeenCalledWith({
        data: {
          userId: createMemberDto.userId,
          coachId: createMemberDto.coachId,
          goals: createMemberDto.goals,
          healthInfo: createMemberDto.healthInfo,
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
      expect(mockMessagingService.createConversation).toHaveBeenCalledWith(
        'coach-456',
        {
          type: ConversationType.DIRECT,
          participantIds: ['user-123'],
        },
      );
    });

    it('should throw ConflictException if profile already exists', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(
        mockMemberProfile,
      );

      await expect(service.create(createMemberDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createMemberDto)).rejects.toThrow(
        'Member profile already exists for this user',
      );
    });

    it('should throw BadRequestException if coach is at capacity', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.coachProfile.findUnique.mockResolvedValue({
        userId: 'coach-456',
        maxMembers: 20,
        isAcceptingMembers: true,
      });
      mockPrismaService.memberProfile.count.mockResolvedValue(20);

      await expect(service.create(createMemberDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createMemberDto)).rejects.toThrow(
        'Coach has reached maximum member capacity',
      );
    });

    it('should throw BadRequestException if coach is not accepting members', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.coachProfile.findUnique.mockResolvedValue({
        userId: 'coach-456',
        maxMembers: 20,
        isAcceptingMembers: false,
      });

      await expect(service.create(createMemberDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createMemberDto)).rejects.toThrow(
        'This coach is not currently accepting new members',
      );
    });

    it('should create member without coach if coachId not provided', async () => {
      const dtoWithoutCoach = {
        userId: 'user-123',
        goals: 'Get fit',
        healthInfo: 'No issues',
      };

      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);
      mockPrismaService.memberProfile.create.mockResolvedValue({
        ...mockMemberProfile,
        coachId: null,
        coach: null,
      });

      const result = await service.create(dtoWithoutCoach);

      expect(result.coachId).toBeNull();
      expect(mockMessagingService.createConversation).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const mockMembers = [
      {
        id: 'member-1',
        userId: 'user-1',
        coachId: 'coach-1',
        membershipStatus: 'active',
        onboardingStatus: 'completed',
        goals: 'Goal 1',
        healthInfo: 'Info 1',
        coachNotes: null,
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'user-1',
          email: 'member1@example.com',
          name: 'Member One',
          avatarUrl: null,
        },
        coach: {
          id: 'coach-1',
          email: 'coach@example.com',
          name: 'Coach',
          avatarUrl: null,
        },
      },
    ];

    it('should return all members for Admin', async () => {
      mockPrismaService.memberProfile.findMany.mockResolvedValue(mockMembers);

      const result = await service.findAll('admin-123', 'Admin');

      expect(result).toEqual(mockMembers);
      expect(mockPrismaService.memberProfile.findMany).toHaveBeenCalledWith({
        include: expect.any(Object),
        orderBy: { joinedAt: 'desc' },
      });
    });

    it('should return only coach members for Coach role', async () => {
      mockPrismaService.memberProfile.findMany.mockResolvedValue(mockMembers);

      const result = await service.findAll('coach-1', 'Coach');

      expect(result).toEqual(mockMembers);
      expect(mockPrismaService.memberProfile.findMany).toHaveBeenCalledWith({
        where: { coachId: 'coach-1' },
        include: expect.any(Object),
        orderBy: { joinedAt: 'desc' },
      });
    });

    it('should return only own profile for Member role', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(
        mockMembers[0],
      );

      const result = await service.findAll('user-1', 'Member');

      expect(result).toEqual([mockMembers[0]]);
      expect(mockPrismaService.memberProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: expect.any(Object),
      });
    });

    it('should return empty array for Member with no profile', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);

      const result = await service.findAll('user-1', 'Member');

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      coachId: 'coach-1',
      membershipStatus: 'active',
      onboardingStatus: 'completed',
      goals: 'Goal 1',
      healthInfo: 'Info 1',
      coachNotes: null,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 'user-1',
        email: 'member@example.com',
        name: 'Member',
        avatarUrl: null,
      },
      coach: {
        id: 'coach-1',
        email: 'coach@example.com',
        name: 'Coach',
        avatarUrl: null,
      },
    };

    it('should return member profile for Admin', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);

      const result = await service.findOne('member-1', 'admin-123', 'Admin');

      expect(result).toEqual(mockMember);
    });

    it('should return member profile for assigned Coach', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);

      const result = await service.findOne('member-1', 'coach-1', 'Coach');

      expect(result).toEqual(mockMember);
    });

    it('should throw BadRequestException for non-assigned Coach', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);

      await expect(
        service.findOne('member-1', 'other-coach', 'Coach'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.findOne('member-1', 'other-coach', 'Coach'),
      ).rejects.toThrow('You can only view your own members');
    });

    it('should return own profile for Member', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);

      const result = await service.findOne('member-1', 'user-1', 'Member');

      expect(result).toEqual(mockMember);
    });

    it('should throw BadRequestException for Member viewing other profile', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);

      await expect(
        service.findOne('member-1', 'other-user', 'Member'),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.findOne('member-1', 'other-user', 'Member'),
      ).rejects.toThrow('You can only view your own profile');
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.findOne('member-1', 'user-1', 'Admin'),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.findOne('member-1', 'user-1', 'Admin'),
      ).rejects.toThrow('Member profile not found');
    });
  });

  describe('update', () => {
    const updateDto = {
      goals: 'Updated goals',
      healthInfo: 'Updated health info',
    };

    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      coachId: 'coach-1',
      membershipStatus: 'active',
      onboardingStatus: 'completed',
      goals: 'Goal 1',
      healthInfo: 'Info 1',
      coachNotes: null,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should update member profile successfully', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.memberProfile.update.mockResolvedValue({
        ...mockMember,
        ...updateDto,
      });

      const result = await service.update('member-1', updateDto);

      expect(result.goals).toBe(updateDto.goals);
      expect(result.healthInfo).toBe(updateDto.healthInfo);
      expect(mockPrismaService.memberProfile.update).toHaveBeenCalledWith({
        where: { id: 'member-1' },
        data: updateDto,
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);

      await expect(service.update('member-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update('member-1', updateDto)).rejects.toThrow(
        'Member profile not found',
      );
    });
  });

  describe('assignCoach', () => {
    const assignCoachDto = {
      coachId: 'coach-456',
    };

    const mockMember = {
      id: 'member-1',
      userId: 'user-1',
      coachId: null,
      membershipStatus: 'active',
      onboardingStatus: 'pending',
      goals: 'Goal 1',
      healthInfo: 'Info 1',
      coachNotes: null,
      joinedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should assign coach successfully', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.coachProfile.findUnique.mockResolvedValue({
        userId: 'coach-456',
        maxMembers: 20,
        isAcceptingMembers: true,
      });
      mockPrismaService.memberProfile.count.mockResolvedValue(5);
      mockPrismaService.memberProfile.update.mockResolvedValue({
        ...mockMember,
        coachId: 'coach-456',
      });
      mockMessagingService.createConversation.mockResolvedValue({});

      const result = await service.assignCoach('member-1', assignCoachDto);

      expect(result.coachId).toBe('coach-456');
      expect(mockMessagingService.createConversation).toHaveBeenCalledWith(
        'coach-456',
        {
          type: ConversationType.DIRECT,
          participantIds: ['user-1'],
        },
      );
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(null);

      await expect(
        service.assignCoach('member-1', assignCoachDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.assignCoach('member-1', assignCoachDto),
      ).rejects.toThrow('Member profile not found');
    });

    it('should throw BadRequestException if coach at capacity', async () => {
      mockPrismaService.memberProfile.findUnique.mockResolvedValue(mockMember);
      mockPrismaService.coachProfile.findUnique.mockResolvedValue({
        userId: 'coach-456',
        maxMembers: 20,
        isAcceptingMembers: true,
      });
      mockPrismaService.memberProfile.count.mockResolvedValue(20);

      await expect(
        service.assignCoach('member-1', assignCoachDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.assignCoach('member-1', assignCoachDto),
      ).rejects.toThrow('Coach has reached maximum member capacity');
    });
  });

  describe('getAvailableCoaches', () => {
    const mockCoaches = [
      {
        id: 'coach-profile-1',
        userId: 'coach-1',
        specialization: 'Fitness',
        bio: 'Bio 1',
        certifications: 'Cert 1',
        maxMembers: 20,
        isAcceptingMembers: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'coach-1',
          email: 'coach1@example.com',
          name: 'Coach One',
          avatarUrl: null,
        },
      },
      {
        id: 'coach-profile-2',
        userId: 'coach-2',
        specialization: 'Nutrition',
        bio: 'Bio 2',
        certifications: 'Cert 2',
        maxMembers: 10,
        isAcceptingMembers: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: 'coach-2',
          email: 'coach2@example.com',
          name: 'Coach Two',
          avatarUrl: null,
        },
      },
    ];

    it('should return available coaches with capacity', async () => {
      mockPrismaService.coachProfile.findMany.mockResolvedValue(mockCoaches);
      mockPrismaService.memberProfile.count
        .mockResolvedValueOnce(5) // Coach 1 has 5 members
        .mockResolvedValueOnce(3); // Coach 2 has 3 members

      const result = await service.getAvailableCoaches();

      expect(result).toHaveLength(2);
      expect(result[0].currentMemberCount).toBe(5);
      expect(result[0].availableCapacity).toBe(15);
      expect(result[0].isAtCapacity).toBe(false);
      expect(result[1].currentMemberCount).toBe(3);
      expect(result[1].availableCapacity).toBe(7);
      expect(result[1].isAtCapacity).toBe(false);
    });

    it('should filter out coaches at capacity', async () => {
      mockPrismaService.coachProfile.findMany.mockResolvedValue(mockCoaches);
      mockPrismaService.memberProfile.count
        .mockResolvedValueOnce(20) // Coach 1 at capacity
        .mockResolvedValueOnce(3); // Coach 2 has space

      const result = await service.getAvailableCoaches();

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('coach-2');
    });
  });
});
