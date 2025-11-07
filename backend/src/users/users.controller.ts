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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
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
   */
  @Get('roles')
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
   */
  @Get()
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
   */
  @Get(':id')
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
   */
  @Patch(':id')
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
   */
  @Patch(':id/status')
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
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
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
   */
  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string) {
    await this.usersService.hardDelete(id);
    return {
      statusCode: HttpStatus.NO_CONTENT,
      message: 'User permanently deleted',
    };
  }
}
