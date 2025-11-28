export class LowStockProductDto {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorderThreshold: number;
  price: number;
}

export class OutOfStockProductDto {
  id: string;
  name: string;
  sku: string;
}

export class InventoryDataDto {
  lowStock: LowStockProductDto[];
  outOfStock: OutOfStockProductDto[];
  totalValue: number;
}
