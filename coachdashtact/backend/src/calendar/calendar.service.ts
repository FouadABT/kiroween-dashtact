import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarRemindersService } from './calendar-reminders.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { EventVisibility } from '@prisma/client';

export interface PaginatedEvents {
  events: any[];
  total: number;
  page?: number;
  limit: number;
}

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly remindersService: CalendarRemindersService,
  ) {}

  /**
   * Create a new calendar event
   * Validates time range and category existence
   */
  async create(dto: CreateEventDto, userId: string): Promise<any> {
    try {
      // Validate userId
      if (!userId) {
        throw new BadRequestException('User ID is required. Please log out and log back in to refresh your session.');
      }

      // Validate time range
      const startTime = new Date(dto.startTime);
      const endTime = new Date(dto.endTime);

      if (endTime < startTime) {
        throw new BadRequestException('Event end time must be after start time');
      }

      // Verify category exists
      const category = await this.prisma.eventCategory.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Event category with ID ${dto.categoryId} not found`);
      }

      if (!category.isActive) {
        throw new BadRequestException('Cannot create event with inactive category');
      }

      // Create recurrence rule if provided
      let recurrenceRuleId: string | undefined;
      if (dto.recurrenceRule) {
        const recurrenceRule = await this.prisma.recurrenceRule.create({
          data: {
            frequency: dto.recurrenceRule.frequency,
            interval: dto.recurrenceRule.interval || 1,
            byDay: dto.recurrenceRule.byDay || [],
            byMonthDay: dto.recurrenceRule.byMonthDay || [],
            byMonth: dto.recurrenceRule.byMonth || [],
            count: dto.recurrenceRule.count,
            until: dto.recurrenceRule.until ? new Date(dto.recurrenceRule.until) : undefined,
            exceptions: dto.recurrenceRule.exceptions?.map(d => new Date(d)) || [],
          },
        });
        recurrenceRuleId = recurrenceRule.id;
      }

      // Get user info for audit log
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      // Create the event
      const event = await this.prisma.calendarEvent.create({
        data: {
          title: dto.title,
          description: dto.description,
          startTime,
          endTime,
          allDay: dto.allDay || false,
          location: dto.location,
          color: dto.color,
          categoryId: dto.categoryId,
          visibility: dto.visibility || EventVisibility.PUBLIC,
          creatorId: userId,
          recurrenceRuleId,
          metadata: dto.metadata,
        },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          recurrenceRule: true,
        },
      });

      // Log event creation
      await this.prisma.activityLog.create({
        data: {
          action: 'calendar.event.created',
          userId,
          actorName: user?.name || user?.email || 'Unknown User',
          entityType: 'calendar_event',
          entityId: event.id,
          metadata: {
            title: event.title,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            category: category.name,
            visibility: event.visibility,
            hasRecurrence: !!recurrenceRuleId,
            attendeeCount: dto.attendeeIds?.length || 0,
          },
        },
      });

      // Create attendees if provided
      if (dto.attendeeIds && dto.attendeeIds.length > 0) {
        // Remove duplicates and exclude creator
        const uniqueAttendeeIds = [...new Set(dto.attendeeIds)].filter(id => id !== userId);

        // Verify all attendees exist
        const users = await this.prisma.user.findMany({
          where: { id: { in: uniqueAttendeeIds } },
          select: { id: true },
        });

        if (users.length !== uniqueAttendeeIds.length) {
          throw new NotFoundException('One or more attendees not found');
        }

        // Create attendee records
        await this.prisma.eventAttendee.createMany({
          data: uniqueAttendeeIds.map(attendeeId => ({
            eventId: event.id,
            userId: attendeeId,
            responseStatus: 'PENDING',
            isOrganizer: false,
          })),
        });

        // Add creator as organizer
        await this.prisma.eventAttendee.create({
          data: {
            eventId: event.id,
            userId,
            responseStatus: 'ACCEPTED',
            isOrganizer: true,
          },
        });
      }

      // Create reminders if provided
      if (dto.reminders && dto.reminders.length > 0) {
        // Remove duplicates
        const uniqueReminders = [...new Set(dto.reminders)];

        await this.prisma.eventReminder.createMany({
          data: uniqueReminders.map(minutesBefore => ({
            eventId: event.id,
            userId,
            minutesBefore,
          })),
        });
      }

      // Create entity links if provided
      if (dto.linkedEntities && dto.linkedEntities.length > 0) {
        await this.prisma.eventEntityLink.createMany({
          data: dto.linkedEntities.map(link => ({
            eventId: event.id,
            entityType: link.entityType,
            entityId: link.entityId,
            metadata: link.metadata,
          })),
        });
      }

      // Fetch complete event with all relations
      const createdEvent = await this.findOne(event.id, userId);

      // Send invitation notifications to attendees (async, don't wait)
      if (dto.attendeeIds && dto.attendeeIds.length > 0) {
        const uniqueAttendeeIds = [...new Set(dto.attendeeIds)].filter(id => id !== userId);
        for (const attendeeId of uniqueAttendeeIds) {
          this.remindersService.notifyAttendeeAdded(event.id, attendeeId).catch(err => {
            this.logger.error(`Failed to send invitation notification: ${err.message}`);
          });
        }
      }

      return createdEvent;
    } catch (error) {
      this.logger.error(`Failed to create event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find all events with filters and pagination
   * Enforces visibility and permission checks
   */
  async findAll(
    userId: string,
    filters: EventFilterDto,
    page: number = 1,
    limit: number = 50,
  ): Promise<PaginatedEvents> {
    try {
      const skip = (page - 1) * limit;
      const take = Math.min(limit, 100); // Max 100 per page

      // Build where clause
      const where: any = {};

      // Visibility filter - show events user has access to
      where.OR = [
        { visibility: EventVisibility.PUBLIC },
        { creatorId: userId },
        {
          attendees: {
            some: {
              userId,
            },
          },
        },
      ];

      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        where.categoryId = { in: filters.categories };
      }

      // Status filter
      if (filters.statuses && filters.statuses.length > 0) {
        where.status = { in: filters.statuses };
      }

      // Date range filter
      if (filters.startDate || filters.endDate) {
        where.AND = where.AND || [];
        
        if (filters.startDate) {
          where.AND.push({
            endTime: { gte: new Date(filters.startDate) },
          });
        }
        
        if (filters.endDate) {
          where.AND.push({
            startTime: { lte: new Date(filters.endDate) },
          });
        }
      }

      // User filter (creator or attendee)
      if (filters.users && filters.users.length > 0) {
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { creatorId: { in: filters.users } },
            {
              attendees: {
                some: {
                  userId: { in: filters.users },
                },
              },
            },
          ],
        });
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        where.AND = where.AND || [];
        where.AND.push({
          OR: [
            { title: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { location: { contains: searchTerm, mode: 'insensitive' } },
          ],
        });
      }

      // Execute query
      const [events, total] = await Promise.all([
        this.prisma.calendarEvent.findMany({
          where,
          skip,
          take,
          orderBy: { startTime: 'asc' },
          include: {
            category: true,
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
            attendees: {
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
            reminders: {
              where: { userId },
            },
            recurrenceRule: true,
            linkedEntities: true,
          },
        }),
        this.prisma.calendarEvent.count({ where }),
      ]);

      return {
        events,
        total,
        page,
        limit: take,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${error.message}`);
      throw error;
    }
  }

  /**
   * Find a single event by ID
   * Enforces visibility and permission checks
   */
  async findOne(id: string, userId: string): Promise<any> {
    try {
      const event = await this.prisma.calendarEvent.findUnique({
        where: { id },
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
            },
          },
          attendees: {
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
          reminders: {
            where: { userId },
          },
          recurrenceRule: true,
          linkedEntities: true,
        },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      // Check visibility permissions
      const isCreator = event.creatorId === userId;
      const isAttendee = event.attendees.some(a => a.userId === userId);
      const isPublic = event.visibility === EventVisibility.PUBLIC;

      if (!isPublic && !isCreator && !isAttendee) {
        throw new ForbiddenException('You do not have permission to view this event');
      }

      return event;
    } catch (error) {
      this.logger.error(`Failed to fetch event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an event
   * Only creator or attendees with update permission can modify
   */
  async update(id: string, dto: UpdateEventDto, userId: string): Promise<any> {
    try {
      // Verify event exists and user has permission
      const existingEvent = await this.findOne(id, userId);

      const isCreator = existingEvent.creatorId === userId;
      if (!isCreator) {
        throw new ForbiddenException('Only the event creator can update this event');
      }

      // Validate time range if provided
      if (dto.startTime || dto.endTime) {
        const startTime = dto.startTime ? new Date(dto.startTime) : existingEvent.startTime;
        const endTime = dto.endTime ? new Date(dto.endTime) : existingEvent.endTime;

        if (endTime < startTime) {
          throw new BadRequestException('Event end time must be after start time');
        }
      }

      // Verify category if changed
      if (dto.categoryId && dto.categoryId !== existingEvent.categoryId) {
        const category = await this.prisma.eventCategory.findUnique({
          where: { id: dto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(`Event category with ID ${dto.categoryId} not found`);
        }

        if (!category.isActive) {
          throw new BadRequestException('Cannot assign event to inactive category');
        }
      }

      // Update recurrence rule if provided
      if (dto.recurrenceRule) {
        if (existingEvent.recurrenceRuleId) {
          await this.prisma.recurrenceRule.update({
            where: { id: existingEvent.recurrenceRuleId },
            data: {
              frequency: dto.recurrenceRule.frequency,
              interval: dto.recurrenceRule.interval || 1,
              byDay: dto.recurrenceRule.byDay || [],
              byMonthDay: dto.recurrenceRule.byMonthDay || [],
              byMonth: dto.recurrenceRule.byMonth || [],
              count: dto.recurrenceRule.count,
              until: dto.recurrenceRule.until ? new Date(dto.recurrenceRule.until) : null,
              exceptions: dto.recurrenceRule.exceptions?.map(d => new Date(d)) || [],
            },
          });
        } else {
          const recurrenceRule = await this.prisma.recurrenceRule.create({
            data: {
              frequency: dto.recurrenceRule.frequency,
              interval: dto.recurrenceRule.interval || 1,
              byDay: dto.recurrenceRule.byDay || [],
              byMonthDay: dto.recurrenceRule.byMonthDay || [],
              byMonth: dto.recurrenceRule.byMonth || [],
              count: dto.recurrenceRule.count,
              until: dto.recurrenceRule.until ? new Date(dto.recurrenceRule.until) : undefined,
              exceptions: dto.recurrenceRule.exceptions?.map(d => new Date(d)) || [],
            },
          });
          dto['recurrenceRuleId'] = recurrenceRule.id;
        }
      }

      // Track attendee changes for notifications
      const previousAttendeeIds = new Set(
        existingEvent.attendees
          .filter(a => !a.isOrganizer)
          .map(a => a.userId)
          .filter((id): id is string => id !== null),
      );

      // Update attendees if provided
      if (dto.attendeeIds) {
        // Remove duplicates and exclude creator
        const uniqueAttendeeIds = [...new Set(dto.attendeeIds)].filter(aid => aid !== userId);

        // Verify all attendees exist
        if (uniqueAttendeeIds.length > 0) {
          const users = await this.prisma.user.findMany({
            where: { id: { in: uniqueAttendeeIds } },
            select: { id: true },
          });

          if (users.length !== uniqueAttendeeIds.length) {
            throw new NotFoundException('One or more attendees not found');
          }
        }

        // Delete existing attendees (except organizer)
        await this.prisma.eventAttendee.deleteMany({
          where: {
            eventId: id,
            isOrganizer: false,
          },
        });

        // Create new attendee records
        if (uniqueAttendeeIds.length > 0) {
          await this.prisma.eventAttendee.createMany({
            data: uniqueAttendeeIds.map(attendeeId => ({
              eventId: id,
              userId: attendeeId,
              responseStatus: 'PENDING',
              isOrganizer: false,
            })),
          });
        }

        // Determine added and removed attendees
        const newAttendeeIds = new Set(uniqueAttendeeIds);
        const addedAttendees = uniqueAttendeeIds.filter(aid => !previousAttendeeIds.has(aid));
        const removedAttendees = Array.from(previousAttendeeIds).filter((aid): aid is string => typeof aid === 'string' && !newAttendeeIds.has(aid));

        // Send notifications to added attendees (async, don't wait)
        for (const attendeeId of addedAttendees) {
          this.remindersService.notifyAttendeeAdded(id, attendeeId).catch(err => {
            this.logger.error(`Failed to send invitation notification: ${err.message}`);
          });
        }

        // Note: Removed attendees notification is handled separately if needed
      }

      // Update reminders if provided
      if (dto.reminders) {
        // Get existing reminders for comparison
        const existingReminders = existingEvent.reminders.map(r => r.minutesBefore);
        const newReminders = [...new Set(dto.reminders)];

        // Track reminder changes
        const addedReminders = newReminders.filter(r => !existingReminders.includes(r));
        const removedReminders = existingReminders.filter(r => !newReminders.includes(r));

        // Delete existing reminders for this user
        await this.prisma.eventReminder.deleteMany({
          where: {
            eventId: id,
            userId,
          },
        });

        // Create new reminders
        if (newReminders.length > 0) {
          await this.prisma.eventReminder.createMany({
            data: newReminders.map(minutesBefore => ({
              eventId: id,
              userId,
              minutesBefore,
            })),
          });
        }

        // Log reminder changes if any
        if (addedReminders.length > 0 || removedReminders.length > 0) {
          const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { name: true, email: true },
          });

          await this.prisma.activityLog.create({
            data: {
              action: 'calendar.reminders.updated',
              userId,
              actorName: user?.name || user?.email || 'Unknown User',
              entityType: 'calendar_event',
              entityId: id,
              metadata: {
                eventTitle: existingEvent.title,
                addedReminders,
                removedReminders,
              },
            },
          });
        }
      }

      // Prepare update data and track changes
      const updateData: any = {};
      const changedFields: Record<string, { from: any; to: any }> = {};

      if (dto.title !== undefined && dto.title !== existingEvent.title) {
        updateData.title = dto.title;
        changedFields.title = { from: existingEvent.title, to: dto.title };
      }
      if (dto.description !== undefined && dto.description !== existingEvent.description) {
        updateData.description = dto.description;
        changedFields.description = { from: existingEvent.description, to: dto.description };
      }
      if (dto.startTime !== undefined) {
        const newStartTime = new Date(dto.startTime);
        if (newStartTime.getTime() !== existingEvent.startTime.getTime()) {
          updateData.startTime = newStartTime;
          changedFields.startTime = { from: existingEvent.startTime.toISOString(), to: newStartTime.toISOString() };
        }
      }
      if (dto.endTime !== undefined) {
        const newEndTime = new Date(dto.endTime);
        if (newEndTime.getTime() !== existingEvent.endTime.getTime()) {
          updateData.endTime = newEndTime;
          changedFields.endTime = { from: existingEvent.endTime.toISOString(), to: newEndTime.toISOString() };
        }
      }
      if (dto.allDay !== undefined && dto.allDay !== existingEvent.allDay) {
        updateData.allDay = dto.allDay;
        changedFields.allDay = { from: existingEvent.allDay, to: dto.allDay };
      }
      if (dto.location !== undefined && dto.location !== existingEvent.location) {
        updateData.location = dto.location;
        changedFields.location = { from: existingEvent.location, to: dto.location };
      }
      if (dto.color !== undefined && dto.color !== existingEvent.color) {
        updateData.color = dto.color;
        changedFields.color = { from: existingEvent.color, to: dto.color };
      }
      if (dto.categoryId !== undefined && dto.categoryId !== existingEvent.categoryId) {
        updateData.categoryId = dto.categoryId;
        changedFields.categoryId = { from: existingEvent.categoryId, to: dto.categoryId };
      }
      if (dto.visibility !== undefined && dto.visibility !== existingEvent.visibility) {
        updateData.visibility = dto.visibility;
        changedFields.visibility = { from: existingEvent.visibility, to: dto.visibility };
      }
      if (dto.status !== undefined && dto.status !== existingEvent.status) {
        updateData.status = dto.status;
        changedFields.status = { from: existingEvent.status, to: dto.status };
      }
      if (dto.metadata !== undefined) {
        updateData.metadata = dto.metadata;
        changedFields.metadata = { from: existingEvent.metadata, to: dto.metadata };
      }
      if (dto['recurrenceRuleId'] !== undefined) {
        updateData.recurrenceRuleId = dto['recurrenceRuleId'];
      }

      // Track recurrence rule changes
      if (dto.recurrenceRule) {
        changedFields.recurrenceRule = {
          from: existingEvent.recurrenceRule,
          to: dto.recurrenceRule,
        };
      }

      // Update the event
      await this.prisma.calendarEvent.update({
        where: { id },
        data: updateData,
      });

      // Log event update if there were changes
      if (Object.keys(changedFields).length > 0) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { name: true, email: true },
        });

        await this.prisma.activityLog.create({
          data: {
            action: 'calendar.event.updated',
            userId,
            actorName: user?.name || user?.email || 'Unknown User',
            entityType: 'calendar_event',
            entityId: id,
            metadata: {
              title: existingEvent.title,
              changedFields,
              isCancelled: dto.status === 'CANCELLED',
            },
          },
        });
      }

      // Send update notifications to attendees (async, don't wait)
      if (dto.status === 'CANCELLED') {
        this.remindersService.notifyEventUpdate(id, 'cancelled').catch(err => {
          this.logger.error(`Failed to send cancellation notification: ${err.message}`);
        });
        // Cancel all pending reminders
        this.remindersService.cancelEventReminders(id).catch(err => {
          this.logger.error(`Failed to cancel event reminders: ${err.message}`);
        });
      } else {
        this.remindersService.notifyEventUpdate(id, 'updated').catch(err => {
          this.logger.error(`Failed to send update notification: ${err.message}`);
        });
      }

      // Return updated event
      return this.findOne(id, userId);
    } catch (error) {
      this.logger.error(`Failed to update event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete an event
   * Only creator can delete
   */
  async delete(id: string, userId: string): Promise<void> {
    try {
      // Verify event exists and user has permission
      const event = await this.findOne(id, userId);

      const isCreator = event.creatorId === userId;
      if (!isCreator) {
        throw new ForbiddenException('Only the event creator can delete this event');
      }

      // Send cancellation notifications to attendees before deletion (async, don't wait)
      this.remindersService.notifyEventUpdate(id, 'cancelled').catch(err => {
        this.logger.error(`Failed to send cancellation notification: ${err.message}`);
      });

      // Cancel all pending reminders
      await this.remindersService.cancelEventReminders(id);

      // Log event deletion before deleting
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      await this.prisma.activityLog.create({
        data: {
          action: 'calendar.event.deleted',
          userId,
          actorName: user?.name || user?.email || 'Unknown User',
          entityType: 'calendar_event',
          entityId: id,
          metadata: {
            title: event.title,
            startTime: event.startTime.toISOString(),
            endTime: event.endTime.toISOString(),
            category: event.category.name,
            attendeeCount: event.attendees.length,
          },
        },
      });

      // Delete the event (cascade will handle related records)
      await this.prisma.calendarEvent.delete({
        where: { id },
      });

      this.logger.log(`Event ${id} deleted by user ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to delete event: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if user can modify an event
   */
  async canModifyEvent(eventId: string, userId: string): Promise<boolean> {
    try {
      const event = await this.prisma.calendarEvent.findUnique({
        where: { id: eventId },
        select: {
          creatorId: true,
          attendees: {
            where: { userId },
            select: { id: true },
          },
        },
      });

      if (!event) {
        return false;
      }

      return event.creatorId === userId || event.attendees.length > 0;
    } catch (error) {
      this.logger.error(`Failed to check event permissions: ${error.message}`);
      return false;
    }
  }
}
