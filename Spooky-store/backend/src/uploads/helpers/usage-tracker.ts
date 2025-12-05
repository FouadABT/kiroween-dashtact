import { Injectable } from '@nestjs/common';
import { UploadsService } from '../uploads.service';

@Injectable()
export class UsageTracker {
  constructor(private uploadsService: UploadsService) {}

  /**
   * Track file usage when referenced in an entity
   * @param fileId - Upload ID
   * @param entity - Entity type (e.g., 'products', 'blogPosts', 'avatars')
   * @param entityId - Entity ID
   */
  async trackUsage(
    fileId: string,
    entity: string,
    entityId: string,
  ): Promise<void> {
    try {
      await this.uploadsService.incrementUsage(fileId, entity, entityId);
    } catch (error) {
      console.error(`Failed to track usage for file ${fileId}:`, error);
      // Don't throw - usage tracking shouldn't break the main operation
    }
  }

  /**
   * Track multiple file usages at once
   * @param fileIds - Array of upload IDs
   * @param entity - Entity type
   * @param entityId - Entity ID
   */
  async trackMultipleUsages(
    fileIds: string[],
    entity: string,
    entityId: string,
  ): Promise<void> {
    await Promise.all(
      fileIds.map((fileId) => this.trackUsage(fileId, entity, entityId)),
    );
  }
}
