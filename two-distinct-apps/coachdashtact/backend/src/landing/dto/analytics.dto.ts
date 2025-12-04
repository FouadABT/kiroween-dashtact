import {
  IsString,
  IsOptional,
  IsNumber,
  IsObject,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TrackEventDto {
  @ApiProperty({ description: 'Page ID' })
  @IsString()
  pageId: string;

  @ApiProperty({
    description: 'Event type',
    enum: ['view', 'cta_click', 'section_view'],
  })
  @IsEnum(['view', 'cta_click', 'section_view'])
  eventType: string;

  @ApiProperty({ description: 'Session ID' })
  @IsString()
  sessionId: string;

  @ApiPropertyOptional({ description: 'User ID' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Device type' })
  @IsString()
  deviceType: string;

  @ApiProperty({ description: 'Browser name' })
  @IsString()
  browser: string;

  @ApiPropertyOptional({ description: 'Referrer URL' })
  @IsOptional()
  @IsString()
  referrer?: string;

  @ApiPropertyOptional({ description: 'Event-specific data' })
  @IsOptional()
  @IsObject()
  eventData?: Record<string, any>;
}

export class PageAnalyticsDto {
  @ApiProperty({ description: 'Page ID' })
  pageId: string;

  @ApiProperty({ description: 'Total page views' })
  totalViews: number;

  @ApiProperty({ description: 'Unique visitors' })
  uniqueVisitors: number;

  @ApiProperty({ description: 'Average time on page (seconds)' })
  avgTimeOnPage: number;

  @ApiProperty({ description: 'Bounce rate (percentage)' })
  bounceRate: number;

  @ApiPropertyOptional({ description: 'Date range for analytics' })
  dateRange?: {
    start?: string;
    end?: string;
  };
}

export class SectionEngagementDto {
  @ApiProperty({ description: 'Section ID' })
  sectionId: string;

  @ApiProperty({ description: 'Number of views' })
  views: number;

  @ApiProperty({ description: 'Average time spent (seconds)' })
  avgTimeSpent: number;

  @ApiProperty({ description: 'Average scroll depth (percentage)' })
  avgScrollDepth: number;
}

export class CTAAnalyticsDto {
  @ApiProperty({ description: 'CTA ID' })
  ctaId: string;

  @ApiPropertyOptional({ description: 'CTA text' })
  ctaText?: string;

  @ApiProperty({ description: 'Number of clicks' })
  clicks: number;

  @ApiProperty({ description: 'Click-through rate (percentage)' })
  ctr: number;
}

export class TrafficSourceDto {
  @ApiProperty({ description: 'Traffic source' })
  source: string;

  @ApiProperty({ description: 'Number of visits' })
  visits: number;

  @ApiProperty({ description: 'Percentage of total traffic' })
  percentage: number;
}

export class DeviceAnalyticsDto {
  @ApiProperty({ description: 'Device type breakdown' })
  deviceBreakdown: Array<{
    device: string;
    visits: number;
    percentage: number;
  }>;

  @ApiProperty({ description: 'Browser breakdown' })
  browserBreakdown: Array<{
    browser: string;
    visits: number;
    percentage: number;
  }>;
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ description: 'Start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
