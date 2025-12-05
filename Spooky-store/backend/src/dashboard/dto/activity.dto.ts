export class ActivityDto {
  id: string;
  type: 'order' | 'customer' | 'product' | 'blog' | 'cron' | 'email' | 'user' | 'notification' | 'message' | 'upload' | 'inventory';
  description: string;
  timestamp: Date;
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}
