import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ProfileResponseDto } from './dto/profile-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadsService } from '../uploads/uploads.service';
import { AuthService } from '../auth/auth.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly uploadsService: UploadsService,
    private readonly authService: AuthService,
  ) {}

  @Get()
  async getProfile(@CurrentUser() user: any): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ProfileResponseDto> {
    return this.profileService.updateProfile(user.id, updateProfileDto);
  }

  @Post('avatar')
  @Throttle({ default: { limit: 10, ttl: 3600000 } }) // 10 uploads per hour
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ url: string; filename: string; size: number; mimeType: string }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    const baseUrl = process.env.APP_URL || 'http://localhost:3001';
    
    // Create upload record using uploads service
    // Note: Static files are served at /files/ prefix (see main.ts)
    const upload = await this.uploadsService.create(
      {
        filename: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        url: `${baseUrl}/files/${file.filename}`,
        path: file.path,
        type: 'AVATAR',
      },
      user.id,
    );

    // Update user profile with new avatar URL
    await this.profileService.uploadAvatar(user.id, upload.url);
    
    // Return avatar upload response matching frontend expectations
    return {
      url: upload.url,
      filename: file.filename,
      size: file.size,
      mimeType: file.mimetype,
    };
  }

  @Delete('avatar')
  async deleteAvatar(@CurrentUser() user: any): Promise<ProfileResponseDto> {
    return this.profileService.deleteAvatar(user.id);
  }

  @Post('password')
  @Throttle({ default: { limit: 3, ttl: 900000 } }) // 3 attempts per 15 minutes
  async changePassword(
    @CurrentUser() user: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.profileService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully. Please log in again.' };
  }

  @Get('two-factor/status')
  async getTwoFactorStatus(
    @CurrentUser() user: any,
  ): Promise<{ enabled: boolean; verifiedAt?: string }> {
    return this.profileService.getTwoFactorStatus(user.id);
  }

  @Post('two-factor/enable')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 attempts per hour
  async enableTwoFactor(
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.authService.enableTwoFactor(user.id);
    return { message: 'Two-factor authentication has been enabled successfully.' };
  }

  @Post('two-factor/disable')
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 attempts per hour
  async disableTwoFactor(
    @CurrentUser() user: any,
  ): Promise<{ message: string }> {
    await this.authService.disableTwoFactor(user.id);
    return { message: 'Two-factor authentication has been disabled successfully.' };
  }
}
