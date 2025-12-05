import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  GetAvailableSlotsDto,
  AvailableSlot,
} from './dto';

@Injectable()
export class CoachAvailabilityService {
  constructor(private prisma: PrismaService) {}

  async findByCoach(coachId: string) {
    return this.prisma.coachAvailability.findMany({
      where: { coachId, isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const availability = await this.prisma.coachAvailability.findUnique({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException('Availability slot not found');
    }

    return availability;
  }

  async create(dto: CreateAvailabilityDto) {
    // Ensure coachId is provided (should be set by controller)
    if (!dto.coachId) {
      throw new BadRequestException('Coach ID is required');
    }

    // Validate time range
    if (!this.isValidTimeRange(dto.startTime, dto.endTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Check for overlapping slots
    const hasOverlap = await this.checkOverlap(
      dto.coachId,
      dto.dayOfWeek,
      dto.startTime,
      dto.endTime,
    );

    if (hasOverlap) {
      throw new ConflictException(
        'This availability slot overlaps with an existing slot',
      );
    }

    return this.prisma.coachAvailability.create({
      data: {
        coachId: dto.coachId,
        dayOfWeek: dto.dayOfWeek,
        startTime: dto.startTime,
        endTime: dto.endTime,
        maxSessionsPerSlot: dto.maxSessionsPerSlot,
        bufferMinutes: dto.bufferMinutes ?? 15,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, dto: UpdateAvailabilityDto) {
    const existing = await this.findOne(id);

    // If updating time range, validate it
    const newStartTime = dto.startTime ?? existing.startTime;
    const newEndTime = dto.endTime ?? existing.endTime;

    if (!this.isValidTimeRange(newStartTime, newEndTime)) {
      throw new BadRequestException('Start time must be before end time');
    }

    // If updating time range, check for overlaps (excluding current slot)
    const newDayOfWeek = dto.dayOfWeek ?? existing.dayOfWeek;
    if (
      dto.startTime ||
      dto.endTime ||
      (dto.dayOfWeek !== undefined && dto.dayOfWeek !== existing.dayOfWeek)
    ) {
      const hasOverlap = await this.checkOverlap(
        existing.coachId,
        newDayOfWeek,
        newStartTime,
        newEndTime,
        id,
      );

      if (hasOverlap) {
        throw new ConflictException(
          'Updated availability slot overlaps with an existing slot',
        );
      }
    }

    // Check if there are existing bookings that conflict with new times
    if (dto.startTime || dto.endTime || dto.dayOfWeek !== undefined) {
      const hasBookings = await this.hasExistingBookings(
        existing.coachId,
        newDayOfWeek,
        newStartTime,
        newEndTime,
      );

      if (hasBookings) {
        throw new ConflictException(
          'Cannot update availability: existing bookings conflict with new times',
        );
      }
    }

    return this.prisma.coachAvailability.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string) {
    const existing = await this.findOne(id);

    // Check if there are existing bookings
    const hasBookings = await this.hasExistingBookings(
      existing.coachId,
      existing.dayOfWeek,
      existing.startTime,
      existing.endTime,
    );

    if (hasBookings) {
      throw new ConflictException(
        'Cannot delete availability: existing bookings exist for this slot',
      );
    }

    await this.prisma.coachAvailability.delete({
      where: { id },
    });
  }

  async getAvailableSlots(
    coachId: string,
    dto: GetAvailableSlotsDto,
  ): Promise<AvailableSlot[]> {
    const duration = dto.duration ?? 60;
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    // Get coach's availability
    const availability = await this.findByCoach(coachId);

    if (availability.length === 0) {
      return [];
    }

    // Get existing bookings in the date range
    const bookings = await this.prisma.sessionBooking.findMany({
      where: {
        coachId,
        requestedDate: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      select: {
        requestedDate: true,
        requestedTime: true,
        duration: true,
      },
    });

    const slots: AvailableSlot[] = [];

    // Iterate through each day in the range
    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const dayOfWeek = date.getDay();

      // Find availability for this day
      const dayAvailability = availability.filter(
        (a) => a.dayOfWeek === dayOfWeek,
      );

      for (const avail of dayAvailability) {
        // Generate time slots within this availability window
        const timeSlots = this.generateTimeSlots(
          avail.startTime,
          avail.endTime,
          duration,
          avail.bufferMinutes,
        );

        for (const timeSlot of timeSlots) {
          // Count existing bookings for this slot
          const bookingCount = this.countBookingsForSlot(
            bookings,
            new Date(date),
            timeSlot,
            duration,
            avail.bufferMinutes,
          );

          const availableCapacity = avail.maxSessionsPerSlot - bookingCount;

          if (availableCapacity > 0) {
            slots.push({
              date: new Date(date),
              time: timeSlot,
              availableCapacity,
              maxCapacity: avail.maxSessionsPerSlot,
            });
          }
        }
      }
    }

    return slots;
  }

  async checkSlotAvailability(
    coachId: string,
    date: Date,
    time: string,
    duration: number = 60,
  ): Promise<boolean> {
    const dayOfWeek = date.getDay();

    // Find matching availability
    const availability = await this.prisma.coachAvailability.findFirst({
      where: {
        coachId,
        dayOfWeek,
        isActive: true,
      },
    });

    if (!availability) {
      return false;
    }

    // Check if time falls within availability window
    if (!this.isTimeInRange(time, availability.startTime, availability.endTime)) {
      return false;
    }

    // Count existing bookings
    const bookingCount = await this.prisma.sessionBooking.count({
      where: {
        coachId,
        requestedDate: {
          gte: new Date(date.setHours(0, 0, 0, 0)),
          lt: new Date(date.setHours(23, 59, 59, 999)),
        },
        requestedTime: time,
        status: {
          in: ['pending', 'confirmed'],
        },
      },
    });

    return bookingCount < availability.maxSessionsPerSlot;
  }

  // Helper methods

  private isValidTimeRange(startTime: string, endTime: string): boolean {
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return start < end;
  }

  private async checkOverlap(
    coachId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<boolean> {
    const existing = await this.prisma.coachAvailability.findMany({
      where: {
        coachId,
        dayOfWeek,
        isActive: true,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    const newStart = this.timeToMinutes(startTime);
    const newEnd = this.timeToMinutes(endTime);

    for (const slot of existing) {
      const existingStart = this.timeToMinutes(slot.startTime);
      const existingEnd = this.timeToMinutes(slot.endTime);

      // Check for overlap
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }

    return false;
  }

  private async hasExistingBookings(
    coachId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ): Promise<boolean> {
    // Get all future bookings for this coach on this day of week
    const bookings = await this.prisma.sessionBooking.findMany({
      where: {
        coachId,
        requestedDate: {
          gte: new Date(),
        },
        status: {
          in: ['pending', 'confirmed'],
        },
      },
      select: {
        requestedDate: true,
        requestedTime: true,
      },
    });

    // Filter bookings that match the day of week and time range
    for (const booking of bookings) {
      if (booking.requestedDate.getDay() === dayOfWeek) {
        const bookingTime = this.timeToMinutes(booking.requestedTime);
        const slotStart = this.timeToMinutes(startTime);
        const slotEnd = this.timeToMinutes(endTime);

        if (bookingTime >= slotStart && bookingTime < slotEnd) {
          return true;
        }
      }
    }

    return false;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    duration: number,
    bufferMinutes: number,
  ): string[] {
    const slots: string[] = [];
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    const slotDuration = duration + bufferMinutes;

    for (let time = start; time + duration <= end; time += slotDuration) {
      slots.push(this.minutesToTime(time));
    }

    return slots;
  }

  private countBookingsForSlot(
    bookings: Array<{ requestedDate: Date; requestedTime: string; duration: number }>,
    date: Date,
    time: string,
    duration: number,
    bufferMinutes: number,
  ): number {
    const slotStart = this.timeToMinutes(time);
    const slotEnd = slotStart + duration + bufferMinutes;

    return bookings.filter((booking) => {
      // Check if booking is on the same date
      if (
        booking.requestedDate.toDateString() !== date.toDateString()
      ) {
        return false;
      }

      const bookingStart = this.timeToMinutes(booking.requestedTime);
      const bookingEnd = bookingStart + booking.duration;

      // Check for overlap
      return bookingStart < slotEnd && bookingEnd > slotStart;
    }).length;
  }

  private isTimeInRange(
    time: string,
    startTime: string,
    endTime: string,
  ): boolean {
    const t = this.timeToMinutes(time);
    const start = this.timeToMinutes(startTime);
    const end = this.timeToMinutes(endTime);
    return t >= start && t < end;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}
