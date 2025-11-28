import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  @IsOptional()
  @Transform(({ value, obj }) => value || obj.platform)
  icon?: string;
}
