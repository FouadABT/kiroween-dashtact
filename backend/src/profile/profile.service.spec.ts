import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('ProfileService', () => {
  let service: ProfileService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedPassword',
    avatarUrl: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    phone: '+1234567890',
    location: 'New York, NY',
    website: 'https://example.com',
    isActive: true,
    roleId: 'role-1',
    emailVerified: true,
    twoFactorEnabled: false,
    authProvider: 'local',
    lastPasswordChange: new Date('2024-01-01'),
    createdAt: new Date(),
    updatedAt: new Date(),
    role: {
      id: 'role-1',
      name: 'User',
      description: 'Standard user',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile with all fields', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile('user-1');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        avatarUrl: mockUser.avatarUrl,
        bio: mockUser.bio,
        phone: mockUser.phone,
        location: mockUser.location,
        website: mockUser.website,
        role: mockUser.role,
        emailVerified: mockUser.emailVerified,
        twoFactorEnabled: mockUser.twoFactorEnabled,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        lastPasswordChange: mockUser.lastPasswordChange,
      });
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
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

      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await service.updateProfile('user-1', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.bio).toBe(updateDto.bio);
      expect(result.phone).toBe(updateDto.phone);
      expect(result.location).toBe(updateDto.location);
      expect(result.website).toBe(updateDto.website);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: updateDto,
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
    });

    it('should update email if not in use', async () => {
      const updateDto = { email: 'newemail@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        email: updateDto.email,
      });

      const result = await service.updateProfile('user-1', updateDto);

      expect(result.email).toBe(updateDto.email);
    });

    it('should throw ConflictException if email already in use', async () => {
      const updateDto = { email: 'existing@example.com' };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'other-user',
        email: updateDto.email,
      });

      await expect(
        service.updateProfile('user-1', updateDto),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('uploadAvatar', () => {
    it('should update avatar URL', async () => {
      const avatarUrl = 'https://example.com/new-avatar.jpg';

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        avatarUrl,
      });

      const result = await service.uploadAvatar('user-1', avatarUrl);

      expect(result.avatarUrl).toBe(avatarUrl);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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
    });
  });

  describe('deleteAvatar', () => {
    it('should set avatar URL to null', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        avatarUrl: null,
      });

      const result = await service.deleteAvatar('user-1');

      expect(result.avatarUrl).toBeNull();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
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
    });
  });

  describe('changePassword', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should change password and update lastPasswordChange', async () => {
      const changePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      
      // Mock bcrypt functions
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(true);
      (bcrypt.hash as jest.Mock) = jest.fn().mockResolvedValue('hashedNewPassword');
      
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
        lastPasswordChange: new Date(),
      });

      await service.changePassword('user-1', changePasswordDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          password: 'hashedNewPassword',
          lastPasswordChange: expect.any(Date),
        },
      });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      const changePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'differentPassword',
      };

      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw UnauthorizedException if current password is incorrect', async () => {
      const changePasswordDto = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock) = jest.fn().mockResolvedValue(false);

      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw NotFoundException if user not found', async () => {
      const changePasswordDto = {
        currentPassword: 'oldPassword',
        newPassword: 'newPassword123',
        confirmPassword: 'newPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.changePassword('user-1', changePasswordDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
