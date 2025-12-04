import { IsEmail, IsString, IsBoolean, IsOptional } from 'class-validator';

/**
 * Data Transfer Object for user login
 */
export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
