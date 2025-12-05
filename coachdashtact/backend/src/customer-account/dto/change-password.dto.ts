import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}

export class TwoFactorEnableDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class TwoFactorVerifyDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6}$/, {
    message: 'Verification code must be a 6-digit number',
  })
  code: string;
}

export class TwoFactorDisableDto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
