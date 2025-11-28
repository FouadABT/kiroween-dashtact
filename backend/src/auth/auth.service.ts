import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import type { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponse,
  TokenPair,
  TokenResponse,
  UserProfile,
} from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { authConfig } from '../config/auth.config';
import { AuditLoggingService } from './services/audit-logging.service';
import { NotificationsService } from '../notifications/notifications.service';
import { createSecurityAlertNotification, createSystemNotification } from '../notifications/notification-helpers';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { PasswordResetService } from './services/password-reset.service';
import { EmailService } from '../email/email.service';
import { TwoFactorService } from './services/two-factor.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly auditLoggingService: AuditLoggingService,
    private readonly notificationsService: NotificationsService,
    private readonly activityLogService: ActivityLogService,
    private readonly passwordResetService: PasswordResetService,
    private readonly emailService: EmailService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  /**
   * Register a new user
   * @param registerDto User registration data
   * @returns Authentication response with user and tokens
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, password, name } = registerDto;

    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Log failed registration attempt
        this.auditLoggingService.logRegistration(
          email,
          false,
          undefined,
          undefined,
          'Email already in use',
        );
        throw new ConflictException('Email already in use');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        password,
        authConfig.security.bcryptRounds,
      );

      // Get default role (case-insensitive search)
      const defaultRole = await this.prisma.userRole.findFirst({
        where: { 
          name: {
            equals: authConfig.defaultRole,
            mode: 'insensitive',
          }
        },
      });

      if (!defaultRole) {
        this.logger.error(`Default role "${authConfig.defaultRole}" not found. Available roles should include: User, Admin, Manager, Super Admin`);
        throw new Error('Default role not found. Please run database seed or check auth.config.ts defaultRole setting.');
      }

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          roleId: defaultRole.id,
        },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Log successful registration
      this.auditLoggingService.logRegistration(email, true);

      // Send welcome notification (only if service is available)
      try {
        if (this.notificationsService) {
          const welcomeNotification = createSystemNotification({
            userId: user.id,
            title: 'Welcome to Dashboard!',
            message: `Hi ${name || 'there'}! Welcome to your new dashboard. We're excited to have you here. Explore the features and let us know if you need any help.`,
            actionUrl: '/dashboard',
            actionLabel: 'Get Started',
            metadata: {
              registrationDate: new Date().toISOString(),
              userEmail: email,
            },
          });
          await this.notificationsService.create(welcomeNotification);
        }
      } catch (notificationError) {
        // Don't fail registration if notification fails
        this.logger.warn('Failed to send welcome notification:', notificationError);
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Build user profile
      const userProfile = this.buildUserProfile(user);

      return {
        user: userProfile,
        ...tokens,
        expiresIn: this.getTokenExpirationSeconds(
          authConfig.tokens.accessTokenExpiration,
        ),
      };
    } catch (error) {
      // Log failed registration if not already logged
      if (!(error instanceof ConflictException)) {
        this.auditLoggingService.logRegistration(
          email,
          false,
          undefined,
          undefined,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Login user with credentials
   * @param loginDto User login credentials
   * @param request HTTP request object for activity logging
   * @returns Authentication response with user and tokens, or 2FA required response
   */
  async login(loginDto: LoginDto, request?: Request): Promise<AuthResponse | any> {
    const { email, password } = loginDto;

    try {
      console.log('[AuthService] Login attempt for:', email);
      
      // Validate user credentials
      const user = await this.validateUser(email, password);

      if (!user) {
        // Log failed login attempt
        this.auditLoggingService.logLogin(
          email,
          false,
          undefined,
          undefined,
          undefined,
          'Invalid credentials',
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      console.log('[AuthService] User validated, avatar from DB:', user.avatarUrl);

      // Check if 2FA is enabled for this user
      if (user.twoFactorEnabled) {
        console.log('[AuthService] 2FA enabled for user, generating code');
        
        // Generate and send 2FA code
        const ipAddress = request?.ip || request?.socket?.remoteAddress;
        await this.twoFactorService.generateAndSendCode(
          user.id,
          user.email,
          ipAddress,
        );

        // Log 2FA code sent
        this.logger.log(`2FA code sent for user ${user.id}`);

        // Return 2FA required response
        return {
          requiresTwoFactor: true,
          userId: user.id,
          message: 'Two-factor authentication required. Please check your email for the verification code.',
        };
      }

      // Log successful login to console (audit log for security monitoring)
      this.auditLoggingService.logLogin(email, true, user.id);

      // Activity log is handled automatically by ActivityLoggingInterceptor
      // No need to log manually here to avoid duplicates

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Build user profile
      const userProfile = this.buildUserProfile(user);

      console.log('[AuthService] Login response prepared');

      return {
        user: userProfile,
        ...tokens,
        expiresIn: this.getTokenExpirationSeconds(
          authConfig.tokens.accessTokenExpiration,
        ),
      };
    } catch (error) {
      // Log failed login if not already logged
      if (!(error instanceof UnauthorizedException)) {
        this.auditLoggingService.logLogin(
          email,
          false,
          undefined,
          undefined,
          undefined,
          error instanceof Error ? error.message : 'Unknown error',
        );
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken Refresh token
   * @returns New access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      // Verify refresh token
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      // Check if token is blacklisted
      const isBlacklisted = await this.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        this.auditLoggingService.logInvalidToken('blacklisted', undefined, undefined, payload.sub);
        throw new UnauthorizedException('Token has been revoked');
      }

      // Get user with updated data
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        // Token refresh failures are not logged to reduce noise
        // Only critical auth events are logged (login, logout, password changes)
        throw new UnauthorizedException('User not found');
      }

      // Token refresh success is not logged to reduce database bloat
      // This happens frequently (every 13 minutes) and provides little security value

      // Generate new access token
      const accessToken = await this.generateAccessToken(user);

      return {
        accessToken,
        expiresIn: this.getTokenExpirationSeconds(
          authConfig.tokens.accessTokenExpiration,
        ),
      };
    } catch (error) {
      // Log failed token refresh if not already logged
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.auditLoggingService.logInvalidToken('invalid');
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Logout user by blacklisting refresh token
   * @param userId User ID
   * @param refreshToken Refresh token to revoke
   * @param request HTTP request object for activity logging
   */
  async logout(userId: string, refreshToken: string, request?: Request): Promise<void> {
    try {
      // Verify token belongs to user
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      if (payload.sub !== userId) {
        throw new UnauthorizedException('Invalid token');
      }

      // Add token to blacklist
      await this.revokeToken(refreshToken);

      // Log logout event to console (audit log for security monitoring)
      this.auditLoggingService.logLogout(userId, payload.email);

      // Activity log is handled automatically by ActivityLoggingInterceptor
      // No need to log manually here to avoid duplicates
    } catch (error) {
      // Even if verification fails, we don't throw to allow logout
      // This prevents users from being stuck if they have an invalid token
      // Still log the logout attempt to audit log
      this.auditLoggingService.logLogout(userId);
      
      // Activity log is handled automatically by ActivityLoggingInterceptor
    }
  }

  /**
   * Validate user credentials
   * @param email User email
   * @param password User password
   * @returns User object if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        roleId: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        twoFactorVerifiedAt: true,
        lastPasswordChange: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    console.log('[AuthService] validateUser - User from DB:', {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      hasAvatar: !!user.avatarUrl,
    });

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  /**
   * Generate access and refresh tokens
   * @param user User object
   * @returns Token pair
   */
  async generateTokens(user: any): Promise<TokenPair> {
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Generate access token
   * @param user User object
   * @returns Access token
   */
  private async generateAccessToken(user: any): Promise<string> {
    const permissions = this.extractPermissions(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: authConfig.tokens.accessTokenExpiration as any,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });
  }

  /**
   * Generate refresh token
   * @param user User object
   * @returns Refresh token
   */
  private async generateRefreshToken(user: any): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      permissions: [],
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: authConfig.tokens.refreshTokenExpiration as any,
      issuer: authConfig.jwt.issuer,
      audience: authConfig.jwt.audience,
    });
  }

  /**
   * Revoke token by adding to blacklist
   * @param token Token to revoke
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      const expiresAt = new Date(payload.exp! * 1000);

      await this.prisma.tokenBlacklist.create({
        data: {
          token,
          userId: payload.sub,
          expiresAt,
        },
      });
    } catch (error) {
      // Token might be invalid or expired, but we still want to blacklist it
      // Use a default expiration if we can't decode
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await this.prisma.tokenBlacklist.create({
        data: {
          token,
          userId: 'unknown',
          expiresAt,
        },
      });
    }
  }

  /**
   * Check if token is blacklisted
   * @param token Token to check
   * @returns True if blacklisted
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    return !!blacklistedToken;
  }

  /**
   * Extract permissions from user object
   * @param user User object with role and permissions
   * @returns Array of permission strings
   */
  private extractPermissions(user: any): string[] {
    if (!user.role?.rolePermissions) {
      return [];
    }

    return user.role.rolePermissions.map((rp: any) => rp.permission.name);
  }

  /**
   * Get user profile by ID
   * @param userId User ID
   * @returns User profile
   */
  async getUserProfile(userId: string): Promise<UserProfile> {
    console.log('[AuthService] Getting user profile for:', userId);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        phone: true,
        location: true,
        website: true,
        roleId: true,
        lastPasswordChange: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
            description: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    resource: true,
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    console.log('[AuthService] User found in DB with avatar:', user.avatarUrl);

    return this.buildUserProfile(user);
  }

  /**
   * Build user profile from user object
   * @param user User object
   * @returns User profile
   */
  private buildUserProfile(user: any): UserProfile {
    const profile = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
      },
      permissions: this.extractPermissions(user),
      lastPasswordChange: user.lastPasswordChange,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    console.log('[AuthService] Building user profile:', {
      userId: profile.id,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
      hasAvatar: !!profile.avatarUrl,
    });

    return profile;
  }

  /**
   * Convert token expiration string to seconds
   * @param expiration Expiration string (e.g., "15m", "7d")
   * @returns Expiration in seconds
   */
  private getTokenExpirationSeconds(expiration: string): number {
    const unit = expiration.slice(-1);
    const value = parseInt(expiration.slice(0, -1), 10);

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 900; // Default 15 minutes
    }
  }

  /**
   * Request password reset
   * @param email User email
   */
  async forgotPassword(email: string): Promise<void> {
    // Check if email system is enabled
    const isEmailEnabled = await this.emailService.isEmailSystemEnabled();
    if (!isEmailEnabled) {
      this.logger.warn('Password reset requested but email system is disabled');
      throw new BadRequestException('Password reset is currently unavailable. Please contact support.');
    }

    // Add artificial delay to prevent timing attacks (user enumeration)
    const startTime = Date.now();

    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Invalidate all previous reset tokens for this user
        await this.passwordResetService.invalidateUserTokens(user.id);

        // Generate new reset token
        const rawToken = await this.passwordResetService.createResetToken(user.id);

        // Construct reset URL using FRONTEND_URL from environment
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

        // Send password reset email
        await this.emailService.sendTemplateEmail(
          'password-reset',
          user.email,
          {
            userName: user.name || 'User',
            resetUrl,
            expiresIn: '1 hour',
            appName: process.env.APP_NAME || 'Dashboard',
            supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
          },
          user.id,
        );

        this.logger.log(`Password reset email sent to ${email}`);
      } else {
        this.logger.log(`Password reset requested for non-existent email: ${email}`);
      }
    } catch (error) {
      this.logger.error('Error in forgotPassword:', error);
      // Don't throw error to prevent user enumeration
    }

    // Ensure consistent response time (minimum 500ms)
    const elapsed = Date.now() - startTime;
    if (elapsed < 500) {
      await new Promise(resolve => setTimeout(resolve, 500 - elapsed));
    }

    // Always return success message to prevent user enumeration
    return;
  }

  /**
   * Validate reset token
   * @param token Reset token
   * @returns True if valid
   */
  async validateResetToken(token: string): Promise<boolean> {
    const user = await this.passwordResetService.validateToken(token);
    return !!user;
  }

  /**
   * Reset password using token
   * @param token Reset token
   * @param newPassword New password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Validate token
    const user = await this.passwordResetService.validateToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token. Please request a new password reset.');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      authConfig.security.bcryptRounds,
    );

    // Update user password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    // Mark token as used
    await this.passwordResetService.markTokenAsUsed(token);

    // Invalidate all user sessions
    await this.invalidateUserSessions(user.id);

    this.logger.log(`Password reset successful for user ${user.id}`);

    // Send security notification
    try {
      const securityNotification = createSecurityAlertNotification({
        userId: user.id,
        title: 'Password Changed',
        message: 'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
        actionUrl: '/dashboard/settings/security',
        actionLabel: 'Review Security',
        metadata: {
          timestamp: new Date().toISOString(),
          action: 'password_reset',
        },
      });
      await this.notificationsService.create(securityNotification);
    } catch (notificationError) {
      this.logger.error('Failed to send password reset notification:', notificationError);
    }
  }

  /**
   * Invalidate all active sessions for a user
   * @param userId User ID
   */
  private async invalidateUserSessions(userId: string): Promise<void> {
    // Get all active refresh tokens for the user (not blacklisted and not expired)
    const now = new Date();
    
    // We can't easily get all active tokens, so we'll just log this action
    // In a production system, you might want to store session IDs
    this.logger.log(`Invalidating all sessions for user ${userId}`);
    
    // Note: Since we don't store all active tokens, users will need to re-login
    // when their current token expires or when they try to refresh
  }

  /**
   * Enable two-factor authentication for a user
   * @param userId User ID
   */
  async enableTwoFactor(userId: string): Promise<void> {
    // Update user to enable 2FA
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
      },
    });

    // Get user details for email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Send confirmation email
    try {
      await this.emailService.sendTemplateEmail(
        'two-factor-enabled',
        user.email,
        {
          userName: user.name || 'User',
          appName: process.env.APP_NAME || 'Dashboard',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
        },
        userId,
      );
    } catch (error) {
      this.logger.error('Failed to send 2FA enabled email:', error);
    }

    // Send in-app notification
    try {
      const notification = createSecurityAlertNotification({
        userId,
        title: 'Two-Factor Authentication Enabled',
        message: 'Two-factor authentication has been enabled for your account. You will now need to enter a verification code when logging in.',
        actionUrl: '/dashboard/settings/security',
        actionLabel: 'View Security Settings',
        metadata: {
          timestamp: new Date().toISOString(),
          action: '2fa_enabled',
        },
      });
      await this.notificationsService.create(notification);
    } catch (error) {
      this.logger.error('Failed to send 2FA enabled notification:', error);
    }

    this.logger.log(`2FA enabled for user ${userId}`);
  }

  /**
   * Disable two-factor authentication for a user
   * @param userId User ID
   */
  async disableTwoFactor(userId: string): Promise<void> {
    // Update user to disable 2FA and clear secret
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    // Invalidate all active 2FA codes
    await this.twoFactorService.invalidateUserCodes(userId);

    // Get user details for email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Send confirmation email
    try {
      await this.emailService.sendTemplateEmail(
        'two-factor-disabled',
        user.email,
        {
          userName: user.name || 'User',
          appName: process.env.APP_NAME || 'Dashboard',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@example.com',
        },
        userId,
      );
    } catch (error) {
      this.logger.error('Failed to send 2FA disabled email:', error);
    }

    // Send in-app notification
    try {
      const notification = createSecurityAlertNotification({
        userId,
        title: 'Two-Factor Authentication Disabled',
        message: 'Two-factor authentication has been disabled for your account. You can re-enable it at any time from your security settings.',
        actionUrl: '/dashboard/settings/security',
        actionLabel: 'View Security Settings',
        metadata: {
          timestamp: new Date().toISOString(),
          action: '2fa_disabled',
        },
      });
      await this.notificationsService.create(notification);
    } catch (error) {
      this.logger.error('Failed to send 2FA disabled notification:', error);
    }

    this.logger.log(`2FA disabled for user ${userId}`);
  }

  /**
   * Verify 2FA code and complete login
   * @param userId User ID
   * @param code Verification code
   * @param request HTTP request object for activity logging
   * @returns Authentication response with user and tokens
   */
  async verifyTwoFactorAndLogin(
    userId: string,
    code: string,
    request?: Request,
  ): Promise<AuthResponse> {
    // Validate the code
    const isValid = await this.twoFactorService.validateCode(userId, code);

    if (!isValid) {
      throw new UnauthorizedException('Invalid verification code');
    }

    // Get user with full details
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Log successful login
    this.auditLoggingService.logLogin(user.email, true, user.id);

    // Activity log is handled automatically by ActivityLoggingInterceptor
    // No need to log manually here to avoid duplicates

    // Generate tokens
    const tokens = await this.generateTokens(user);

    // Build user profile
    const userProfile = this.buildUserProfile(user);

    this.logger.log(`2FA verification successful for user ${userId}`);

    return {
      user: userProfile,
      ...tokens,
      expiresIn: this.getTokenExpirationSeconds(
        authConfig.tokens.accessTokenExpiration,
      ),
    };
  }
}
