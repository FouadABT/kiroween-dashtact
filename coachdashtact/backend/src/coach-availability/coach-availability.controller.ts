import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CoachAvailabilityService } from './coach-availability.service';
import {
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  GetAvailableSlotsDto,
} from './dto';

interface AuthRequest extends Request {
  user: {
    id: string;
    email: string;
    role: {
      id: string;
      name: string;
    };
    permissions: string[];
  };
}

@Controller('coach-availability')
@UseGuards(JwtAuthGuard)
export class CoachAvailabilityController {
  constructor(
    private readonly coachAvailabilityService: CoachAvailabilityService,
  ) {}

  @Get()
  @Permissions('availability:read')
  async getCurrentUserAvailability(@Request() req: AuthRequest) {
    return this.coachAvailabilityService.findByCoach(req.user.id);
  }

  @Get(':coachId')
  @Permissions('availability:read')
  async getCoachAvailability(@Param('coachId') coachId: string) {
    return this.coachAvailabilityService.findByCoach(coachId);
  }

  @Get(':coachId/slots')
  @Permissions('availability:read')
  async getAvailableSlots(
    @Param('coachId') coachId: string,
    @Query() dto: GetAvailableSlotsDto,
  ) {
    return this.coachAvailabilityService.getAvailableSlots(coachId, dto);
  }

  @Post()
  @Permissions('availability:manage')
  async create(@Body() dto: CreateAvailabilityDto, @Request() req: AuthRequest) {
    // Ensure coach can only create their own availability
    // Always use the authenticated user's ID unless they're a Super Admin
    if (!dto.coachId || (dto.coachId !== req.user.id && req.user.role.name !== 'Super Admin')) {
      dto.coachId = req.user.id;
    }
    return this.coachAvailabilityService.create(dto);
  }

  @Patch(':id')
  @Permissions('availability:manage')
  async update(@Param('id') id: string, @Body() dto: UpdateAvailabilityDto) {
    return this.coachAvailabilityService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('availability:manage')
  async delete(@Param('id') id: string) {
    await this.coachAvailabilityService.delete(id);
    return { message: 'Availability slot deleted successfully' };
  }
}
