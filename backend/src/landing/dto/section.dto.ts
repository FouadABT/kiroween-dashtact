import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsObject,
} from 'class-validator';

export class SectionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsEnum([
    'hero',
    'features',
    'footer',
    'cta',
    'testimonials',
    'stats',
    'content',
  ])
  type: string;

  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  order: number;

  @IsObject()
  data: any; // Validated based on type in service
}
