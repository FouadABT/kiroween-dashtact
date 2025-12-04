import { IsString, IsOptional, IsDateString, IsInt, Min, IsIn } from 'class-validator';

export class UpdateSessionDto {
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;

  @IsInt()
  @Min(15)
  @IsOptional()
  duration?: number;

  @IsString()
  @IsIn(['initial', 'regular', 'followup'])
  @IsOptional()
  type?: 'initial' | 'regular' | 'followup';

  @IsString()
  @IsOptional()
  memberNotes?: string;
}
