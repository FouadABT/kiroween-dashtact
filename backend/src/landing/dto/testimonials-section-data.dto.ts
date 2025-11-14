import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TestimonialDto } from './testimonial.dto';

export class TestimonialsSectionDataDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsEnum(['grid', 'carousel'])
  layout: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialDto)
  testimonials: TestimonialDto[];
}
