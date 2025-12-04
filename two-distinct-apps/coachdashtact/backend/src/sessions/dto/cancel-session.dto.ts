import { IsString, IsOptional } from 'class-validator';

export class CancelSessionDto {
  @IsString()
  @IsOptional()
  reason?: string;
}
