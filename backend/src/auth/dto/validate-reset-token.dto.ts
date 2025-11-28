import { IsString, IsNotEmpty } from 'class-validator';

/**
 * Data Transfer Object for validate reset token request
 */
export class ValidateResetTokenDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}
