import { IsBoolean, IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessagingSettingsDto {
  @ApiProperty({
    description: 'Enable or disable the messaging system',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'Maximum message length in characters',
    example: 2000,
    minimum: 100,
    maximum: 5000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(5000)
  maxMessageLength?: number;

  @ApiProperty({
    description: 'Message retention period in days',
    example: 90,
    minimum: 7,
    maximum: 365,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(365)
  messageRetentionDays?: number;

  @ApiProperty({
    description: 'Maximum number of participants in a group conversation',
    example: 50,
    minimum: 2,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(100)
  maxGroupParticipants?: number;

  @ApiProperty({
    description: 'Allow file attachments in messages',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  allowFileAttachments?: boolean;

  @ApiProperty({
    description: 'Maximum file size in bytes',
    example: 5242880,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxFileSize?: number;

  @ApiProperty({
    description: 'Typing indicator timeout in milliseconds',
    example: 3000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1000)
  @Max(10000)
  typingIndicatorTimeout?: number;
}
