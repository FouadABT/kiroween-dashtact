import { IsString, IsEnum, IsOptional, MaxLength, IsObject } from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsString()
  conversationId: string;

  @IsString()
  @MaxLength(2000)
  content: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
