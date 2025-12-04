import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a secure reset token for a user
   * @param userId User ID
   * @returns Raw token (to be sent in email)
   */
  async createResetToken(userId: string): Promise<string> {
    // Generate cryptographically secure random token (32 bytes = 64 hex characters)
    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash token for storage
    const hashedToken = this.hashToken(rawToken);

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store hashed token in database
    await this.prisma.passwordResetToken.create({
      data: {
        userId,
        token: hashedToken,
        expiresAt,
      },
    });

    this.logger.log(`Password reset token created for user ${userId}`);

    // Return raw token (never store this)
    return rawToken;
  }

  /**
   * Hash token using SHA-256
   * @param token Raw token
   * @returns Hashed token
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Validate reset token
   * @param rawToken Raw token from user
   * @returns User object if valid, null otherwise
   */
  async validateToken(rawToken: string): Promise<any> {
    // Hash the provided token
    const hashedToken = this.hashToken(rawToken);

    // Find token in database
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    // Check if token exists
    if (!resetToken) {
      this.logger.warn('Invalid reset token provided');
      return null;
    }

    // Check if token is already used
    if (resetToken.isUsed) {
      this.logger.warn(`Reset token already used for user ${resetToken.userId}`);
      return null;
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      this.logger.warn(`Reset token expired for user ${resetToken.userId}`);
      return null;
    }

    return resetToken.user;
  }

  /**
   * Mark token as used
   * @param rawToken Raw token
   */
  async markTokenAsUsed(rawToken: string): Promise<void> {
    const hashedToken = this.hashToken(rawToken);

    await this.prisma.passwordResetToken.update({
      where: { token: hashedToken },
      data: { isUsed: true },
    });

    this.logger.log('Reset token marked as used');
  }

  /**
   * Invalidate all reset tokens for a user
   * @param userId User ID
   */
  async invalidateUserTokens(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    this.logger.log(`All reset tokens invalidated for user ${userId}`);
  }

  /**
   * Clean up expired tokens (runs daily at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupExpiredTokens(): Promise<void> {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const result = await this.prisma.passwordResetToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { isUsed: true, createdAt: { lt: sevenDaysAgo } },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired/used password reset tokens`);
  }
}
