import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CompleteSessionDto {
  @IsString()
  @IsNotEmpty()
  coachNotes: string;

  @IsString()
  @IsOptional()
  outcomes?: string;
}
