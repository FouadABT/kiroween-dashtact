import { Test, TestingModule } from '@nestjs/testing';
import { CalendarService } from './calendar.service';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarRemindersService } from './calendar-reminders.service';
import { EventFilterDto } from './dto/event-filter.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, EventVisibility } from '@prisma/client';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('CalendarService', () => {
  let service: CalendarService;
  let prisma: PrismaService;
  let remindersService: CalendarRemindersService;

  const mockPrismaService = {
    calendarEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    eventCategory: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    eventAttendee: {
      createMany: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    eventReminder: {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    eventEntityLink: {
      createMany: jest.fn(),
    },
    recurrenceRule: {
      create: jest.fn(),
      update: jest.fn(),
    },
    activityLog: {
      create: jest.fn(),
    },
  };

  const mockRemindersService = {
    notifyAttendeeAdded: jest.fn().mockResolvedValue(undefined),
    notifyEventUpdate: jest.fn().mockResolvedValue(undefined),
    cancelEventReminders: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CalendarService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CalendarRemindersService,
          useValue: mockRemindersService,
        },
      ],
    }).compile();

    service = module.get<CalendarService>(CalendarService);
    prisma = module.get<PrismaService>(PrismaService);
    remindersService = module.get<CalendarRemindersService>(CalendarRemindersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll - Event Filtering', () => {
    const userId = 'user-123';
    const mockEvents = [
      {
        id: 'event-1',
        title: 'Team Meeting',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        categoryId: 'cat-1',
        status: EventStatus.SCHEDULED,
        visibility: EventVisibility.PUBLIC,
        creatorId: userId,
        category: { id: 'cat-1', name: 'Meeting', color: '#3B82F6' },
        creator: { id: userId, name: 'John Doe', email: 'john@example.com' },
        attendees: [],
        reminders: [],
        recurrenceRule: null,
        linkedEntities: [],
      },
    ];

    beforeEach(() => {
      mockPrismaService.calendarEvent.findMany.mockResolvedValue(mockEvents);
      mockPrismaService.calendarEvent.count.mockResolvedValue(1);
    });

    it('should filter by single category (string)', async () => {
      const filters: EventFilterDto = {
        categories: ['cat-1'],
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: { in: ['cat-1'] },
          }),
        })
      );
    });

    it('should filter by multiple categories (array)', async () => {
      const filters: EventFilterDto = {
        categories: ['cat-1', 'cat-2'],
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: { in: ['cat-1', 'cat-2'] },
          }),
        })
      );
    });

    it('should filter by single user', async () => {
      const filters: EventFilterDto = {
        users: ['user-456'],
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { creatorId: { in: ['user-456'] } },
                  { attendees: { some: { userId: { in: ['user-456'] } } } },
                ]),
              }),
            ]),
          }),
        })
      );
    });

    it('should filter by multiple statuses', async () => {
      const filters: EventFilterDto = {
        statuses: [EventStatus.SCHEDULED, EventStatus.COMPLETED],
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: [EventStatus.SCHEDULED, EventStatus.COMPLETED] },
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      const filters: EventFilterDto = {
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              { endTime: { gte: new Date('2024-01-01T00:00:00Z') } },
              { startTime: { lte: new Date('2024-01-31T23:59:59Z') } },
            ]),
          }),
        })
      );
    });

    it('should filter by search term', async () => {
      const filters: EventFilterDto = {
        search: 'meeting',
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            AND: expect.arrayContaining([
              expect.objectContaining({
                OR: expect.arrayContaining([
                  { title: { contains: 'meeting', mode: 'insensitive' } },
                  { description: { contains: 'meeting', mode: 'insensitive' } },
                  { location: { contains: 'meeting', mode: 'insensitive' } },
                ]),
              }),
            ]),
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      const filters: EventFilterDto = {
        categories: ['cat-1'],
        statuses: [EventStatus.SCHEDULED],
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
      };

      await service.findAll(userId, filters, 1, 50);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            categoryId: { in: ['cat-1'] },
            status: { in: [EventStatus.SCHEDULED] },
            AND: expect.any(Array),
          }),
        })
      );
    });

    it('should respect pagination', async () => {
      await service.findAll(userId, {}, 2, 10);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should enforce max limit of 100', async () => {
      await service.findAll(userId, {}, 1, 200);

      expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should return paginated results', async () => {
      const result = await service.findAll(userId, {}, 1, 50);

      expect(result).toEqual({
        events: mockEvents,
        total: 1,
        page: 1,
        limit: 50,
      });
    });
  });

  describe('create', () => {
    const userId = 'user-123';
    const mockCategory = {
      id: 'cat-1',
      name: 'Meeting',
      color: '#3B82F6',
      isActive: true,
    };
    const mockUser = {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
    };

    beforeEach(() => {
      mockPrismaService.eventCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.calendarEvent.create.mockResolvedValue({
        id: 'event-1',
        title: 'Test Event',
        startTime: new Date('2024-01-15T10:00:00Z'),
        endTime: new Date('2024-01-15T11:00:00Z'),
        categoryId: 'cat-1',
        creatorId: userId,
      });
    });

    it('should create event with valid data', async () => {
      const dto: CreateEventDto = {
        title: 'Test Event',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        categoryId: 'cat-1',
      };

      await service.create(dto, userId);

      expect(prisma.calendarEvent.create).toHaveBeenCalled();
      expect(prisma.activityLog.create).toHaveBeenCalled();
    });

    it('should reject event with end time before start time', async () => {
      const dto: CreateEventDto = {
        title: 'Test Event',
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T10:00:00Z',
        categoryId: 'cat-1',
      };

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
    });

    it('should reject event with non-existent category', async () => {
      mockPrismaService.eventCategory.findUnique.mockResolvedValue(null);

      const dto: CreateEventDto = {
        title: 'Test Event',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        categoryId: 'invalid-cat',
      };

      await expect(service.create(dto, userId)).rejects.toThrow(NotFoundException);
    });

    it('should reject event with inactive category', async () => {
      mockPrismaService.eventCategory.findUnique.mockResolvedValue({
        ...mockCategory,
        isActive: false,
      });

      const dto: CreateEventDto = {
        title: 'Test Event',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        categoryId: 'cat-1',
      };

      await expect(service.create(dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    const userId = 'user-123';
    const eventId = 'event-1';

    it('should return event for creator', async () => {
      const mockEvent = {
        id: eventId,
        title: 'Test Event',
        creatorId: userId,
        visibility: EventVisibility.PRIVATE,
        attendees: [],
      };

      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne(eventId, userId);

      expect(result).toEqual(mockEvent);
    });

    it('should return public event for non-creator', async () => {
      const mockEvent = {
        id: eventId,
        title: 'Test Event',
        creatorId: 'other-user',
        visibility: EventVisibility.PUBLIC,
        attendees: [],
      };

      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      const result = await service.findOne(eventId, userId);

      expect(result).toEqual(mockEvent);
    });

    it('should reject private event for non-creator non-attendee', async () => {
      const mockEvent = {
        id: eventId,
        title: 'Test Event',
        creatorId: 'other-user',
        visibility: EventVisibility.PRIVATE,
        attendees: [],
      };

      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);

      await expect(service.findOne(eventId, userId)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(null);

      await expect(service.findOne(eventId, userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const eventId = 'event-1';
    const mockEvent = {
      id: eventId,
      title: 'Original Title',
      creatorId: userId,
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      categoryId: 'cat-1',
      visibility: EventVisibility.PUBLIC,
      status: EventStatus.SCHEDULED,
      attendees: [],
      reminders: [],
      recurrenceRule: null,
      category: { id: 'cat-1', name: 'Meeting' },
      creator: { id: userId, name: 'John' },
    };

    beforeEach(() => {
      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.calendarEvent.update.mockResolvedValue({
        ...mockEvent,
        title: 'Updated Title',
      });
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should update event by creator', async () => {
      const dto: UpdateEventDto = {
        title: 'Updated Title',
      };

      await service.update(eventId, dto, userId);

      expect(prisma.calendarEvent.update).toHaveBeenCalled();
      expect(prisma.activityLog.create).toHaveBeenCalled();
    });

    it('should reject update by non-creator', async () => {
      const dto: UpdateEventDto = {
        title: 'Updated Title',
      };

      await expect(service.update(eventId, dto, 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should reject invalid time range', async () => {
      const dto: UpdateEventDto = {
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T10:00:00Z',
      };

      await expect(service.update(eventId, dto, userId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const eventId = 'event-1';
    const mockEvent = {
      id: eventId,
      title: 'Test Event',
      creatorId: userId,
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      attendees: [],
      category: { name: 'Meeting' },
      creator: { id: userId, name: 'John' },
      visibility: EventVisibility.PUBLIC,
    };

    beforeEach(() => {
      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(mockEvent);
      mockPrismaService.calendarEvent.delete.mockResolvedValue(mockEvent);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        name: 'John Doe',
        email: 'john@example.com',
      });
    });

    it('should delete event by creator', async () => {
      await service.delete(eventId, userId);

      expect(prisma.calendarEvent.delete).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(remindersService.cancelEventReminders).toHaveBeenCalledWith(eventId);
      expect(prisma.activityLog.create).toHaveBeenCalled();
    });

    it('should reject delete by non-creator', async () => {
      await expect(service.delete(eventId, 'other-user')).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for non-existent event', async () => {
      mockPrismaService.calendarEvent.findUnique.mockResolvedValue(null);

      await expect(service.delete(eventId, userId)).rejects.toThrow(NotFoundException);
    });
  });
});
