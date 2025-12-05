import {
  IsString,
  IsOptional,
  IsObject,
  IsIn,
} from 'class-validator';

export class TrackAnalyticsEventDto {
  @IsString()
  pageId: string;

  @IsString()
  @IsIn(['view', 'cta_click', 'section_view', 'form_submit', 'scroll'])
  eventType: string;

  @IsObject()
  eventData: any;

  @IsString()
  sessionId: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  deviceType: string;

  @IsString()
  browser: string;

  @IsString()
  @IsOptional()
  referrer?: string;
}

export class AnalyticsQueryDto {
  @IsString()
  @IsOptional()
  pageId?: string;

  @IsString()
  @IsOptional()
  eventType?: string;

  @IsString()
  @IsOptional()
  startDate?: string;

  @IsString()
  @IsOptional()
  endDate?: string;
}
