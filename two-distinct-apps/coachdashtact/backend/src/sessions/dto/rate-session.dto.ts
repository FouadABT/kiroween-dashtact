import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class RateSessionDto {
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}
