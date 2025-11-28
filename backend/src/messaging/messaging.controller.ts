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
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import {
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  UpdateMessageDto,
  UpdateMessagingConfigDto,
  AddParticipantsDto,
} from './dto';

@Controller('messaging')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // Conversations
  @Get('conversations/search')
  @Permissions('messaging:access')
  async searchConversations(@Query('q') query: string, @CurrentUser() user) {
    return this.messagingService.searchConversations(user.id, query);
  }

  @Get('conversations')
  @Permissions('messaging:access')
  async getConversations(@CurrentUser() user, @Query() query) {
    return this.messagingService.getUserConversations(user.id, query);
  }

  @Get('conversations/:id')
  @Permissions('messaging:access')
  async getConversation(@Param('id') id: string, @CurrentUser() user) {
    const conversation = await this.messagingService.getConversation(id, user.id);
    return { data: conversation };
  }

  @Post('conversations')
  @Permissions('messaging:access')
  async createConversation(@CurrentUser() user, @Body() dto: CreateConversationDto) {
    const conversation = await this.messagingService.createConversation(user.id, dto);
    return { data: conversation, message: 'Conversation created successfully' };
  }

  @Patch('conversations/:id')
  @Permissions('messaging:access')
  async updateConversation(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateConversationDto,
  ) {
    const conversation = await this.messagingService.updateConversation(id, user.id, dto);
    return { data: conversation, message: 'Conversation updated successfully' };
  }

  @Delete('conversations/:id')
  @Permissions('messaging:access')
  async deleteConversation(@Param('id') id: string, @CurrentUser() user) {
    return this.messagingService.deleteConversation(id, user.id);
  }

  @Post('conversations/:id/leave')
  @Permissions('messaging:access')
  async leaveConversation(@Param('id') id: string, @CurrentUser() user) {
    return this.messagingService.leaveConversation(id, user.id);
  }

  @Patch('conversations/:id/mute')
  @Permissions('messaging:access')
  async muteConversation(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body('muted') muted: boolean,
  ) {
    return this.messagingService.muteConversation(id, user.id, muted);
  }

  @Post('conversations/:id/read')
  @Permissions('messaging:access')
  async markConversationAsRead(@Param('id') id: string, @CurrentUser() user) {
    return this.messagingService.markConversationAsRead(id, user.id);
  }

  @Get('conversations/:id/unread-count')
  @Permissions('messaging:access')
  async getConversationUnreadCount(@Param('id') id: string, @CurrentUser() user) {
    return this.messagingService.getConversationUnreadCount(id, user.id);
  }

  @Post('conversations/:id/participants')
  @Permissions('messaging:access')
  async addParticipants(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: AddParticipantsDto,
  ) {
    return this.messagingService.addParticipants(id, user.id, dto.participantIds);
  }

  @Delete('conversations/:id/participants/:userId')
  @Permissions('messaging:access')
  async removeParticipant(
    @Param('id') id: string,
    @Param('userId') participantId: string,
    @CurrentUser() user,
  ) {
    return this.messagingService.removeParticipant(id, user.id, participantId);
  }

  // Messages
  @Get('messages/search')
  @Permissions('messaging:access')
  async searchMessages(
    @Query('q') query: string,
    @Query('conversationId') conversationId: string,
    @CurrentUser() user,
  ) {
    return this.messagingService.searchMessages(user.id, query, conversationId);
  }

  @Get('messages')
  @Permissions('messaging:access')
  async getMessages(@Query() query, @CurrentUser() user) {
    return this.messagingService.getMessages(query.conversationId, user.id, query);
  }

  @Get('messages/:id')
  @Permissions('messaging:access')
  async getMessage(@Param('id') id: string, @CurrentUser() user) {
    const message = await this.messagingService.getMessage(id, user.id);
    return { data: message };
  }

  @Post('messages')
  @Permissions('messaging:access')
  async sendMessage(@CurrentUser() user, @Body() dto: SendMessageDto) {
    const message = await this.messagingService.sendMessage(user.id, dto);
    return { data: message, message: 'Message sent successfully' };
  }

  @Patch('messages/:id')
  @Permissions('messaging:access')
  async updateMessage(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body() dto: UpdateMessageDto,
  ) {
    const message = await this.messagingService.updateMessage(id, user.id, dto);
    return { data: message, message: 'Message updated successfully' };
  }

  @Delete('messages/:id')
  @Permissions('messaging:access')
  async deleteMessage(@Param('id') id: string, @CurrentUser() user) {
    return this.messagingService.deleteMessage(id, user.id);
  }

  @Post('messages/:id/read')
  @Permissions('messaging:access')
  async markMessageAsRead(@Param('id') id: string, @CurrentUser() user) {
    return this.messagingService.markMessageAsRead(id, user.id);
  }

  @Patch('messages/:id/status')
  @Permissions('messaging:access')
  async updateMessageStatus(
    @Param('id') id: string,
    @CurrentUser() user,
    @Body('status') status: string,
  ) {
    return this.messagingService.updateMessageStatus(id, user.id, status as any);
  }

  // Unread counts
  @Get('unread-count')
  @Permissions('messaging:access')
  async getUnreadCount(@CurrentUser() user) {
    return this.messagingService.getUnreadCount(user.id);
  }

  // Settings (Admin only)
  @Get('settings')
  @Permissions('messaging:settings:read')
  async getSettings() {
    const settings = await this.messagingService.getSettings();
    return { data: settings };
  }

  @Patch('settings')
  @Permissions('messaging:settings:write')
  async updateSettings(@Body() dto: UpdateMessagingConfigDto) {
    const settings = await this.messagingService.updateSettings(dto);
    return { data: settings, message: 'Settings updated successfully' };
  }

  @Patch('settings/toggle')
  @Permissions('messaging:settings:write')
  async toggleMessagingSystem(@Body('enabled') enabled: boolean) {
    const settings = await this.messagingService.toggleMessagingSystem(enabled);
    return { data: settings, message: `Messaging system ${enabled ? 'enabled' : 'disabled'}` };
  }
}
