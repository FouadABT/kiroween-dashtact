import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<ProfileResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      role: user.role,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      lastPasswordChange: user.lastPasswordChange,
    };
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    // Check if email is being changed and if it's already in use
    if (updateProfileDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateProfileDto.email },
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('Email already in use');
      }
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    this.logger.log(`Profile updated for user ${userId}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      website: updatedUser.website,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastPasswordChange: updatedUser.lastPasswordChange,
    };
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<ProfileResponseDto> {
    // Delete old avatar if exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    this.logger.log(`Avatar uploaded for user ${userId}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      website: updatedUser.website,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastPasswordChange: updatedUser.lastPasswordChange,
    };
  }

  async deleteAvatar(userId: string): Promise<ProfileResponseDto> {
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: null },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    this.logger.log(`Avatar deleted for user ${userId}`);

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      website: updatedUser.website,
      role: updatedUser.role,
      emailVerified: updatedUser.emailVerified,
      twoFactorEnabled: updatedUser.twoFactorEnabled,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      lastPasswordChange: updatedUser.lastPasswordChange,
    };
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    // Validate passwords match
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    // Get user with password
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isValid) {
      this.logger.warn(`Failed password change attempt for user ${userId}`);
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password and timestamp
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
      },
    });

    // Blacklist all existing tokens for this user
    await this.blacklistAllUserTokens(userId);

    this.logger.log(`Password changed successfully for user ${userId}`);

    // TODO: Send security notification email
    // This would integrate with the notification system
  }

  private async blacklistAllUserTokens(userId: string): Promise<void> {
    // Get all active tokens for the user
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    // In a real implementation, you would:
    // 1. Get all active JWT tokens for this user from a token store
    // 2. Add them to the blacklist
    // For now, we'll just log this action
    this.logger.log(`Blacklisting all tokens for user ${userId}`);

    // Note: The actual token blacklisting would happen in the auth service
    // when the user logs out or when tokens are validated
  }

  async getTwoFactorStatus(
    userId: string,
  ): Promise<{ enabled: boolean; verifiedAt?: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        twoFactorEnabled: true,
        twoFactorVerifiedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      enabled: user.twoFactorEnabled,
      verifiedAt: user.twoFactorVerifiedAt?.toISOString(),
    };
  }
}
