import { IsString, IsNotEmpty, IsUrl } from 'class-validator';

export class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsUrl()
  url: string;

  @IsString()
  icon: string;
}
