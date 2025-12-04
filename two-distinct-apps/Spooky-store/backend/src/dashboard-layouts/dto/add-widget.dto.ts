import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsObject,
  Min,
  Max,
} from 'class-validator';

export class AddWidgetDto {
  @IsString()
  @IsNotEmpty()
  widgetKey: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(12)
  gridSpan?: number = 6;

  @IsNumber()
  @IsOptional()
  @Min(0)
  gridRow?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;

  @IsObject()
  @IsOptional()
  config?: Record<string, any> = {};

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean = true;
}
