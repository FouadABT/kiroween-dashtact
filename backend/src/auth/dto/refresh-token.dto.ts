import { IsString } from 'class-validator';

/**
 * Data Transfer Object for token refresh
 */
export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}
