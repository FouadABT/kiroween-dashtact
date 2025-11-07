import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsBoolean,
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
  roleId?: string; // Now accepts role ID instead of enum

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
