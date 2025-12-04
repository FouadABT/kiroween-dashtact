import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CronJobsService } from './cron-jobs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { LogFiltersDto } from './dto/log-filters.dto';

@Controller('cron-jobs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions('system.cron.manage')
export class CronJobsController {
  constructor(private readonly cronJobsService: CronJobsService) {}

  @Get()
  async getAllJobs() {
    return this.cronJobsService.getAllJobs();
  }

  @Get(':id')
  async getJob(@Param('id') id: string) {
    return this.cronJobsService.getJobById(id);
  }

  @Get(':id/logs')
  async getJobLogs(
    @Param('id') id: string,
    @Query() filters: LogFiltersDto,
  ) {
    return this.cronJobsService.getJobLogs(id, filters);
  }

  @Get(':id/statistics')
  async getJobStatistics(@Param('id') id: string) {
    return this.cronJobsService.getJobStatistics(id);
  }

  @Post(':id/enable')
  async enableJob(@Param('id') id: string) {
    return this.cronJobsService.enableJob(id);
  }

  @Post(':id/disable')
  async disableJob(@Param('id') id: string) {
    return this.cronJobsService.disableJob(id);
  }

  @Post(':id/trigger')
  async triggerJob(@Param('id') id: string) {
    await this.cronJobsService.triggerJobManually(id);
    return { message: 'Job triggered successfully' };
  }

  @Patch(':id/schedule')
  async updateSchedule(
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.cronJobsService.updateSchedule(id, dto.schedule);
  }

  @Post('validate-schedule')
  async validateSchedule(@Body() dto: UpdateScheduleDto) {
    return this.cronJobsService.validateSchedule(dto.schedule);
  }
}
