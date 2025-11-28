import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from '../notifications/notifications.service';
import { createSecurityAlertNotification, createUserActionNotification } from '../notifications/notification-helpers';
import { UsageTracker } from '../uploads/helpers/usage-tracker';

// Default role IDs from migration
const DEFAULT_ROLE_IDS = {
  USER: 'cldefault_user',
  ADMIN: 'cldefault_admin',
  MODERATOR: 'cldefault_moderator',
};

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private usageTracker: UsageTracker,
  ) {}

  /**
   * Create a new user
   */
  async create(createUserDto: CreateUserDto) {
    const { email, password, roleId, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Use provided roleId or default to USER role
    const finalRoleId = roleId || DEFAULT_ROLE_IDS.USER;

    // Verify role exists
    const roleExists = await this.prisma.userRole.findUnique({
      where: { id: finalRoleId },
    });

    if (!roleExists) {
      throw new BadRequestException('Invalid role ID');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with role relation
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        roleId: finalRoleId,
        ...userData,
      },
      include: {
        role: true, // Include role data in response
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find all users with optional filtering and pagination
   */
  async findAll(query: UserQueryDto) {
    const {
      page = 1,
      limit = 10,
      roleId,
      roleName,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (roleId) {
      where.roleId = roleId;
    }

    if (roleName) {
      where.role = {
        name: roleName,
      };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          role: true, // Include full role object
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    // Remove password from results
    const usersWithoutPassword = users.map(({ password, ...user }) => user);

    return {
      users: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Find user by ID
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        role: true, // Include role data
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Find user by email (for authentication)
   */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true, // Include role for auth context
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, roleId, ...updateData } = updateUserDto;

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // If email is being updated, check for conflicts
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // If roleId is being updated, verify it exists
    if (roleId) {
      const roleExists = await this.prisma.userRole.findUnique({
        where: { id: roleId },
      });

      if (!roleExists) {
        throw new BadRequestException('Invalid role ID');
      }
    }

    // Prepare update data
    const dataToUpdate: any = { ...updateData };

    if (roleId) {
      dataToUpdate.roleId = roleId;
    }

    // Hash new password if provided
    const passwordChanged = !!password;
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Check if role is changing
    const roleChanged = roleId && roleId !== existingUser.roleId;
    const oldRole = roleChanged ? await this.prisma.userRole.findUnique({ where: { id: existingUser.roleId } }) : null;

    // Update user
    const user = await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        role: true, // Include role data
      },
    });

    // Send password change notification
    if (passwordChanged) {
      try {
        const passwordNotification = createSecurityAlertNotification({
          userId: user.id,
          title: 'Password Changed',
          message: 'Your password has been successfully changed. If you did not make this change, please contact support immediately.',
          actionUrl: '/dashboard/settings/security',
          actionLabel: 'Review Security',
          metadata: {
            changedAt: new Date().toISOString(),
          },
        });
        await this.notificationsService.create(passwordNotification);
      } catch (notificationError) {
        console.error('Failed to send password change notification:', notificationError);
      }
    }

    // Send role change notification
    if (roleChanged && oldRole) {
      try {
        const roleNotification = createUserActionNotification({
          userId: user.id,
          title: 'Role Updated',
          message: `Your role has been changed from ${oldRole.name} to ${user.role.name}. Your permissions may have changed.`,
          actionUrl: '/dashboard/permissions',
          actionLabel: 'View Permissions',
          metadata: {
            oldRole: oldRole.name,
            newRole: user.role.name,
            changedAt: new Date().toISOString(),
          },
          requiredPermission: 'permissions:read',
        });
        await this.notificationsService.create(roleNotification);
      } catch (notificationError) {
        console.error('Failed to send role change notification:', notificationError);
      }
    }

    // Send profile update notification (if not password or role change)
    if (!passwordChanged && !roleChanged && Object.keys(updateData).length > 0) {
      try {
        const profileNotification = createUserActionNotification({
          userId: user.id,
          title: 'Profile Updated',
          message: 'Your profile information has been successfully updated.',
          actionUrl: '/dashboard/settings',
          actionLabel: 'View Profile',
          metadata: {
            updatedFields: Object.keys(updateData),
            updatedAt: new Date().toISOString(),
          },
        });
        await this.notificationsService.create(profileNotification);
      } catch (notificationError) {
        console.error('Failed to send profile update notification:', notificationError);
      }
    }

    // Track avatar usage if updated
    if (updateData.avatarUrl && updateData.avatarUrl !== existingUser.avatarUrl) {
      await this.usageTracker.trackUsage(updateData.avatarUrl, 'avatars', user.id);
    }

    // Remove password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Delete user (soft delete by setting isActive to false)
   */
  async remove(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Hard delete user (permanent deletion)
   */
  async hardDelete(id: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Toggle user active status
   */
  async toggleStatus(id: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      include: {
        role: true, // Include role data
      },
    });

    // Remove password
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  /**
   * Validate user password
   */
  async validatePassword(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }

  /**
   * Get all available roles
   */
  async getRoles() {
    return this.prisma.userRole.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get role by name (helper method)
   */
  getRoleByName(name: string) {
    return this.prisma.userRole.findUnique({
      where: { name },
    });
  }
}
