import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddOrderNoteDto {
  @ApiProperty({ description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  note: string;
}
