import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, CancelBookingDto } from './dto';
import type { AuthenticatedRequest, BookingWithRelations } from './interfaces/booking.interface';

@Controller('bookings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @Permissions('bookings:create')
  async create(
    @Body() createBookingDto: CreateBookingDto,
  ): Promise<BookingWithRelations> {
    console.log('[BookingsController] Received booking DTO:', JSON.stringify(createBookingDto, null, 2));
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  @Permissions('bookings:read')
  async findAll(@Request() req: AuthenticatedRequest): Promise<BookingWithRelations[]> {
    return this.bookingsService.findAll(req.user.userId, req.user.role);
  }

  @Get('pending')
  @Permissions('bookings:read')
  async getPendingBookings(@Request() req: AuthenticatedRequest): Promise<BookingWithRelations[]> {
    return this.bookingsService.getPendingBookings(
      req.user.userId,
      req.user.userId,
      req.user.role,
    );
  }

  @Get(':id')
  @Permissions('bookings:read')
  async findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<BookingWithRelations> {
    return this.bookingsService.findOne(id, req.user.userId, req.user.role);
  }

  @Delete(':id')
  @Permissions('bookings:manage', 'bookings:cancel-own')
  async cancelBooking(
    @Param('id') id: string,
    @Body() cancelBookingDto: CancelBookingDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.bookingsService.cancelBooking(
      id,
      cancelBookingDto,
      req.user.userId,
      req.user.role,
    );
  }
}
