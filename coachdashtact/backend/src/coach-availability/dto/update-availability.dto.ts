import { IsString, IsInt, Min, Max, IsBoolean, IsOptional } from 'class-validator';

export class UpdateAvailabilityDto {
  @IsInt()
  @Min(0)
  @Max(6)
  @IsOptional()
  dayOfWeek?: number;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxSessionsPerSlot?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  bufferMinutes?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
