import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';

/**
 * DTO for excerpt preview request
 */
export class ExcerptPreviewDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsInt()
  @Min(50)
  @Max(500)
  @IsOptional()
  maxLength?: number;
}
