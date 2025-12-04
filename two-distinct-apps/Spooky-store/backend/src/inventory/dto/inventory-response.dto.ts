export class InventoryResponseDto {
  id: string;
  productVariantId: string;
  quantity: number;
  reserved: number;
  available: number;
  lowStockThreshold: number;
  trackInventory: boolean;
  allowBackorder: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastRestockedAt?: Date;
  productVariant?: {
    id: string;
    name: string;
    sku?: string;
    product: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export class InventoryAdjustmentResponseDto {
  id: string;
  inventoryId: string;
  quantityChange: number;
  reason: string;
  notes?: string;
  userId?: string;
  createdAt: Date;
}

export class PaginatedInventoryResponseDto {
  data: InventoryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
