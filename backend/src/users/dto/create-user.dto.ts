import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  roleId?: string; // Now accepts role ID instead of enum

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean = false;

  @IsOptional()
  @IsString()
  @IsIn(['local', 'google', 'github', 'facebook', 'twitter'])
  authProvider?: string = 'local';

  @IsOptional()
  @IsBoolean()
  twoFactorEnabled?: boolean = false;
}
