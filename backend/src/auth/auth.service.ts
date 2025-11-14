import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
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

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly auditLoggingService: AuditLoggingService,
    private readonly notificationsService: NotificationsService,
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

      // Get default role
      const defaultRole = await this.prisma.userRole.findFirst({
        where: { name: authConfig.defaultRole },
      });

      if (!defaultRole) {
        throw new Error('Default role not found. Please run database seed.');
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

      // Send welcome notification
      try {
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
      } catch (notificationError) {
        // Don't fail registration if notification fails
        console.error('Failed to send welcome notification:', notificationError);
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
   * @returns Authentication response with user and tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
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

      // Log successful login
      this.auditLoggingService.logLogin(email, true, user.id);

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
        this.auditLoggingService.logTokenRefresh(
          payload.sub,
          false,
          undefined,
          undefined,
          'User not found',
        );
        throw new UnauthorizedException('User not found');
      }

      // Log successful token refresh
      this.auditLoggingService.logTokenRefresh(user.id, true);

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
   */
  async logout(userId: string, refreshToken: string): Promise<void> {
    try {
      // Verify token belongs to user
      const payload =
        await this.jwtService.verifyAsync<JwtPayload>(refreshToken);

      if (payload.sub !== userId) {
        throw new UnauthorizedException('Invalid token');
      }

      // Add token to blacklist
      await this.revokeToken(refreshToken);

      // Log logout event
      this.auditLoggingService.logLogout(userId, payload.email);
    } catch (error) {
      // Even if verification fails, we don't throw to allow logout
      // This prevents users from being stuck if they have an invalid token
      // Still log the logout attempt
      this.auditLoggingService.logLogout(userId);
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
}
