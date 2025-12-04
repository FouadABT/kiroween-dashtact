import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateMemberDto {
  @IsString()
  @IsOptional()
  goals?: string;

  @IsString()
  @IsOptional()
  healthInfo?: string;

  @IsString()
  @IsOptional()
  coachNotes?: string;

  @IsEnum(['active', 'inactive', 'paused'])
  @IsOptional()
  membershipStatus?: 'active' | 'inactive' | 'paused';
}
