import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ActivityLogService } from './activity-log.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { ActivityLogQueryDto } from './dto/activity-log-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('activity-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Post()
  @Permissions('activity-logs:write')
  async create(
    @Body() createActivityLogDto: CreateActivityLogDto,
    @Req() request: Request,
  ) {
    return this.activityLogService.logActivity(createActivityLogDto, request);
  }

  @Get()
  @Permissions('activity-logs:read')
  async findAll(@Query() query: ActivityLogQueryDto) {
    return this.activityLogService.findAll(query);
  }

  @Get(':id')
  @Permissions('activity-logs:read')
  async findOne(@Param('id') id: string) {
    const activityLog = await this.activityLogService.findOne(id);
    if (!activityLog) {
      throw new NotFoundException(`Activity log with ID ${id} not found`);
    }
    return activityLog;
  }
}
