import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    // Check if permission already exists
    const existing = await this.prisma.permission.findUnique({
      where: { name: createPermissionDto.name },
    });

    if (existing) {
      throw new ConflictException(`Permission '${createPermissionDto.name}' already exists`);
    }

    return this.prisma.permission.create({
      data: createPermissionDto,
    });
  }

  async findAll(): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' },
      ],
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID '${id}' not found`);
    }

    return permission;
  }

  async findByName(name: string): Promise<Permission | null> {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    // Check if permission exists
    await this.findOne(id);

    // If updating name, check for conflicts
    if (updatePermissionDto.name) {
      const existing = await this.prisma.permission.findUnique({
        where: { name: updatePermissionDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(`Permission '${updatePermissionDto.name}' already exists`);
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data: updatePermissionDto,
    });
  }

  async remove(id: string): Promise<Permission> {
    // Check if permission exists
    await this.findOne(id);

    return this.prisma.permission.delete({
      where: { id },
    });
  }

  async findByResource(resource: string): Promise<Permission[]> {
    return this.prisma.permission.findMany({
      where: { resource },
      orderBy: { action: 'asc' },
    });
  }

  // Role-Permission Management Methods

  async assignPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    // Verify role exists
    const role = await this.prisma.userRole.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    // Verify permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID '${permissionId}' not found`);
    }

    // Check if assignment already exists
    const existing = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Permission '${permission.name}' is already assigned to role '${role.name}'`,
      );
    }

    // Create the assignment
    await this.prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });
  }

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    // Verify the assignment exists
    const assignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Permission assignment not found for role '${roleId}' and permission '${permissionId}'`,
      );
    }

    // Remove the assignment
    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });
  }

  async getRolePermissions(roleId: string): Promise<Permission[]> {
    // Verify role exists
    const role = await this.prisma.userRole.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${roleId}' not found`);
    }

    return role.rolePermissions.map((rp) => rp.permission);
  }

  async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    // Get user with role and permissions
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
      return false;
    }

    // Get all permissions for the user's role
    const permissions = user.role.rolePermissions.map((rp) => rp.permission.name);

    // Check for super admin permission (*:*)
    if (permissions.includes('*:*')) {
      return true;
    }

    // Check for exact permission match
    if (permissions.includes(permissionName)) {
      return true;
    }

    // Check for wildcard resource permission (e.g., users:* matches users:read)
    const [resource, action] = permissionName.split(':');
    const wildcardResourcePermission = `${resource}:*`;
    if (permissions.includes(wildcardResourcePermission)) {
      return true;
    }

    // Check for wildcard action permission (e.g., *:read matches users:read)
    const wildcardActionPermission = `*:${action}`;
    if (permissions.includes(wildcardActionPermission)) {
      return true;
    }

    return false;
  }

  async userHasAnyPermission(userId: string, permissionNames: string[]): Promise<boolean> {
    for (const permissionName of permissionNames) {
      if (await this.userHasPermission(userId, permissionName)) {
        return true;
      }
    }
    return false;
  }

  async userHasAllPermissions(userId: string, permissionNames: string[]): Promise<boolean> {
    for (const permissionName of permissionNames) {
      if (!(await this.userHasPermission(userId, permissionName))) {
        return false;
      }
    }
    return true;
  }
}
