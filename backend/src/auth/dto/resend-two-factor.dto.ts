import { IsString, IsNotEmpty } from 'class-validator';

export class ResendTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
