import { Test, TestingModule } from '@nestjs/testing';
import { CoachAvailabilityService } from './coach-availability.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

describe('CoachAvailabilityService', () => {
  let service: CoachAvailabilityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    coachAvailability: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    sessionBooking: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoachAvailabilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CoachAvailabilityService>(CoachAvailabilityService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByCoach', () => {
    it('should return availability slots for a coach', async () => {
      const coachId = 'coach-1';
      const mockAvailability = [
        {
          id: '1',
          coachId,
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          maxSessionsPerSlot: 2,
          bufferMinutes: 15,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.coachAvailability.findMany.mockResolvedValue(
        mockAvailability,
      );

      const result = await service.findByCoach(coachId);

      expect(result).toEqual(mockAvailability);
      expect(mockPrismaService.coachAvailability.findMany).toHaveBeenCalledWith(
        {
          where: { coachId, isActive: true },
          orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        },
      );
    });
  });

  describe('create', () => {
    it('should create availability slot with valid data', async () => {
      const dto = {
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
      };

      const mockCreated = {
        id: '1',
        ...dto,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coachAvailability.findMany.mockResolvedValue([]);
      mockPrismaService.coachAvailability.create.mockResolvedValue(mockCreated);

      const result = await service.create(dto);

      expect(result).toEqual(mockCreated);
      expect(mockPrismaService.coachAvailability.create).toHaveBeenCalled();
    });

    it('should reject invalid time range', async () => {
      const dto = {
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '17:00',
        endTime: '09:00', // End before start
        maxSessionsPerSlot: 2,
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should reject overlapping slots', async () => {
      const dto = {
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
      };

      const existingSlot = {
        id: '1',
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '10:00',
        endTime: '18:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coachAvailability.findMany.mockResolvedValue([
        existingSlot,
      ]);

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update availability slot', async () => {
      const id = '1';
      const dto = {
        startTime: '10:00',
        endTime: '18:00',
      };

      const existing = {
        id,
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updated = { ...existing, ...dto };

      mockPrismaService.coachAvailability.findUnique.mockResolvedValue(
        existing,
      );
      mockPrismaService.coachAvailability.findMany.mockResolvedValue([]);
      mockPrismaService.sessionBooking.findMany.mockResolvedValue([]);
      mockPrismaService.coachAvailability.update.mockResolvedValue(updated);

      const result = await service.update(id, dto);

      expect(result).toEqual(updated);
    });

    it('should reject update with invalid time range', async () => {
      const id = '1';
      const dto = {
        startTime: '18:00',
        endTime: '10:00',
      };

      const existing = {
        id,
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coachAvailability.findUnique.mockResolvedValue(
        existing,
      );

      await expect(service.update(id, dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete availability slot without bookings', async () => {
      const id = '1';
      const existing = {
        id,
        coachId: 'coach-1',
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coachAvailability.findUnique.mockResolvedValue(
        existing,
      );
      mockPrismaService.sessionBooking.findMany.mockResolvedValue([]);
      mockPrismaService.coachAvailability.delete.mockResolvedValue(existing);

      await service.delete(id);

      expect(mockPrismaService.coachAvailability.delete).toHaveBeenCalledWith({
        where: { id },
      });
    });

    it('should reject delete with existing bookings', async () => {
      const id = '1';
      const existing = {
        id,
        coachId: 'coach-1',
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create a date that is a Monday (dayOfWeek: 1)
      const mondayDate = new Date('2025-01-06'); // This is a Monday

      const booking = {
        id: 'booking-1',
        coachId: 'coach-1',
        requestedDate: mondayDate,
        requestedTime: '10:00',
        duration: 60,
        status: 'confirmed',
      };

      mockPrismaService.coachAvailability.findUnique.mockResolvedValue(
        existing,
      );
      mockPrismaService.sessionBooking.findMany.mockResolvedValue([booking]);

      await expect(service.delete(id)).rejects.toThrow(ConflictException);
    });
  });

  describe('checkSlotAvailability', () => {
    it('should return true for available slot', async () => {
      const coachId = 'coach-1';
      const date = new Date('2025-01-06'); // Monday
      const time = '10:00';

      const availability = {
        id: '1',
        coachId,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coachAvailability.findFirst.mockResolvedValue(
        availability,
      );
      mockPrismaService.sessionBooking.count.mockResolvedValue(1); // 1 booking, capacity is 2

      const result = await service.checkSlotAvailability(coachId, date, time);

      expect(result).toBe(true);
    });

    it('should return false for full slot', async () => {
      const coachId = 'coach-1';
      const date = new Date('2025-01-06'); // Monday
      const time = '10:00';

      const availability = {
        id: '1',
        coachId,
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 2,
        bufferMinutes: 15,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.coachAvailability.findFirst.mockResolvedValue(
        availability,
      );
      mockPrismaService.sessionBooking.count.mockResolvedValue(2); // Full capacity

      const result = await service.checkSlotAvailability(coachId, date, time);

      expect(result).toBe(false);
    });

    it('should return false when no availability exists', async () => {
      const coachId = 'coach-1';
      const date = new Date('2025-01-06');
      const time = '10:00';

      mockPrismaService.coachAvailability.findFirst.mockResolvedValue(null);

      const result = await service.checkSlotAvailability(coachId, date, time);

      expect(result).toBe(false);
    });
  });
});
