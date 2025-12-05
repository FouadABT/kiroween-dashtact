import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FeatureFlag } from '@prisma/client';

@Injectable()
export class FeaturesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all feature flags
   */
  async getAllFeatures(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Get a specific feature flag
   */
  async getFeature(key: string): Promise<FeatureFlag | null> {
    return this.prisma.featureFlag.findUnique({
      where: { key },
    });
  }

  /**
   * Check if a feature is enabled
   */
  async isFeatureEnabled(key: string): Promise<boolean> {
    const feature = await this.getFeature(key);
    return feature?.isEnabled ?? false;
  }

  /**
   * Get all enabled features
   */
  async getEnabledFeatures(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({
      where: { isEnabled: true },
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Get all disabled features
   */
  async getDisabledFeatures(): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({
      where: { isEnabled: false },
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Get features by category
   */
  async getFeaturesByCategory(category: string): Promise<FeatureFlag[]> {
    return this.prisma.featureFlag.findMany({
      where: { category },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Update feature flag status
   */
  async updateFeature(key: string, isEnabled: boolean, reason?: string): Promise<FeatureFlag> {
    const feature = await this.getFeature(key);

    if (!feature) {
      throw new Error(`Feature ${key} not found`);
    }

    // Log the change
    await this.prisma.featureAuditLog.create({
      data: {
        featureKey: key,
        action: isEnabled ? 'enabled' : 'disabled',
        previousValue: { isEnabled: feature.isEnabled },
        newValue: { isEnabled },
        reason,
      },
    });

    // Update the feature
    return this.prisma.featureFlag.update({
      where: { key },
      data: { isEnabled },
    });
  }

  /**
   * Get related tables for a feature
   */
  async getRelatedTables(key: string): Promise<string[]> {
    const feature = await this.getFeature(key);
    return feature?.relatedTables ?? [];
  }

  /**
   * Get feature audit logs
   */
  async getAuditLogs(featureKey?: string, limit: number = 100) {
    return this.prisma.featureAuditLog.findMany({
      where: featureKey ? { featureKey } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
