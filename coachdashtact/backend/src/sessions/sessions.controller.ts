import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import {
  CreateSessionDto,
  UpdateSessionDto,
  CompleteSessionDto,
  CancelSessionDto,
  AddNotesDto,
  RateSessionDto,
} from './dto';

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  @Permissions('sessions:write')
  async create(@Body() dto: CreateSessionDto, @Request() req) {
    return this.sessionsService.create(dto, req.user.id);
  }

  @Get()
  @Permissions('sessions:read')
  async findAll(@Request() req) {
    return this.sessionsService.findAll(req.user.id, req.user.role.name);
  }

  @Get('upcoming')
  @Permissions('sessions:read')
  async getUpcoming(@Request() req) {
    return this.sessionsService.getUpcomingSessions(
      req.user.id,
      req.user.role.name,
    );
  }

  @Get('member/:memberId')
  @Permissions('sessions:read')
  async getByMember(@Param('memberId') memberId: string, @Request() req) {
    return this.sessionsService.getSessionsByMember(
      memberId,
      req.user.id,
      req.user.role.name,
    );
  }

  @Get('coach/:coachId')
  @Permissions('sessions:read')
  async getByCoach(@Param('coachId') coachId: string, @Request() req) {
    return this.sessionsService.getSessionsByCoach(
      coachId,
      req.user.id,
      req.user.role.name,
    );
  }

  @Get(':id')
  @Permissions('sessions:read')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.sessionsService.findOne(id, req.user.id, req.user.role.name);
  }

  @Patch(':id')
  @Permissions('sessions:write')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
    @Request() req,
  ) {
    return this.sessionsService.update(
      id,
      dto,
      req.user.id,
      req.user.role.name,
    );
  }

  @Patch(':id/complete')
  @Permissions('sessions:complete')
  async complete(
    @Param('id') id: string,
    @Body() dto: CompleteSessionDto,
    @Request() req,
  ) {
    return this.sessionsService.complete(
      id,
      dto,
      req.user.id,
      req.user.role.name,
    );
  }

  @Patch(':id/cancel')
  @Permissions('sessions:cancel')
  async cancel(
    @Param('id') id: string,
    @Body() dto: CancelSessionDto,
    @Request() req,
  ) {
    return this.sessionsService.cancel(
      id,
      dto,
      req.user.id,
      req.user.role.name,
    );
  }

  @Post(':id/coach-notes')
  @Permissions('sessions:write')
  async addCoachNotes(
    @Param('id') id: string,
    @Body() dto: AddNotesDto,
    @Request() req,
  ) {
    return this.sessionsService.addCoachNotes(
      id,
      dto,
      req.user.id,
      req.user.role.name,
    );
  }

  @Post(':id/member-notes')
  @Permissions('sessions:read-own')
  async addMemberNotes(
    @Param('id') id: string,
    @Body() dto: AddNotesDto,
    @Request() req,
  ) {
    return this.sessionsService.addMemberNotes(
      id,
      dto,
      req.user.id,
      req.user.role.name,
    );
  }

  @Post(':id/rate')
  @Permissions('sessions:rate')
  async rate(
    @Param('id') id: string,
    @Body() dto: RateSessionDto,
    @Request() req,
  ) {
    return this.sessionsService.rateSession(
      id,
      dto,
      req.user.id,
      req.user.role.name,
    );
  }
}
