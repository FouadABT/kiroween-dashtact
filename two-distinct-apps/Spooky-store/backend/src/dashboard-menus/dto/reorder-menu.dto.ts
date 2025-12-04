import { IsArray, IsString, IsInt, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class MenuOrderItem {
  @ApiProperty({
    description: 'Menu item ID',
    example: 'clx1234567890',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'New order value',
    example: 1,
  })
  @IsInt()
  @Min(0)
  order: number;
}

export class ReorderMenuDto {
  @ApiProperty({
    description: 'Array of menu items with new order values',
    type: [MenuOrderItem],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MenuOrderItem)
  items: MenuOrderItem[];
}
