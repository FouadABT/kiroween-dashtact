import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class TestimonialDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  quote: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsNumber()
  order: number;
}
