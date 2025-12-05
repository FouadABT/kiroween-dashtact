export class DailyRevenueDto {
  date: string;
  revenue: number;
  orders: number;
}

export class CategoryRevenueDto {
  category: string;
  revenue: number;
}

export class RevenueDataDto {
  daily: DailyRevenueDto[];
  averageOrderValue: number;
  totalRevenue: number;
  totalOrders: number;
  byCategory: CategoryRevenueDto[];
}
