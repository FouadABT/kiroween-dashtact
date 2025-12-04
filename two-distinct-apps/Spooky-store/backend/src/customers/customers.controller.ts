import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import {
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * Get all customers with pagination and search
   * Requires: customers:read permission
   */
  @Get()
  @Permissions('customers:read')
  async findAll(@Query() query: CustomerQueryDto) {
    return this.customersService.findAll(query);
  }

  /**
   * Get a single customer by ID
   * Requires: customers:read permission
   */
  @Get(':id')
  @Permissions('customers:read')
  async findOne(@Param('id') id: string) {
    return this.customersService.findOne(id);
  }

  /**
   * Create a new customer
   * Requires: customers:write permission
   */
  @Post()
  @Permissions('customers:write')
  async create(@Body() dto: CreateCustomerDto) {
    return this.customersService.create(dto);
  }

  /**
   * Update a customer
   * Requires: customers:write permission
   */
  @Patch(':id')
  @Permissions('customers:write')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(id, dto);
  }

  /**
   * Delete a customer (only if no orders)
   * Requires: customers:delete permission
   */
  @Delete(':id')
  @Permissions('customers:delete')
  async delete(@Param('id') id: string) {
    await this.customersService.delete(id);
    return { message: 'Customer deleted successfully' };
  }

  /**
   * Generate portal token for customer
   * Requires: customers:write permission
   */
  @Post(':id/portal-token')
  @Permissions('customers:write')
  async generatePortalToken(@Param('id') id: string) {
    return this.customersService.generatePortalToken(id);
  }

  /**
   * Get customer by portal token (public endpoint)
   * No authentication required
   */
  @Public()
  @Get('portal/:token')
  async getByPortalToken(@Param('token') token: string) {
    return this.customersService.getByPortalToken(token);
  }

  /**
   * Get customer order history
   * Requires: customers:read permission
   */
  @Get(':id/orders')
  @Permissions('customers:read')
  async getOrderHistory(@Param('id') id: string) {
    return this.customersService.getOrderHistory(id);
  }

  /**
   * Get customer statistics
   * Requires: customers:read permission
   */
  @Get(':id/statistics')
  @Permissions('customers:read')
  async getStatistics(@Param('id') id: string) {
    return this.customersService.getStatistics(id);
  }
}
