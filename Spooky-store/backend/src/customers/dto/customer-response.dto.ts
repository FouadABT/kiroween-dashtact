export class CustomerResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  company?: string;
  shippingAddress?: any;
  billingAddress?: any;
  notes?: string;
  tags: string[];
  portalToken?: string;
  portalExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  lastOrderAt?: Date;
  orderCount?: number;
  totalSpent?: number;
}

export class CustomerListResponseDto {
  customers: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerStatisticsDto {
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;
}
