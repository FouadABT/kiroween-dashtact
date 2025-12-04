import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class ValidateSlugDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens',
  })
  slug: string;

  @IsString()
  @IsOptional()
  excludeId?: string;
}
