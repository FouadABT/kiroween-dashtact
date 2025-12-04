import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class UpdateCoachProfileDto {
  @IsString()
  @IsOptional()
  specialization?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  certifications?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  maxMembers?: number;

  @IsBoolean()
  @IsOptional()
  isAcceptingMembers?: boolean;
}
