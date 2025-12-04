import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { DNDSettingsDto } from './dto/dnd-settings.dto';
import { NotificationPreference, NotificationCategory } from '@prisma/client';

@Injectable()
export class NotificationPreferencesService {
  private readonly logger = new Logger(NotificationPreferencesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all user preferences
   */
  async getPreferences(userId: string): Promise<NotificationPreference[]> {
    try {
      const preferences = await this.prisma.notificationPreference.findMany({
        where: { userId },
        orderBy: { category: 'asc' },
      });

      // If no preferences exist, create defaults
      if (preferences.length === 0) {
        return this.createDefaultPreferences(userId);
      }

      return preferences;
    } catch (error) {
      this.logger.error(
        `Failed to get preferences for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Get preference for specific category
   */
  async getPreference(
    userId: string,
    category: NotificationCategory,
  ): Promise<NotificationPreference> {
    try {
      const preference = await this.prisma.notificationPreference.findUnique({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
      });

      if (!preference) {
        // Create default preference for this category
        return this.createDefaultPreference(userId, category);
      }

      return preference;
    } catch (error) {
      this.logger.error(
        `Failed to get preference for user ${userId}, category ${category}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Update category preference
   */
  async updatePreference(
    userId: string,
    category: NotificationCategory,
    data: UpdatePreferenceDto,
  ): Promise<NotificationPreference> {
    try {
      // Check if preference exists
      const existing = await this.prisma.notificationPreference.findUnique({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
      });

      if (!existing) {
        // Create new preference with provided data
        return this.prisma.notificationPreference.create({
          data: {
            userId,
            category,
            enabled: data.enabled ?? true,
            dndEnabled: data.dndEnabled ?? false,
            dndStartTime: data.dndStartTime,
            dndEndTime: data.dndEndTime,
            dndDays: data.dndDays ?? [],
          },
        });
      }

      // Update existing preference
      return this.prisma.notificationPreference.update({
        where: {
          userId_category: {
            userId,
            category,
          },
        },
        data: {
          ...(data.enabled !== undefined && { enabled: data.enabled }),
          ...(data.dndEnabled !== undefined && { dndEnabled: data.dndEnabled }),
          ...(data.dndStartTime !== undefined && {
            dndStartTime: data.dndStartTime,
          }),
          ...(data.dndEndTime !== undefined && { dndEndTime: data.dndEndTime }),
          ...(data.dndDays !== undefined && { dndDays: data.dndDays }),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to update preference for user ${userId}, category ${category}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Configure Do Not Disturb settings
   */
  async setDND(userId: string, settings: DNDSettingsDto): Promise<void> {
    try {
      // Validate time format (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (settings.startTime && !timeRegex.test(settings.startTime)) {
        throw new Error('Invalid start time format. Use HH:MM');
      }
      if (settings.endTime && !timeRegex.test(settings.endTime)) {
        throw new Error('Invalid end time format. Use HH:MM');
      }

      // Validate days (0-6)
      if (settings.days.some((day) => day < 0 || day > 6)) {
        throw new Error('Invalid day value. Use 0-6 (Sunday-Saturday)');
      }

      // Update all preferences for this user with DND settings
      await this.prisma.notificationPreference.updateMany({
        where: { userId },
        data: {
          dndEnabled: settings.enabled,
          dndStartTime: settings.startTime,
          dndEndTime: settings.endTime,
          dndDays: settings.days,
        },
      });

      this.logger.log(`DND settings updated for user ${userId}`);
    } catch (error) {
      this.logger.error(
        `Failed to set DND for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Check if user is currently in Do Not Disturb period
   */
  async isInDNDPeriod(userId: string): Promise<boolean> {
    try {
      // Get any preference to check DND settings (they're the same across all categories)
      const preference = await this.prisma.notificationPreference.findFirst({
        where: { userId },
      });

      if (!preference || !preference.dndEnabled) {
        return false;
      }

      const now = new Date();
      const currentDay = now.getDay(); // 0-6 (Sun-Sat)
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      // Check if current day is in DND days
      if (!preference.dndDays.includes(currentDay)) {
        return false;
      }

      // Check if current time is within DND period
      const startTime = preference.dndStartTime || '00:00';
      const endTime = preference.dndEndTime || '23:59';

      // Handle overnight DND periods (e.g., 22:00 to 08:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      }

      // Normal DND period (e.g., 08:00 to 17:00)
      return currentTime >= startTime && currentTime <= endTime;
    } catch (error) {
      this.logger.error(
        `Failed to check DND period for user ${userId}: ${error.message}`,
      );
      return false; // Default to not in DND on error
    }
  }

  /**
   * Create default preferences for new users
   */
  async createDefaultPreferences(
    userId: string,
  ): Promise<NotificationPreference[]> {
    try {
      const categories: NotificationCategory[] = [
        NotificationCategory.SYSTEM,
        NotificationCategory.USER_ACTION,
        NotificationCategory.SECURITY,
        NotificationCategory.BILLING,
        NotificationCategory.CONTENT,
        NotificationCategory.WORKFLOW,
        NotificationCategory.SOCIAL,
        NotificationCategory.CUSTOM,
      ];

      const preferences = await Promise.all(
        categories.map((category) =>
          this.prisma.notificationPreference.create({
            data: {
              userId,
              category,
              enabled: true,
              dndEnabled: false,
              dndDays: [],
            },
          }),
        ),
      );

      this.logger.log(`Created default preferences for user ${userId}`);
      return preferences;
    } catch (error) {
      this.logger.error(
        `Failed to create default preferences for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Create default preference for a specific category
   */
  private async createDefaultPreference(
    userId: string,
    category: NotificationCategory,
  ): Promise<NotificationPreference> {
    try {
      return await this.prisma.notificationPreference.create({
        data: {
          userId,
          category,
          enabled: true,
          dndEnabled: false,
          dndDays: [],
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to create default preference for user ${userId}, category ${category}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Reset preferences to defaults
   */
  async resetToDefaults(userId: string): Promise<NotificationPreference[]> {
    try {
      // Delete all existing preferences
      await this.prisma.notificationPreference.deleteMany({
        where: { userId },
      });

      // Create new default preferences
      return this.createDefaultPreferences(userId);
    } catch (error) {
      this.logger.error(
        `Failed to reset preferences for user ${userId}: ${error.message}`,
      );
      throw error;
    }
  }
}
