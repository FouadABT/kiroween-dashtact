import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';

export class StatDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  // Additional fields that may be sent from frontend
  @IsString()
  @IsOptional()
  prefix?: string;

  @IsString()
  @IsOptional()
  suffix?: string;

  constructor(partial?: Partial<StatDto>) {
    Object.assign(this, partial);
    // Generate ID if not provided
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
