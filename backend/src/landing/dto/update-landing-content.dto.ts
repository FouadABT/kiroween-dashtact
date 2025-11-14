import {
  IsArray,
  IsOptional,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SectionDto } from './section.dto';
import { GlobalSettingsDto } from './global-settings.dto';

export class UpdateLandingContentDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => SectionDto)
  sections?: SectionDto[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => GlobalSettingsDto)
  settings?: GlobalSettingsDto;
}
