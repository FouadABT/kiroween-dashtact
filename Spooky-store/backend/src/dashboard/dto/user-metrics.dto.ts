export class RoleCountDto {
  role: string;
  count: number;
}

export class UserMetricsDto {
  totalUsers: number;
  activeUsers: number;
  newRegistrationsToday: number;
  usersByRole: RoleCountDto[];
}
