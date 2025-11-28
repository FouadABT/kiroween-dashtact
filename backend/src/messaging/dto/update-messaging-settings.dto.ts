import { IsBoolean, IsInt, IsArray, IsString, IsOptional, Min, Max } from 'class-validator';

export class UpdateMessagingConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000)
  maxMessageLength?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(365)
  messageRetentionDays?: number;

  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100)
  maxGroupParticipants?: number;

  @IsOptional()
  @IsBoolean()
  allowFileAttachments?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1048576) // 1MB
  @Max(52428800) // 50MB
  maxFileSize?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allowedFileTypes?: string[];

  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(10000)
  typingIndicatorTimeout?: number;
}
