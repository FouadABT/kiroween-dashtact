import { Test, TestingModule } from '@nestjs/testing';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { UploadsService } from '../uploads/uploads.service';
import { BadRequestException } from '@nestjs/common';

describe('ProfileController', () => {
  let controller: ProfileController;
  let profileService: ProfileService;
  let uploadsService: UploadsService;

  const mockProfileService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    uploadAvatar: jest.fn(),
    deleteAvatar: jest.fn(),
    changePassword: jest.fn(),
  };

  const mockUploadsService = {
    uploadAvatar: jest.fn(),
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
  };

  const mockProfile = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    phone: '+1234567890',
    location: 'New York, NY',
    website: 'https://example.com',
    role: {
      id: 'role-1',
      name: 'User',
      description: 'Standard user',
    },
    emailVerified: true,
    twoFactorEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastPasswordChange: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfileController],
      providers: [
        {
          provide: ProfileService,
          useValue: mockProfileService,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
      ],
    }).compile();

    controller = module.get<ProfileController>(ProfileController);
    profileService = module.get<ProfileService>(ProfileService);
    uploadsService = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockProfileService.getProfile.mockResolvedValue(mockProfile);

      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockProfile);
      expect(mockProfileService.getProfile).toHaveBeenCalledWith('user-1');
    });
  });

  describe('updateProfile', () => {
    it('should update profile with new fields', async () => {
      const updateDto = {
        name: 'Updated Name',
        bio: 'Updated bio',
        phone: '+9876543210',
        location: 'San Francisco, CA',
        website: 'https://newsite.com',
      };

      mockProfileService.updateProfile.mockResolvedValue({
        ...mockProfile,
        ...updateDto,
      });

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.bio).toBe(updateDto.bio);
      expect(result.phone).toBe(updateDto.phone);
      expect(result.location).toBe(updateDto.location);
      expect(result.website).toBe(updateDto.website);
      expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
        'user-1',
        updateDto,
      );
    });
  });

  describe('uploadAvatar', () => {
    it('should upload avatar successfully', async () => {
      const mockFile = {
        originalname: 'avatar.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
      } as Express.Multer.File;

      const uploadResult = {
        url: 'https://example.com/new-avatar.jpg',
        filename: 'avatar.jpg',
        size: 1024 * 1024,
        mimetype: 'image/jpeg',
      };

      mockUploadsService.uploadAvatar.mockResolvedValue(uploadResult);
      mockProfileService.uploadAvatar.mockResolvedValue({
        ...mockProfile,
        avatarUrl: uploadResult.url,
      });

      const result = await controller.uploadAvatar(mockUser, mockFile);

      expect(result.avatarUrl).toBe(uploadResult.url);
      expect(mockUploadsService.uploadAvatar).toHaveBeenCalledWith(
        mockFile,
        'user-1',
      );
      expect(mockProfileService.uploadAvatar).toHaveBeenCalledWith(
        'user-1',
        uploadResult.url,
      );
    });

    it('should throw BadRequestException if no file uploaded', async () => {
      await expect(
        controller.uploadAvatar(mockUser, undefined as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid file type', async () => {
      const mockFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024,
      } as Express.Multer.File;

      await expect(
        controller.uploadAvatar(mockUser, mockFile),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file size exceeds limit', async () => {
      const mockFile = {
        originalname: 'large-avatar.jpg',
        mimetype: 'image/jpeg',
        size: 6 * 1024 * 1024, // 6MB
      } as Express.Multer.File;

      await expect(
        controller.uploadAvatar(mockUser, mockFile),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAvatar', () => {
    it('should delete avatar successfully', async () => {
      mockProfileService.deleteAvatar.mockResolvedValue({
        ...mockProfile,
        avatarUrl: null,
      });

      const result = await controller.deleteAvatar(mockUser);

      expect(result.avatarUrl).toBeNull();
      expect(mockProfileService.deleteAvatar).toHaveBeenCalledWith('user-1');
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const changePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      mockProfileService.changePassword.mockResolvedValue(undefined);

      const result = await controller.changePassword(
        mockUser,
        changePasswordDto,
      );

      expect(result).toEqual({
        message: 'Password changed successfully. Please log in again.',
      });
      expect(mockProfileService.changePassword).toHaveBeenCalledWith(
        'user-1',
        changePasswordDto,
      );
    });
  });
});
