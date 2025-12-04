import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO for updating a blog tag
 */
export class UpdateTagDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  slug?: string;
}
