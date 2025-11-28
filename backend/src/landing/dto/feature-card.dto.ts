import { IsString, IsNotEmpty, IsNumber, MaxLength, IsOptional } from 'class-validator';

export class FeatureCardDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
