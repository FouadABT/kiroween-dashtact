import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TestimonialDto } from './testimonial.dto';

export class TestimonialsSectionDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsOptional()
  @IsEnum(['grid', 'carousel', 'masonry'])
  @Transform(({ value }) => value || 'grid')
  layout?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TestimonialDto)
  @Transform(({ value }) => value || [])
  testimonials?: TestimonialDto[];

  // Optional extended fields
  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  subheading?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value !== false)
  showRatings?: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => value || 3)
  columns?: number;
}
