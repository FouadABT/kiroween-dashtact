import { Controller, Get, Patch, Param, Body, UseGuards, Query } from '@nestjs/common';
import { FeaturesService } from './features.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('features')
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  /**
   * Get all feature flags (public - for frontend)
   * GET /features
   */
  @Public()
  @Get()
  async getAllFeatures() {
    const features = await this.featuresService.getAllFeatures();
    return {
      features: features.map(f => ({
        key: f.key,
        name: f.name,
        isEnabled: f.isEnabled,
        category: f.category,
      })),
    };
  }

  /**
   * Get a specific feature flag (public)
   * GET /features/:key
   */
  @Public()
  @Get(':key')
  async getFeature(@Param('key') key: string) {
    const feature = await this.featuresService.getFeature(key);
    if (!feature) {
      return { error: 'Feature not found' };
    }
    return {
      key: feature.key,
      name: feature.name,
      isEnabled: feature.isEnabled,
      category: feature.category,
    };
  }

  /**
   * Get enabled features (public)
   * GET /features/status/enabled
   */
  @Public()
  @Get('status/enabled')
  async getEnabledFeatures() {
    const features = await this.featuresService.getEnabledFeatures();
    return {
      features: features.map(f => f.key),
    };
  }

  /**
   * Get features by category (public)
   * GET /features/category/:category
   */
  @Public()
  @Get('category/:category')
  async getFeaturesByCategory(@Param('category') category: string) {
    const features = await this.featuresService.getFeaturesByCategory(category);
    return {
      category,
      features: features.map(f => ({
        key: f.key,
        name: f.name,
        isEnabled: f.isEnabled,
      })),
    };
  }

  /**
   * Update feature flag (admin only)
   * PATCH /features/:key
   */
  @Patch(':key')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings:admin')
  async updateFeature(
    @Param('key') key: string,
    @Body() dto: { isEnabled: boolean; reason?: string },
  ) {
    const feature = await this.featuresService.updateFeature(
      key,
      dto.isEnabled,
      dto.reason,
    );
    return {
      key: feature.key,
      name: feature.name,
      isEnabled: feature.isEnabled,
      message: `Feature ${key} ${feature.isEnabled ? 'enabled' : 'disabled'}`,
    };
  }

  /**
   * Get audit logs (admin only)
   * GET /features/audit/logs
   */
  @Get('audit/logs')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions('settings:admin')
  async getAuditLogs(@Query('feature') feature?: string, @Query('limit') limit?: string) {
    const logs = await this.featuresService.getAuditLogs(
      feature,
      limit ? parseInt(limit) : 100,
    );
    return { logs };
  }
}
