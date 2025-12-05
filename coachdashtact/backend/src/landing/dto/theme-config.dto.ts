import {
  IsString,
  IsOptional,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ThemeColorsDto {
  @IsString()
  light: string;

  @IsString()
  dark: string;
}

export class ThemeConfigDto {
  @IsString()
  @IsIn(['light', 'dark', 'auto', 'toggle'])
  mode: string;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  primary?: ThemeColorsDto;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  secondary?: ThemeColorsDto;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  accent?: ThemeColorsDto;
}

export class UpdateThemeConfigDto {
  @IsString()
  @IsIn(['light', 'dark', 'auto', 'toggle'])
  @IsOptional()
  mode?: string;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  primary?: ThemeColorsDto;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  secondary?: ThemeColorsDto;

  @ValidateNested()
  @Type(() => ThemeColorsDto)
  @IsOptional()
  accent?: ThemeColorsDto;
}
