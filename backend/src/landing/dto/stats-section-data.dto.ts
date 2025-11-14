import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StatDto } from './stat.dto';

export class StatsSectionDataDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(['horizontal', 'grid'])
  layout: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatDto)
  stats: StatDto[];
}
