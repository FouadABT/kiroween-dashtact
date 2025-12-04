export class ActivityLogResponseDto {
  id: string;
  action: string;
  userId: string | null;
  actorName: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;

  constructor(partial: Partial<ActivityLogResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ActivityLogListResponseDto {
  data: ActivityLogResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;

  constructor(partial: Partial<ActivityLogListResponseDto>) {
    Object.assign(this, partial);
  }
}
