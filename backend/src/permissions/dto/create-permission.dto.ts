import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z*]+:[a-z*]+$/, {
    message: 'Permission name must follow format: {resource}:{action} (e.g., users:read, *:*)',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  resource: string;

  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsOptional()
  description?: string;
}
