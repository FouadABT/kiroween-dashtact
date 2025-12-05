import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly logger = new Logger(TwoFactorService.name);
  private readonly CODE_EXPIRATION_MINUTES = 10;
  private readonly MAX_ATTEMPTS_PER_CODE = 3;
  private readonly MAX_FAILED_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION_MINUTES = 15;
  private readonly MAX_CODE_REQUESTS_PER_WINDOW = 3;
  private readonly CODE_REQUEST_WINDOW_MINUTES = 10;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Generate a cryptographically secure 6-digit numeric code
   */
  generateCode(): string {
    // Generate a random number between 0 and 999999
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);
    const code = (randomNumber % 1000000).toString().padStart(6, '0');
    return code;
  }

  /**
   * Generate and send a verification code to the user
   */
  async generateAndSendCode(
    userId: string,
    email: string,
    ipAddress?: string,
  ): Promise<void> {
    // Check rate limiting for code generation
    await this.checkCodeGenerationRateLimit(userId);

    // Check if user is locked out
    await this.checkUserLockout(userId);

    // Invalidate all previous codes for this user
    await this.invalidateUserCodes(userId);

    // Generate new code
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRATION_MINUTES);

    // Store code in database
    await this.prisma.twoFactorCode.create({
      data: {
        userId,
        code,
        expiresAt,
        verified: false,
        attempts: 0,
      },
    });

    // Get user details for email
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // Send verification code via email
    try {
      await this.emailService.sendTemplateEmail(
        'two-factor-verification',
        email,
        {
          code,
          userName: user?.name || 'User',
          expiresIn: `${this.CODE_EXPIRATION_MINUTES} minutes`,
          ipAddress: ipAddress || 'Unknown',
          appName: process.env.APP_NAME || 'Dashboard',
        },
        userId,
      );

      this.logger.log(`2FA code sent to user ${userId} at ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send 2FA code to ${email}:`, error);
      throw new BadRequestException(
        'Failed to send verification code. Please try again.',
      );
    }
  }

  /**
   * Validate a verification code
   */
  async validateCode(userId: string, code: string): Promise<boolean> {
    // Check if user is locked out
    await this.checkUserLockout(userId);

    // Find the most recent active code for this user
    const twoFactorCode = await this.prisma.twoFactorCode.findFirst({
      where: {
        userId,
        code,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!twoFactorCode) {
      // Log failed attempt
      await this.logFailedAttempt(userId);
      throw new BadRequestException('Invalid verification code');
    }

    // Check if code has expired
    if (new Date() > twoFactorCode.expiresAt) {
      throw new BadRequestException(
        'Verification code has expired. Please request a new one.',
      );
    }

    // Check if max attempts exceeded for this code
    if (twoFactorCode.attempts >= this.MAX_ATTEMPTS_PER_CODE) {
      await this.invalidateUserCodes(userId);
      throw new BadRequestException(
        'Too many failed attempts. Please request a new code.',
      );
    }

    // Increment attempts
    await this.prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: {
        attempts: {
          increment: 1,
        },
      },
    });

    // Mark code as verified
    await this.prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: {
        verified: true,
      },
    });

    // Update user's last verification timestamp
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorVerifiedAt: new Date(),
      },
    });

    // Clear failed attempts counter
    await this.clearFailedAttempts(userId);

    this.logger.log(`2FA code verified successfully for user ${userId}`);
    return true;
  }

  /**
   * Invalidate all active codes for a user
   */
  async invalidateUserCodes(userId: string): Promise<void> {
    await this.prisma.twoFactorCode.updateMany({
      where: {
        userId,
        verified: false,
      },
      data: {
        verified: true, // Mark as verified to prevent reuse
      },
    });
  }

  /**
   * Check rate limiting for code generation
   */
  private async checkCodeGenerationRateLimit(userId: string): Promise<void> {
    const windowStart = new Date();
    windowStart.setMinutes(
      windowStart.getMinutes() - this.CODE_REQUEST_WINDOW_MINUTES,
    );

    const recentCodes = await this.prisma.twoFactorCode.count({
      where: {
        userId,
        createdAt: {
          gte: windowStart,
        },
      },
    });

    if (recentCodes >= this.MAX_CODE_REQUESTS_PER_WINDOW) {
      throw new BadRequestException(
        `Too many code requests. Please try again in ${this.CODE_REQUEST_WINDOW_MINUTES} minutes.`,
      );
    }
  }

  /**
   * Check if user is locked out due to failed attempts
   */
  private async checkUserLockout(userId: string): Promise<void> {
    const lockoutKey = `2fa_lockout_${userId}`;
    
    // Check if lockout record exists in database
    const lockout = await this.prisma.twoFactorCode.findFirst({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - this.LOCKOUT_DURATION_MINUTES * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        attempts: true,
        createdAt: true,
      },
    });

    // Count recent failed attempts
    const failedAttempts = await this.getFailedAttemptsCount(userId);

    if (failedAttempts >= this.MAX_FAILED_ATTEMPTS) {
      const lockoutEnd = new Date(
        Date.now() + this.LOCKOUT_DURATION_MINUTES * 60 * 1000,
      );
      throw new BadRequestException(
        `Account temporarily locked due to too many failed attempts. Please try again in ${this.LOCKOUT_DURATION_MINUTES} minutes.`,
      );
    }
  }

  /**
   * Log a failed verification attempt
   */
  private async logFailedAttempt(userId: string): Promise<void> {
    // Store failed attempt in metadata or separate table
    // For now, we'll use the attempts field on the most recent code
    const recentCode = await this.prisma.twoFactorCode.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    if (recentCode) {
      await this.prisma.twoFactorCode.update({
        where: { id: recentCode.id },
        data: {
          attempts: {
            increment: 1,
          },
        },
      });
    }
  }

  /**
   * Get count of failed attempts in the lockout window
   */
  private async getFailedAttemptsCount(userId: string): Promise<number> {
    const windowStart = new Date();
    windowStart.setMinutes(
      windowStart.getMinutes() - this.LOCKOUT_DURATION_MINUTES,
    );

    const codes = await this.prisma.twoFactorCode.findMany({
      where: {
        userId,
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        attempts: true,
      },
    });

    return codes.reduce((sum, code) => sum + code.attempts, 0);
  }

  /**
   * Clear failed attempts counter
   */
  private async clearFailedAttempts(userId: string): Promise<void> {
    // Reset attempts on all codes for this user
    await this.prisma.twoFactorCode.updateMany({
      where: { userId },
      data: {
        attempts: 0,
      },
    });
  }
}
