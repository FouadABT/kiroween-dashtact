import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
