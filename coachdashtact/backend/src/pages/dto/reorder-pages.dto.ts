import { IsArray, ValidateNested, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class PageOrderUpdate {
  @IsString()
  id: string;

  @IsNumber()
  order: number;
}

export class ReorderPagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PageOrderUpdate)
  updates: PageOrderUpdate[];
}
