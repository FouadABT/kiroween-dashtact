import { IsEmail, IsString, MinLength, Matches, IsOptional, IsUUID } from 'class-validator';
import { authConfig } from '../../config/auth.config';

/**
 * Data Transfer Object for member registration
 * Extends basic registration with member-specific fields
 */
export class RegisterMemberDto {
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

  @IsUUID()
  @IsOptional()
  coachId?: string;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsString()
  @IsOptional()
  healthInfo?: string;
}
