import { IsString, IsNotEmpty, IsDateString, IsInt, Min, IsOptional, IsIn, IsBoolean } from 'class-validator';

export class CreateSessionDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsNotEmpty()
  coachId: string;

  @IsDateString()
  @IsNotEmpty()
  scheduledAt: string;

  @IsInt()
  @Min(15)
  duration: number; // minutes

  @IsString()
  @IsIn(['initial', 'regular', 'followup'])
  type: 'initial' | 'regular' | 'followup';

  @IsString()
  @IsOptional()
  memberNotes?: string;

  @IsBoolean()
  @IsOptional()
  createGroupChat?: boolean;
}
