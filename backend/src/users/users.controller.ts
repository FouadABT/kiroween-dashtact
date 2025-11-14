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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { ToggleStatusDto } from './dto/toggle-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   * POST /users
   * Requires: users:write permission
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('users:write')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'User created successfully',
      data: user,
    };
  }

  /**
   * Get all available roles
   * GET /users/roles
   * Requires: users:read permission
   */
  @Get('roles')
  @Permissions('users:read')
  async getRoles() {
    const roles = await this.usersService.getRoles();
    return {
      statusCode: HttpStatus.OK,
      message: 'Roles retrieved successfully',
      data: roles,
    };
  }

  /**
   * Get all users with filtering and pagination
   * GET /users
   * Requires: users:read permission
   */
  @Get()
  @Permissions('users:read')
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.usersService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: 'Users retrieved successfully',
      data: result,
    };
  }

  /**
   * Get user by ID
   * GET /users/:id
   * Requires: users:read permission
   */
  @Get(':id')
  @Permissions('users:read')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'User retrieved successfully',
      data: user,
    };
  }

  /**
   * Update user
   * PATCH /users/:id
   * Requires: users:write permission
   */
  @Patch(':id')
  @Permissions('users:write')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'User updated successfully',
      data: user,
    };
  }

  /**
   * Toggle user active status
   * PATCH /users/:id/status
   * Requires: users:write permission
   */
  @Patch(':id/status')
  @Permissions('users:write')
  async toggleStatus(
    @Param('id') id: string,
    @Body() toggleStatusDto: ToggleStatusDto,
  ) {
    const user = await this.usersService.toggleStatus(
      id,
      toggleStatusDto.isActive,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'User status updated successfully',
      data: user,
    };
  }

  /**
   * Soft delete user (deactivate)
   * DELETE /users/:id
   * Requires: users:delete permission
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('users:delete')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User deactivated successfully',
    };
  }

  /**
   * Hard delete user (permanent deletion)
   * DELETE /users/:id/permanent
   * Requires: users:delete permission
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions('users:delete')
  async hardDelete(@Param('id') id: string) {
    await this.usersService.hardDelete(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User permanently deleted',
    };
  }
}
