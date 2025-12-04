import { IsEmail, IsString, MinLength, Matches, IsOptional } from 'class-validator';
import { authConfig } from '../../config/auth.config';

/**
 * Data Transfer Object for user registration
 */
export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(authConfig.password.minLength, {
    message: `Password must be at least ${authConfig.password.minLength} characters long`,
  })
  @Matches(authConfig.password.pattern, {
    message: authConfig.password.requirementsMessage,
  })
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}
