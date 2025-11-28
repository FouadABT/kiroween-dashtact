export class TopProductDto {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantitySold: number;
  revenue: number;
}

export class CategorySalesDto {
  category: string;
  quantity: number;
  revenue: number;
}

export class SalesDataDto {
  topProducts: TopProductDto[];
  byCategory: CategorySalesDto[];
}
