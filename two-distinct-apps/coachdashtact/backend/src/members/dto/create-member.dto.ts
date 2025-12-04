import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateMemberDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  @IsOptional()
  coachId?: string;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsString()
  @IsOptional()
  healthInfo?: string;
}
