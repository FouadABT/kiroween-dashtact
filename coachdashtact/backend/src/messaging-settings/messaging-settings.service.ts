import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMessagingSettingsDto } from './dto/update-messaging-settings.dto';

@Injectable()
export class MessagingSettingsService {
  private settingsCache: {
    data: any;
    timestamp: number;
  } | null = null;
  private readonly CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get messaging settings with caching
   */
  async getSettings() {
    // Check cache
    if (this.settingsCache && Date.now() - this.settingsCache.timestamp < this.CACHE_TTL) {
      return this.settingsCache.data;
    }

    // Fetch from database
    let settings = await this.prisma.messagingSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await this.prisma.messagingSettings.create({
        data: {
          enabled: false,
          maxMessageLength: 2000,
          messageRetentionDays: 90,
          maxGroupParticipants: 50,
          allowFileAttachments: false,
          maxFileSize: 5242880, // 5MB
          allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          typingIndicatorTimeout: 3000,
        },
      });
    }

    // Update cache
    this.settingsCache = {
      data: settings,
      timestamp: Date.now(),
    };

    return settings;
  }

  /**
   * Update messaging settings
   */
  async updateSettings(updateDto: UpdateMessagingSettingsDto) {
    // Get existing settings or create if not exists
    let settings = await this.prisma.messagingSettings.findFirst();

    if (!settings) {
      // Create with provided values
      settings = await this.prisma.messagingSettings.create({
        data: {
          enabled: updateDto.enabled ?? false,
          maxMessageLength: updateDto.maxMessageLength ?? 2000,
          messageRetentionDays: updateDto.messageRetentionDays ?? 90,
          maxGroupParticipants: updateDto.maxGroupParticipants ?? 50,
          allowFileAttachments: updateDto.allowFileAttachments ?? false,
          maxFileSize: updateDto.maxFileSize ?? 5242880,
          allowedFileTypes: ['image/jpeg', 'image/png', 'application/pdf'],
          typingIndicatorTimeout: updateDto.typingIndicatorTimeout ?? 3000,
        },
      });
    } else {
      // Update existing settings
      settings = await this.prisma.messagingSettings.update({
        where: { id: settings.id },
        data: updateDto,
      });
    }

    // Invalidate cache
    this.settingsCache = null;

    return settings;
  }

  /**
   * Check if messaging is enabled
   */
  async isMessagingEnabled(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.enabled;
  }

  /**
   * Get maximum message length
   */
  async getMaxMessageLength(): Promise<number> {
    const settings = await this.getSettings();
    return settings.maxMessageLength;
  }

  /**
   * Get message retention days
   */
  async getRetentionDays(): Promise<number> {
    const settings = await this.getSettings();
    return settings.messageRetentionDays;
  }

  /**
   * Clear settings cache (useful for testing)
   */
  clearCache() {
    this.settingsCache = null;
  }
}
