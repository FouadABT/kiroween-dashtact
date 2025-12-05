import { Test, TestingModule } from '@nestjs/testing';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarRemindersService } from './calendar-reminders.service';
import { EventFilterDto } from './dto/event-filter.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus, EventVisibility } from '@prisma/client';

describe('CalendarController', () => {
  let controller: CalendarController;
  let service: CalendarService;
  let prisma: PrismaService;
  let remindersService: CalendarRemindersService;

  const mockCalendarService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockPrismaService = {
    eventCategory: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
    },
    calendarSettings: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    calendarEvent: {
      updateMany: jest.fn(),
    },
  };

  const mockRemindersService = {
    notifyEventUpdate: jest.fn().mockResolvedValue(undefined),
    cancelEventReminders: jest.fn().mockResolvedValue(undefined),
  };

  const mockRequest = {
    user: {
      userId: 'user-123',
      email: 'test@example.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarController],
      providers: [
        {
          provide: CalendarService,
          useValue: mockCalendarService,
        },
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

    controller = module.get<CalendarController>(CalendarController);
    service = module.get<CalendarService>(CalendarService);
    prisma = module.get<PrismaService>(PrismaService);
    remindersService = module.get<CalendarRemindersService>(CalendarRemindersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /calendar/events', () => {
    it('should return events with filters', async () => {
      const filters: EventFilterDto = {
        categories: ['cat-1'],
        statuses: [EventStatus.SCHEDULED],
      };

      const mockResult = {
        events: [
          {
            id: 'event-1',
            title: 'Test Event',
            startTime: new Date(),
            endTime: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      };

      mockCalendarService.findAll.mockResolvedValue(mockResult);

      const result = await controller.getEvents(mockRequest, filters, 1, 50);

      expect(service.findAll).toHaveBeenCalledWith('user-123', filters, 1, 50);
      expect(result).toEqual(mockResult);
    });

    it('should handle single category filter', async () => {
      const filters: EventFilterDto = {
        categories: ['cat-1'],
      };

      mockCalendarService.findAll.mockResolvedValue({
        events: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      await controller.getEvents(mockRequest, filters, 1, 50);

      expect(service.findAll).toHaveBeenCalledWith(
        'user-123',
        expect.objectContaining({ categories: ['cat-1'] }),
        1,
        50
      );
    });

    it('should handle multiple filters', async () => {
      const filters: EventFilterDto = {
        categories: ['cat-1', 'cat-2'],
        users: ['user-456'],
        statuses: [EventStatus.SCHEDULED, EventStatus.COMPLETED],
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-01-31T23:59:59Z',
        search: 'meeting',
      };

      mockCalendarService.findAll.mockResolvedValue({
        events: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      await controller.getEvents(mockRequest, filters, 1, 50);

      expect(service.findAll).toHaveBeenCalledWith('user-123', filters, 1, 50);
    });

    it('should use default pagination values', async () => {
      mockCalendarService.findAll.mockResolvedValue({
        events: [],
        total: 0,
        page: 1,
        limit: 50,
      });

      await controller.getEvents(mockRequest, {}, 1, 50);

      expect(service.findAll).toHaveBeenCalledWith('user-123', {}, 1, 50);
    });
  });

  describe('GET /calendar/events/:id', () => {
    it('should return single event', async () => {
      const mockEvent = {
        id: 'event-1',
        title: 'Test Event',
        startTime: new Date(),
        endTime: new Date(),
      };

      mockCalendarService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.getEvent(mockRequest, 'event-1');

      expect(service.findOne).toHaveBeenCalledWith('event-1', 'user-123');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('POST /calendar/events', () => {
    it('should create event', async () => {
      const dto: CreateEventDto = {
        title: 'New Event',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:00:00Z',
        categoryId: 'cat-1',
      };

      const mockEvent = {
        id: 'event-1',
        ...dto,
        creatorId: 'user-123',
      };

      mockCalendarService.create.mockResolvedValue(mockEvent);

      const result = await controller.createEvent(mockRequest, dto);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-123');
      expect(result).toEqual(mockEvent);
    });
  });

  describe('PUT /calendar/events/:id', () => {
    it('should update event', async () => {
      const dto: UpdateEventDto = {
        title: 'Updated Event',
      };

      const mockEvent = {
        id: 'event-1',
        title: 'Updated Event',
        startTime: new Date(),
        endTime: new Date(),
      };

      mockCalendarService.update.mockResolvedValue(mockEvent);

      const result = await controller.updateEvent(mockRequest, 'event-1', dto);

      expect(service.update).toHaveBeenCalledWith('event-1', dto, 'user-123');
      expect(remindersService.notifyEventUpdate).toHaveBeenCalledWith('event-1', 'updated');
      expect(result).toEqual(mockEvent);
    });

    it('should not notify on cancelled event', async () => {
      const dto: UpdateEventDto = {
        status: EventStatus.CANCELLED,
      };

      const mockEvent = {
        id: 'event-1',
        status: EventStatus.CANCELLED,
        startTime: new Date(),
        endTime: new Date(),
      };

      mockCalendarService.update.mockResolvedValue(mockEvent);

      await controller.updateEvent(mockRequest, 'event-1', dto);

      expect(remindersService.notifyEventUpdate).not.toHaveBeenCalled();
    });
  });

  describe('DELETE /calendar/events/:id', () => {
    it('should delete event', async () => {
      mockCalendarService.delete.mockResolvedValue(undefined);

      const result = await controller.deleteEvent(mockRequest, 'event-1');

      expect(remindersService.notifyEventUpdate).toHaveBeenCalledWith('event-1', 'cancelled');
      expect(remindersService.cancelEventReminders).toHaveBeenCalledWith('event-1');
      expect(service.delete).toHaveBeenCalledWith('event-1', 'user-123');
      expect(result).toEqual({ message: 'Event deleted successfully' });
    });
  });

  describe('GET /calendar/categories', () => {
    it('should return active categories', async () => {
      const mockCategories = [
        { id: 'cat-1', name: 'Meeting', isActive: true, displayOrder: 1 },
        { id: 'cat-2', name: 'Task', isActive: true, displayOrder: 2 },
      ];

      mockPrismaService.eventCategory.findMany.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(prisma.eventCategory.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      });
      expect(result).toEqual(mockCategories);
    });
  });

  describe('POST /calendar/categories', () => {
    it('should create category', async () => {
      const dto = {
        name: 'New Category',
        description: 'Test description',
        color: '#FF0000',
        icon: 'calendar',
        displayOrder: 1,
        isActive: true,
      };

      const mockCategory = {
        id: 'cat-1',
        ...dto,
        slug: 'new-category',
        isSystem: false,
      };

      mockPrismaService.eventCategory.create.mockResolvedValue(mockCategory);

      const result = await controller.createCategory(dto);

      expect(prisma.eventCategory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Category',
          slug: 'new-category',
          isSystem: false,
        }),
      });
      expect(result).toEqual(mockCategory);
    });

    it('should generate slug from name', async () => {
      const dto = {
        name: 'Test Category Name',
        color: '#FF0000',
      };

      mockPrismaService.eventCategory.create.mockResolvedValue({
        id: 'cat-1',
        ...dto,
        slug: 'test-category-name',
      });

      await controller.createCategory(dto);

      expect(prisma.eventCategory.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'test-category-name',
        }),
      });
    });
  });

  describe('PUT /calendar/categories/:id', () => {
    it('should update category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Original',
        isSystem: false,
      };

      const dto = {
        name: 'Updated Category',
        color: '#00FF00',
      };

      mockPrismaService.eventCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.eventCategory.update.mockResolvedValue({
        ...mockCategory,
        ...dto,
        slug: 'updated-category',
      });

      const result = await controller.updateCategory('cat-1', dto);

      expect(prisma.eventCategory.update).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
        data: expect.objectContaining({
          name: 'Updated Category',
          slug: 'updated-category',
        }),
      });
      expect(result).toBeDefined();
    });

    it('should reject updating system category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'System Category',
        isSystem: true,
      };

      mockPrismaService.eventCategory.findUnique.mockResolvedValue(mockCategory);

      await expect(controller.updateCategory('cat-1', { name: 'New Name' })).rejects.toThrow(
        'Cannot modify system categories'
      );
    });
  });

  describe('DELETE /calendar/categories/:id', () => {
    it('should delete category without events', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Test Category',
        isSystem: false,
        _count: { events: 0 },
      };

      mockPrismaService.eventCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.eventCategory.delete.mockResolvedValue(mockCategory);

      const result = await controller.deleteCategory('cat-1');

      expect(prisma.eventCategory.delete).toHaveBeenCalledWith({ where: { id: 'cat-1' } });
      expect(result).toEqual({ message: 'Category deleted successfully' });
    });

    it('should reassign events before deleting category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'Test Category',
        isSystem: false,
        _count: { events: 5 },
      };

      const mockDefaultCategory = {
        id: 'cat-default',
        name: 'Uncategorized',
        slug: 'uncategorized',
      };

      mockPrismaService.eventCategory.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.eventCategory.findFirst.mockResolvedValue(mockDefaultCategory);
      mockPrismaService.eventCategory.delete.mockResolvedValue(mockCategory);

      await controller.deleteCategory('cat-1');

      expect(prisma.calendarEvent.updateMany).toHaveBeenCalledWith({
        where: { categoryId: 'cat-1' },
        data: { categoryId: 'cat-default' },
      });
      expect(prisma.eventCategory.delete).toHaveBeenCalled();
    });

    it('should reject deleting system category', async () => {
      const mockCategory = {
        id: 'cat-1',
        name: 'System Category',
        isSystem: true,
        _count: { events: 0 },
      };

      mockPrismaService.eventCategory.findUnique.mockResolvedValue(mockCategory);

      await expect(controller.deleteCategory('cat-1')).rejects.toThrow(
        'Cannot delete system categories'
      );
    });
  });

  describe('GET /calendar/settings', () => {
    it('should return existing settings', async () => {
      const mockSettings = {
        id: 'settings-1',
        userId: 'user-123',
        defaultView: 'month',
        weekStartsOn: 0,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        workingDays: [1, 2, 3, 4, 5],
        timeZone: 'UTC',
        defaultReminders: [15],
        showWeekNumbers: false,
      };

      mockPrismaService.calendarSettings.findUnique.mockResolvedValue(mockSettings);

      const result = await controller.getSettings(mockRequest);

      expect(result).toEqual(mockSettings);
    });

    it('should create default settings if none exist', async () => {
      const mockSettings = {
        id: 'settings-1',
        userId: 'user-123',
        defaultView: 'month',
        weekStartsOn: 0,
        workingHoursStart: '09:00',
        workingHoursEnd: '17:00',
        workingDays: [1, 2, 3, 4, 5],
        timeZone: 'UTC',
        defaultReminders: [15],
        showWeekNumbers: false,
      };

      mockPrismaService.calendarSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.calendarSettings.create.mockResolvedValue(mockSettings);

      const result = await controller.getSettings(mockRequest);

      expect(prisma.calendarSettings.create).toHaveBeenCalled();
      expect(result).toEqual(mockSettings);
    });
  });

  describe('PUT /calendar/settings', () => {
    it('should update existing settings', async () => {
      const dto = {
        defaultView: 'week' as const,
        weekStartsOn: 1,
      };

      const mockSettings = {
        id: 'settings-1',
        userId: 'user-123',
        ...dto,
      };

      mockPrismaService.calendarSettings.findUnique.mockResolvedValue({ id: 'settings-1' });
      mockPrismaService.calendarSettings.update.mockResolvedValue(mockSettings);

      const result = await controller.updateSettings(mockRequest, dto);

      expect(prisma.calendarSettings.update).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        data: dto,
      });
      expect(result).toEqual(mockSettings);
    });

    it('should create settings if none exist', async () => {
      const dto = {
        defaultView: 'week' as const,
        weekStartsOn: 1,
      };

      const mockSettings = {
        id: 'settings-1',
        userId: 'user-123',
        ...dto,
      };

      mockPrismaService.calendarSettings.findUnique.mockResolvedValue(null);
      mockPrismaService.calendarSettings.create.mockResolvedValue(mockSettings);

      const result = await controller.updateSettings(mockRequest, dto);

      expect(prisma.calendarSettings.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          ...dto,
        },
      });
      expect(result).toEqual(mockSettings);
    });
  });
});
