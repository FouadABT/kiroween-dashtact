import {
  Controller,
  Get,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  async getStats(@Request() req) {
    return this.dashboardService.getStatsForRole(req.user.id, req.user.role.name);
  }

  @Get('recent-activity')
  async getRecentActivity(
    @Request() req,
    @Query('limit') limit: string = '10',
  ) {
    const limitNum = Math.min(parseInt(limit, 10) || 10, 50);
    return this.dashboardService.getRecentActivity(
      req.user.id,
      req.user.role.name,
      limitNum,
    );
  }

  @Get('alerts')
  async getAlerts(@Request() req) {
    return this.dashboardService.getAlerts(req.user.id, req.user.role.name);
  }

  @Get('system-health')
  @Permissions('system:*')
  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }

  @Get('revenue')
  async getRevenue(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.dashboardService.getRevenueData(start, end, req.user.role.name);
  }

  @Get('sales')
  async getSales(
    @Request() req,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    return this.dashboardService.getSalesData(start, end, req.user.role.name);
  }

  @Get('inventory')
  async getInventory(@Request() req) {
    return this.dashboardService.getInventoryData(req.user.role.name);
  }

  @Get('content')
  async getContent(@Request() req) {
    return this.dashboardService.getContentMetrics(req.user.role.name);
  }

  @Get('users')
  async getUsers(@Request() req) {
    return this.dashboardService.getUserMetrics(req.user.role.name);
  }
}
