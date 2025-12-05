import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CalendarService } from './calendar.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventFilterDto } from './dto/event-filter.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateCalendarSettingsDto } from './dto/calendar-settings.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CalendarRemindersService } from './calendar-reminders.service';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@Controller('calendar')
@UseGuards(JwtAuthGuard, PermissionsGuard, FeatureGuard)
@FeatureEnabled('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly prisma: PrismaService,
    private readonly remindersService: CalendarRemindersService,
  ) {}

  // ==================== Event Endpoints ====================

  /**
   * GET /calendar/events - List events with filters
   */
  @Get('events')
  @Permissions('calendar:read')
  async getEvents(
    @Request() req,
    @Query() filters: EventFilterDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.calendarService.findAll(req.user.id, filters, page, limit);
  }

  /**
   * GET /calendar/events/:id - Get single event
   */
  @Get('events/:id')
  @Permissions('calendar:read')
  async getEvent(@Request() req, @Param('id') id: string) {
    return this.calendarService.findOne(id, req.user.id);
  }

  /**
   * POST /calendar/events - Create event
   */
  @Post('events')
  @Permissions('calendar:create')
  async createEvent(@Request() req, @Body() dto: CreateEventDto) {
    return this.calendarService.create(dto, req.user.id);
  }

  /**
   * PUT /calendar/events/:id - Update event
   */
  @Put('events/:id')
  @Permissions('calendar:update')
  async updateEvent(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
  ) {
    const updatedEvent = await this.calendarService.update(id, dto, req.user.id);
    
    // Notify attendees if event was updated
    if (dto.status !== 'CANCELLED') {
      await this.remindersService.notifyEventUpdate(id, 'updated');
    }
    
    return updatedEvent;
  }

  /**
   * DELETE /calendar/events/:id - Delete event
   */
  @Delete('events/:id')
  @Permissions('calendar:delete')
  async deleteEvent(@Request() req, @Param('id') id: string) {
    // Notify attendees before deletion
    await this.remindersService.notifyEventUpdate(id, 'cancelled');
    
    // Cancel all reminders
    await this.remindersService.cancelEventReminders(id);
    
    // Delete the event
    await this.calendarService.delete(id, req.user.id);
    
    return { message: 'Event deleted successfully' };
  }

  // ==================== Category Endpoints ====================

  /**
   * GET /calendar/categories - List all categories
   */
  @Get('categories')
  @Permissions('calendar:read')
  async getCategories() {
    return this.prisma.eventCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * POST /calendar/categories - Create category (admin only)
   */
  @Post('categories')
  @Permissions('calendar:admin')
  async createCategory(@Body() dto: CreateCategoryDto) {
    // Generate slug from name
    const slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    return this.prisma.eventCategory.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        color: dto.color,
        icon: dto.icon,
        displayOrder: dto.displayOrder || 0,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        isSystem: false,
      },
    });
  }

  /**
   * PUT /calendar/categories/:id - Update category (admin only)
   */
  @Put('categories/:id')
  @Permissions('calendar:admin')
  async updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    // Check if category exists
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
    });

    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Prevent modifying system categories
    if (category.isSystem) {
      throw new Error('Cannot modify system categories');
    }

    // Generate new slug if name changed
    const updateData: any = { ...dto };
    if (dto.name) {
      updateData.slug = dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    return this.prisma.eventCategory.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * DELETE /calendar/categories/:id - Delete category (admin only)
   */
  @Delete('categories/:id')
  @Permissions('calendar:admin')
  async deleteCategory(@Param('id') id: string) {
    // Check if category exists
    const category = await this.prisma.eventCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    });

    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }

    // Prevent deleting system categories
    if (category.isSystem) {
      throw new Error('Cannot delete system categories');
    }

    // Check if category has events
    if (category._count.events > 0) {
      // Find or create a default category
      let defaultCategory = await this.prisma.eventCategory.findFirst({
        where: { slug: 'uncategorized' },
      });

      if (!defaultCategory) {
        defaultCategory = await this.prisma.eventCategory.create({
          data: {
            name: 'Uncategorized',
            slug: 'uncategorized',
            color: '#6B7280',
            isSystem: true,
            isActive: true,
          },
        });
      }

      // Reassign events to default category
      await this.prisma.calendarEvent.updateMany({
        where: { categoryId: id },
        data: { categoryId: defaultCategory.id },
      });
    }

    // Delete the category
    await this.prisma.eventCategory.delete({
      where: { id },
    });

    return { message: 'Category deleted successfully' };
  }

  // ==================== Settings Endpoints ====================

  /**
   * GET /calendar/settings - Get user calendar settings
   */
  @Get('settings')
  @Permissions('calendar:read')
  async getSettings(@Request() req) {
    let settings = await this.prisma.calendarSettings.findUnique({
      where: { userId: req.user.id },
    });

    // If user doesn't have settings, return defaults
    if (!settings) {
      settings = await this.prisma.calendarSettings.create({
        data: {
          userId: req.user.id,
          defaultView: 'month',
          weekStartsOn: 0,
          workingHoursStart: '09:00',
          workingHoursEnd: '17:00',
          workingDays: [1, 2, 3, 4, 5],
          timeZone: 'UTC',
          defaultReminders: [15],
          showWeekNumbers: false,
        },
      });
    }

    return settings;
  }

  /**
   * PUT /calendar/settings - Update user calendar settings
   */
  @Put('settings')
  @Permissions('calendar:read')
  async updateSettings(@Request() req, @Body() dto: UpdateCalendarSettingsDto) {
    // Check if settings exist
    const existingSettings = await this.prisma.calendarSettings.findUnique({
      where: { userId: req.user.id },
    });

    if (existingSettings) {
      // Update existing settings
      return this.prisma.calendarSettings.update({
        where: { userId: req.user.id },
        data: dto,
      });
    } else {
      // Create new settings
      return this.prisma.calendarSettings.create({
        data: {
          userId: req.user.id,
          ...dto,
        },
      });
    }
  }
}
