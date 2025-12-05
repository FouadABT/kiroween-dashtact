import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UploadFileDto {
  @IsEnum(['image', 'document'])
  type: 'image' | 'document';

  @IsOptional()
  @IsString()
  description?: string;
}
