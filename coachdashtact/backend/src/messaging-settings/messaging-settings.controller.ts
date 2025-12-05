import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessagingSettingsService } from './messaging-settings.service';
import { UpdateMessagingSettingsDto } from './dto/update-messaging-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@ApiTags('messaging-settings')
@Controller('messaging-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MessagingSettingsController {
  constructor(
    private readonly messagingSettingsService: MessagingSettingsService,
  ) {}

  @Get()
  @Permissions('messaging:settings:read')
  @ApiOperation({ summary: 'Get messaging settings' })
  @ApiResponse({ status: 200, description: 'Messaging settings retrieved' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  getSettings() {
    return this.messagingSettingsService.getSettings();
  }

  @Patch()
  @Permissions('messaging:settings:write')
  @ApiOperation({ summary: 'Update messaging settings' })
  @ApiResponse({ status: 200, description: 'Messaging settings updated' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  updateSettings(@Body() updateDto: UpdateMessagingSettingsDto) {
    return this.messagingSettingsService.updateSettings(updateDto);
  }
}
