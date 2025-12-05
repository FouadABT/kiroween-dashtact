import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    // Check if role with same name already exists
    const existing = await this.prisma.userRole.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new ConflictException(`Role with name '${createRoleDto.name}' already exists`);
    }

    return this.prisma.userRole.create({
      data: {
        name: createRoleDto.name,
        description: createRoleDto.description,
        isActive: createRoleDto.isActive ?? true,
        isSystemRole: false, // User-created roles are never system roles
      },
    });
  }

  async findAll() {
    return this.prisma.userRole.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            users: true,
            rolePermissions: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.userRole.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    // Check if role exists
    const role = await this.prisma.userRole.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    // Prevent updating system roles
    if (role.isSystemRole) {
      throw new BadRequestException('Cannot update system roles');
    }

    // If updating name, check for conflicts
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.prisma.userRole.findUnique({
        where: { name: updateRoleDto.name },
      });

      if (existing) {
        throw new ConflictException(`Role with name '${updateRoleDto.name}' already exists`);
      }
    }

    return this.prisma.userRole.update({
      where: { id },
      data: {
        name: updateRoleDto.name,
        description: updateRoleDto.description,
        isActive: updateRoleDto.isActive,
      },
    });
  }

  async remove(id: string) {
    // Check if role exists
    const role = await this.prisma.userRole.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID '${id}' not found`);
    }

    // Prevent deleting system roles
    if (role.isSystemRole) {
      throw new BadRequestException('Cannot delete system roles');
    }

    // Prevent deleting roles with assigned users
    if (role._count.users > 0) {
      throw new BadRequestException(
        `Cannot delete role '${role.name}' because it has ${role._count.users} assigned user(s). Please reassign these users first.`
      );
    }

    // Delete role (this will cascade delete role permissions)
    await this.prisma.userRole.delete({
      where: { id },
    });
  }
}
