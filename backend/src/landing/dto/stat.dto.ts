import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class StatDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  order: number;
}
