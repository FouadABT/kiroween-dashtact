import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for updating a blog category
 */
export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;
}
