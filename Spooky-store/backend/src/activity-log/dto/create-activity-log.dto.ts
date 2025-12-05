import {
  IsString,
  IsOptional,
  IsObject,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateActivityLogDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  action: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  actorName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  entityType?: string;

  @IsString()
  @IsOptional()
  entityId?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  @MaxLength(45)
  ipAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  userAgent?: string;
}
