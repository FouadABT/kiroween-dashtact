import { IsDateString, IsInt, Min, IsOptional } from 'class-validator';

export class GetAvailableSlotsDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  duration?: number; // Session duration in minutes (default: 60)
}

export interface AvailableSlot {
  date: Date;
  time: string;
  availableCapacity: number;
  maxCapacity: number;
}
