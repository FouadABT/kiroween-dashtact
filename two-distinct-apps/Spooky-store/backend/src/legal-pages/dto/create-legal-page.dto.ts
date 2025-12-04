import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { LegalPageType } from '@prisma/client';

export class CreateLegalPageDto {
  @IsEnum(LegalPageType)
  @IsNotEmpty()
  pageType: LegalPageType;

  @IsString()
  @IsNotEmpty()
  content: string;
}
