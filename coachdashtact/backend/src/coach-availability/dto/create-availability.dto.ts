import { IsString, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  @IsOptional()
  coachId?: string;

  @IsInt()
  @Min(0)
  @Max(6)
  dayOfWeek: number; // 0-6 (Sunday-Saturday)

  @IsString()
  startTime: string; // HH:mm format

  @IsString()
  endTime: string; // HH:mm format

  @IsInt()
  @Min(1)
  maxSessionsPerSlot: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  bufferMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
