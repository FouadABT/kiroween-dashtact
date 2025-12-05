import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RegisterMemberDto } from './dto/register-member.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ValidateResetTokenDto } from './dto/validate-reset-token.dto';
import { VerifyTwoFactorDto } from './dto/verify-two-factor.dto';
import { ResendTwoFactorDto } from './dto/resend-two-factor.dto';
import type {
  AuthResponse,
  TokenResponse,
  UserProfile,
  TwoFactorRequiredResponse,
} from './interfaces/auth-response.interface';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { RequestUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  /**
   * Register a new member with profile
   * POST /auth/register-member
   */
  @Public()
  @Post('register-member')
  @HttpCode(HttpStatus.CREATED)
  async registerMember(@Body() registerMemberDto: RegisterMemberDto): Promise<AuthResponse> {
    return this.authService.registerMember(registerMemberDto);
  }

  /**
   * Login user
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ): Promise<AuthResponse | TwoFactorRequiredResponse> {
    return this.authService.login(loginDto, request);
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Logout user
   * POST /auth/logout
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser('id') userId: string,
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    await this.authService.logout(userId, refreshTokenDto.refreshToken, request);
    return { message: 'Logged out successfully' };
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: RequestUser): Promise<UserProfile> {
    return this.authService.getUserProfile(user.id);
  }

  /**
   * Request password reset
   * POST /auth/forgot-password
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.forgotPassword(forgotPasswordDto.email);
    return {
      message: 'If an account exists with that email, a reset link has been sent.',
    };
  }

  /**
   * Validate reset token
   * POST /auth/validate-reset-token
   */
  @Public()
  @Post('validate-reset-token')
  @HttpCode(HttpStatus.OK)
  async validateResetToken(
    @Body() validateResetTokenDto: ValidateResetTokenDto,
  ): Promise<{ valid: boolean; message?: string }> {
    const isValid = await this.authService.validateResetToken(
      validateResetTokenDto.token,
    );

    if (isValid) {
      return { valid: true };
    } else {
      return {
        valid: false,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      };
    }
  }

  /**
   * Reset password with token
   * POST /auth/reset-password
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return {
      message: 'Password has been reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Verify 2FA code and complete login
   * POST /auth/verify-2fa
   */
  @Public()
  @Post('verify-2fa')
  @HttpCode(HttpStatus.OK)
  async verifyTwoFactor(
    @Body() verifyTwoFactorDto: VerifyTwoFactorDto,
    @Req() request: Request,
  ): Promise<AuthResponse> {
    return this.authService.verifyTwoFactorAndLogin(
      verifyTwoFactorDto.userId,
      verifyTwoFactorDto.code,
      request,
    );
  }

  /**
   * Resend 2FA verification code
   * POST /auth/resend-2fa
   */
  @Public()
  @Post('resend-2fa')
  @HttpCode(HttpStatus.OK)
  async resendTwoFactor(
    @Body() resendTwoFactorDto: ResendTwoFactorDto,
    @Req() request: Request,
  ): Promise<{ message: string }> {
    // Get user email
    const user = await this.authService['prisma'].user.findUnique({
      where: { id: resendTwoFactorDto.userId },
      select: { email: true },
    });

    if (!user) {
      return { message: 'Verification code sent if user exists.' };
    }

    // Generate and send new code
    const ipAddress = request?.ip || request?.socket?.remoteAddress;
    await this.authService['twoFactorService'].generateAndSendCode(
      resendTwoFactorDto.userId,
      user.email,
      ipAddress,
    );

    return { message: 'Verification code sent to your email.' };
  }
}
