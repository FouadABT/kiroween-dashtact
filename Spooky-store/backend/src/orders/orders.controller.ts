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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import {
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderQueryDto,
  AddOrderNoteDto,
  OrderResponseDto,
  OrderListResponseDto,
  OrderStatusHistoryDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FeatureGuard } from '../common/guards/feature.guard';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@ApiTags('orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, PermissionsGuard, FeatureGuard)
@FeatureEnabled('ecommerce')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @Permissions('orders:read')
  @ApiOperation({ summary: 'Get all orders with filtering' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: OrderListResponseDto,
  })
  async findAll(@Query() query: OrderQueryDto): Promise<OrderListResponseDto> {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @Permissions('orders:read')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Get('number/:orderNumber')
  @Permissions('orders:read')
  @ApiOperation({ summary: 'Get order by order number' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findByOrderNumber(
    @Param('orderNumber') orderNumber: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Post()
  @Permissions('orders:write')
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 404, description: 'Customer or product not found' })
  @ApiResponse({ status: 409, description: 'Insufficient inventory' })
  async create(@Body() dto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(dto);
  }

  @Patch(':id/status')
  @Permissions('orders:write')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, dto, user.id);
  }

  @Post(':id/notes')
  @Permissions('orders:write')
  @ApiOperation({ summary: 'Add a note to an order' })
  @ApiResponse({
    status: 200,
    description: 'Note added successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async addNote(
    @Param('id') id: string,
    @Body() dto: AddOrderNoteDto,
    @CurrentUser() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.addNote(id, dto, user.id);
  }

  @Post(':id/cancel')
  @Permissions('orders:delete')
  @ApiOperation({ summary: 'Cancel an order' })
  @ApiResponse({
    status: 200,
    description: 'Order cancelled successfully',
    type: OrderResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel order in current status' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async cancel(
    @Param('id') id: string,
    @Body() dto: AddOrderNoteDto,
    @CurrentUser() user: any,
  ): Promise<OrderResponseDto> {
    return this.ordersService.cancel(id, dto.note, user.id);
  }

  @Get(':id/history')
  @Permissions('orders:read')
  @ApiOperation({ summary: 'Get order status history' })
  @ApiResponse({
    status: 200,
    description: 'Status history retrieved successfully',
    type: [OrderStatusHistoryDto],
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async getStatusHistory(
    @Param('id') id: string,
  ): Promise<OrderStatusHistoryDto[]> {
    return this.ordersService.getStatusHistory(id);
  }
}
