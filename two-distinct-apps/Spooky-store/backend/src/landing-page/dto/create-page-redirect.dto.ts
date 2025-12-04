import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class CreatePageRedirectDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'From slug must contain only lowercase letters, numbers, and hyphens',
  })
  fromSlug: string;

  @IsString()
  @IsNotEmpty()
  toPageId: string;

  @IsOptional()
  @IsInt()
  @Min(301)
  @Max(308)
  redirectType?: number;
}
