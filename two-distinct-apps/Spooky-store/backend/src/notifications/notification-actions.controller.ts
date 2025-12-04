import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  NotificationActionsService,
  ActionExecutionResult,
} from './notification-actions.service';
import type { NotificationAction } from '@prisma/client';

interface UserProfile {
  id: string;
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
}

interface ExecuteActionDto {
  formData?: Record<string, any>;
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationActionsController {
  constructor(
    private readonly notificationActionsService: NotificationActionsService,
  ) {}

  /**
   * Execute a notification action
   * POST /notifications/:id/actions/:actionId
   */
  @Post(':id/actions/:actionId')
  @HttpCode(HttpStatus.OK)
  async executeAction(
    @Param('id') notificationId: string,
    @Param('actionId') actionId: string,
    @CurrentUser() user: UserProfile,
    @Body() dto: ExecuteActionDto,
  ): Promise<ActionExecutionResult> {
    return this.notificationActionsService.executeAction(
      notificationId,
      actionId,
      user.id,
      dto.formData,
    );
  }

  /**
   * Get action history for a notification
   * GET /notifications/:id/actions
   */
  @Get(':id/actions')
  async getActionHistory(
    @Param('id') notificationId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<NotificationAction[]> {
    return this.notificationActionsService.getActionHistory(
      notificationId,
      user.id,
    );
  }
}
