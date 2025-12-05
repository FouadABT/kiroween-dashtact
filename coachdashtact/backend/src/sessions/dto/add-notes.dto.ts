import { IsString, IsNotEmpty } from 'class-validator';

export class AddNotesDto {
  @IsString()
  @IsNotEmpty()
  notes: string;
}
