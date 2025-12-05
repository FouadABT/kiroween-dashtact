import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { AssignPermissionDto } from './dto/assign-permission.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post()
  @Permissions('permissions:write')
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @Permissions('permissions:read')
  findAll(@Query('resource') resource?: string) {
    if (resource) {
      return this.permissionsService.findByResource(resource);
    }
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @Permissions('permissions:read')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @Permissions('permissions:write')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete(':id')
  @Permissions('permissions:write')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }

  // Role-Permission Management Endpoints

  @Post('assign')
  @Permissions('permissions:write')
  async assignPermissionToRole(@Body() assignDto: AssignPermissionDto) {
    await this.permissionsService.assignPermissionToRole(
      assignDto.roleId,
      assignDto.permissionId,
    );
    return { message: 'Permission assigned successfully' };
  }

  @Delete('assign')
  @Permissions('permissions:write')
  async removePermissionFromRole(@Body() assignDto: AssignPermissionDto) {
    await this.permissionsService.removePermissionFromRole(
      assignDto.roleId,
      assignDto.permissionId,
    );
    return { message: 'Permission removed successfully' };
  }

  @Get('role/:roleId')
  @Permissions('permissions:read')
  getRolePermissions(@Param('roleId') roleId: string) {
    return this.permissionsService.getRolePermissions(roleId);
  }

  @Get('user/:userId/check/:permission')
  @Permissions('permissions:read')
  async checkUserPermission(
    @Param('userId') userId: string,
    @Param('permission') permission: string,
  ) {
    const hasPermission = await this.permissionsService.userHasPermission(userId, permission);
    return { hasPermission };
  }
}

