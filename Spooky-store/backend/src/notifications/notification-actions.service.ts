import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { NotificationAction } from '@prisma/client';
import axios from 'axios';

export interface ActionExecutionResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

@Injectable()
export class NotificationActionsService {
  private readonly logger = new Logger(NotificationActionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Execute a notification action
   * Main orchestration method that routes to specific action handlers
   */
  async executeAction(
    notificationId: string,
    actionId: string,
    userId: string,
    formData?: Record<string, any>,
  ): Promise<ActionExecutionResult> {
    try {
      // Verify notification belongs to user
      const notification = await this.prisma.notification.findUnique({
        where: { id: notificationId },
        include: { actions: true },
      });

      if (!notification) {
        throw new NotFoundException(`Notification with ID ${notificationId} not found`);
      }

      if (notification.userId !== userId) {
        throw new ForbiddenException('You do not have permission to execute this action');
      }

      // Find the action
      const action = notification.actions.find(a => a.id === actionId);
      if (!action) {
        throw new NotFoundException(`Action with ID ${actionId} not found`);
      }

      if (action.isExecuted) {
        return {
          success: false,
          message: 'Action has already been executed',
        };
      }

      // Execute based on action type
      let result: ActionExecutionResult;
      switch (action.actionType) {
        case 'LINK':
          result = await this.handleLinkAction(action);
          break;
        case 'API_CALL':
          result = await this.handleApiCallAction(action);
          break;
        case 'INLINE_FORM':
          result = await this.handleInlineFormAction(action, formData);
          break;
        case 'DISMISS':
          result = await this.handleDismissAction(notificationId, userId);
          break;
        default:
          throw new BadRequestException(`Unknown action type: ${action.actionType}`);
      }

      // Track action execution
      await this.trackActionExecution(actionId, userId, result.success);

      // Mark notification as read if action was successful
      if (result.success && !notification.isRead) {
        await this.prisma.notification.update({
          where: { id: notificationId },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to execute action: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Handle LINK action type
   * Returns the URL for the client to navigate to
   */
  handleLinkAction(action: NotificationAction): ActionExecutionResult {
    if (!action.actionUrl) {
      return {
        success: false,
        error: 'Action URL is missing',
      };
    }

    this.logger.log(`Handling LINK action: ${action.actionUrl}`);

    return {
      success: true,
      message: 'Link action ready',
      data: {
        url: action.actionUrl,
        method: action.actionMethod || 'GET',
      },
    };
  }

  /**
   * Handle API_CALL action type
   * Makes an HTTP request to the specified URL
   */
  async handleApiCallAction(action: NotificationAction): Promise<ActionExecutionResult> {
    if (!action.actionUrl) {
      return {
        success: false,
        error: 'Action URL is missing',
      };
    }

    try {
      const method = (action.actionMethod || 'POST').toLowerCase();
      const url = action.actionUrl;
      const payload = action.actionPayload as Record<string, any> || {};

      this.logger.log(`Handling API_CALL action: ${method.toUpperCase()} ${url}`);

      let response;
      switch (method) {
        case 'get':
          response = await axios.get(url);
          break;
        case 'post':
          response = await axios.post(url, payload);
          break;
        case 'put':
          response = await axios.put(url, payload);
          break;
        case 'patch':
          response = await axios.patch(url, payload);
          break;
        case 'delete':
          response = await axios.delete(url);
          break;
        default:
          throw new BadRequestException(`Unsupported HTTP method: ${method}`);
      }

      return {
        success: true,
        message: 'API call executed successfully',
        data: response.data,
      };
    } catch (error) {
      this.logger.error(`API call failed: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'API call failed',
      };
    }
  }

  /**
   * Handle INLINE_FORM action type
   * Processes form data submitted with the action
   */
  async handleInlineFormAction(
    action: NotificationAction,
    formData?: Record<string, any>,
  ): Promise<ActionExecutionResult> {
    if (!formData) {
      return {
        success: false,
        error: 'Form data is required for inline form actions',
      };
    }

    try {
      this.logger.log(`Handling INLINE_FORM action with data:`, formData);

      // If there's an action URL, submit the form data to it
      if (action.actionUrl) {
        const method = (action.actionMethod || 'POST').toLowerCase();
        const url = action.actionUrl;

        // Merge form data with action payload
        const payload = {
          ...(action.actionPayload as Record<string, any> || {}),
          ...formData,
        };

        let response;
        if (method === 'post') {
          response = await axios.post(url, payload);
        } else if (method === 'put') {
          response = await axios.put(url, payload);
        } else if (method === 'patch') {
          response = await axios.patch(url, payload);
        } else {
          throw new BadRequestException(`Unsupported HTTP method for form submission: ${method}`);
        }

        return {
          success: true,
          message: 'Form submitted successfully',
          data: response.data,
        };
      }

      // If no URL, just return success with the form data
      return {
        success: true,
        message: 'Form data processed',
        data: formData,
      };
    } catch (error) {
      this.logger.error(`Form submission failed: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Form submission failed',
      };
    }
  }

  /**
   * Handle DISMISS action type
   * Marks the notification as read and optionally deletes it
   */
  async handleDismissAction(notificationId: string, userId: string): Promise<ActionExecutionResult> {
    try {
      this.logger.log(`Handling DISMISS action for notification: ${notificationId}`);

      // Soft delete the notification
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
          deletedAt: new Date(),
        },
      });

      return {
        success: true,
        message: 'Notification dismissed',
      };
    } catch (error) {
      this.logger.error(`Failed to dismiss notification: ${error.message}`, error.stack);
      return {
        success: false,
        error: 'Failed to dismiss notification',
      };
    }
  }

  /**
   * Track action execution in the database
   * Updates the action record with execution details
   */
  async trackActionExecution(
    actionId: string,
    userId: string,
    success: boolean,
  ): Promise<void> {
    try {
      await this.prisma.notificationAction.update({
        where: { id: actionId },
        data: {
          isExecuted: success,
          executedAt: new Date(),
          executedBy: userId,
        },
      });

      this.logger.log(`Action execution tracked: ${actionId} by user ${userId} - ${success ? 'success' : 'failed'}`);
    } catch (error) {
      this.logger.error(`Failed to track action execution: ${error.message}`, error.stack);
      // Don't throw - tracking failure shouldn't fail the action
    }
  }

  /**
   * Get action history for a notification
   */
  async getActionHistory(notificationId: string, userId: string): Promise<NotificationAction[]> {
    // Verify notification belongs to user
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notificationId} not found`);
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this action history');
    }

    return this.prisma.notificationAction.findMany({
      where: { notificationId },
      orderBy: { createdAt: 'asc' },
    });
  }
}
