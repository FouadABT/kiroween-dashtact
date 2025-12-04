import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LandingPageSectionDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  type: string;

  @IsInt()
  @Min(0)
  order: number;

  @IsBoolean()
  visible: boolean;

  @IsObject()
  content: Record<string, any>;

  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class CreateLandingPageContentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LandingPageSectionDto)
  sections: LandingPageSectionDto[];

  @IsObject()
  @IsNotEmpty()
  settings: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
