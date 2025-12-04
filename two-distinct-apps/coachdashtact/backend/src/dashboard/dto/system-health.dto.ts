export class SystemHealthDto {
  cronJobSuccessRate: number;
  emailDeliveryRate: number;
  activeUsersCount: number;
  databaseStatus: string;
  systemUptime: number;
}
