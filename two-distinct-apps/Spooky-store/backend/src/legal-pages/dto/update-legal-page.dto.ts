import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateLegalPageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
