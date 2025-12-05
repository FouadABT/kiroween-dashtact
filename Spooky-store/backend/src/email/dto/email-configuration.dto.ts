import { IsString, IsInt, IsBoolean, IsEmail, Min, Max, IsOptional } from 'class-validator';

export class EmailConfigurationDto {
  @IsString()
  smtpHost: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort: number;

  @IsBoolean()
  smtpSecure: boolean;

  @IsString()
  smtpUsername: string;

  @IsString()
  @IsOptional()
  smtpPassword?: string;

  @IsEmail()
  senderEmail: string;

  @IsString()
  senderName: string;
}

export class ToggleEmailDto {
  @IsBoolean()
  isEnabled: boolean;
}

export class TestEmailDto {
  @IsEmail()
  recipient: string;

  @IsString()
  @IsOptional()
  message?: string;
}
