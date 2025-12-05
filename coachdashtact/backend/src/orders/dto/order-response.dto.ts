import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  productId: string;

  @ApiPropertyOptional()
  productVariantId?: string;

  @ApiProperty()
  productName: string;

  @ApiPropertyOptional()
  variantName?: string;

  @ApiPropertyOptional()
  sku?: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  createdAt: Date;
}

export class OrderStatusHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  fromStatus?: OrderStatus;

  @ApiProperty({ enum: OrderStatus })
  toStatus: OrderStatus;

  @ApiPropertyOptional()
  userId?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderNumber: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  @ApiProperty({ enum: PaymentStatus })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: FulfillmentStatus })
  fulfillmentStatus: FulfillmentStatus;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  tax: number;

  @ApiProperty()
  shipping: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  total: number;

  @ApiProperty()
  shippingAddress: any;

  @ApiProperty()
  billingAddress: any;

  @ApiPropertyOptional()
  shippingMethodId?: string;

  @ApiPropertyOptional()
  trackingNumber?: string;

  @ApiProperty()
  customerEmail: string;

  @ApiProperty()
  customerName: string;

  @ApiPropertyOptional()
  customerPhone?: string;

  @ApiPropertyOptional()
  customerNotes?: string;

  @ApiPropertyOptional()
  internalNotes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  paidAt?: Date;

  @ApiPropertyOptional()
  shippedAt?: Date;

  @ApiPropertyOptional()
  deliveredAt?: Date;

  @ApiPropertyOptional()
  cancelledAt?: Date;

  @ApiPropertyOptional({ type: [OrderItemResponseDto] })
  items?: OrderItemResponseDto[];

  @ApiPropertyOptional({ type: [OrderStatusHistoryDto] })
  statusHistory?: OrderStatusHistoryDto[];
}

export class OrderListResponseDto {
  @ApiProperty({ type: [OrderResponseDto] })
  orders: OrderResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
