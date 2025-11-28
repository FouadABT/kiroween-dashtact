import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatDto } from './stat.dto';

export class StatsSectionDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsOptional()
  @IsEnum(['horizontal', 'grid'])
  layout?: 'horizontal' | 'grid';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats?: StatDto[];

  @IsOptional()
  @IsString()
  backgroundType?: string;

  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @IsOptional()
  @IsBoolean()
  showIcons?: boolean;

  @IsOptional()
  @IsString()
  alignment?: 'left' | 'center' | 'right';
}
