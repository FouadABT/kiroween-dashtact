import { IsArray, IsString, IsNumber, IsOptional, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class WidgetPositionDto {
  @ApiProperty({ description: 'Widget instance ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'New position index', minimum: 0 })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({ description: 'Grid row number (optional)', nullable: true, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gridRow?: number | null;
}

export class ReorderWidgetsDto {
  @ApiProperty({ 
    description: 'Array of widget position updates',
    type: [WidgetPositionDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WidgetPositionDto)
  updates: WidgetPositionDto[];
}
