import { IsString, IsNotEmpty, IsDateString, IsInt, Min, IsOptional, IsBoolean } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsString()
  @IsNotEmpty()
  coachId: string;

  @IsDateString()
  @IsNotEmpty()
  requestedDate: string;

  @IsString()
  @IsNotEmpty()
  requestedTime: string; // HH:mm format

  @IsInt()
  @Min(15)
  duration: number; // minutes

  @IsString()
  @IsOptional()
  memberNotes?: string;

  @IsBoolean()
  @IsOptional()
  createGroupChat?: boolean;
}
