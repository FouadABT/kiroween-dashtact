import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('users/roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Create a new role
   * POST /users/roles
   * Requires: *:* permission (super admin only)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('*:*')
  async create(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.rolesService.create(createRoleDto);
    return role;
  }

  /**
   * Get all roles
   * GET /users/roles
   * Requires: users:read permission
   */
  @Get()
  @Permissions('users:read')
  async findAll() {
    return this.rolesService.findAll();
  }

  /**
   * Get role by ID
   * GET /users/roles/:id
   * Requires: users:read permission
   */
  @Get(':id')
  @Permissions('users:read')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * Update role
   * PATCH /users/roles/:id
   * Requires: *:* permission (super admin only)
   */
  @Patch(':id')
  @Permissions('*:*')
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * Delete role
   * DELETE /users/roles/:id
   * Requires: *:* permission (super admin only)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('*:*')
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
  }
}
