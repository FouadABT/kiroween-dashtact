import { PartialType } from '@nestjs/mapped-types';
import { CreateLayoutDto } from './create-layout.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLayoutDto extends PartialType(CreateLayoutDto) {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
