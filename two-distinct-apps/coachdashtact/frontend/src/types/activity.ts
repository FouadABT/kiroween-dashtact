/**
 * Activity Types
 * 
 * Type definitions for dashboard activity feed
 */

/**
 * Activity type enum matching backend ActivityDto
 */
export type ActivityType = 
  | 'order' 
  | 'customer' 
  | 'product' 
  | 'blog' 
  | 'cron' 
  | 'email' 
  | 'user'
  | 'notification'
  | 'message'
  | 'upload'
  | 'inventory';

/**
 * Activity item interface matching backend ActivityDto
 */
export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date | string;
  entityId: string;
  entityType: string;
  metadata?: Record<string, any>;
}

/**
 * Activity query parameters
 */
export interface ActivityQueryParams {
  limit?: number;
  type?: ActivityType;
  startDate?: string;
  endDate?: string;
}
