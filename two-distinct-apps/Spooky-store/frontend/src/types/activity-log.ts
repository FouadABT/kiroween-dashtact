export interface ActivityLog {
  id: string;
  action: string;
  userId: string | null;
  actorName: string;
  entityType: string | null;
  entityId: string | null;
  metadata: Record<string, any> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface ActivityLogFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export interface ActivityLogResponse {
  data: ActivityLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateActivityLogDto {
  action: string;
  userId?: string;
  actorName?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Common action types
export enum ActivityAction {
  // Authentication
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_REGISTER = 'USER_REGISTER',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  
  // User Management
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',
  USER_ROLE_CHANGED = 'USER_ROLE_CHANGED',
  
  // Content Management
  PAGE_CREATED = 'PAGE_CREATED',
  PAGE_UPDATED = 'PAGE_UPDATED',
  PAGE_DELETED = 'PAGE_DELETED',
  PAGE_PUBLISHED = 'PAGE_PUBLISHED',
  
  BLOG_POST_CREATED = 'BLOG_POST_CREATED',
  BLOG_POST_UPDATED = 'BLOG_POST_UPDATED',
  BLOG_POST_DELETED = 'BLOG_POST_DELETED',
  BLOG_POST_PUBLISHED = 'BLOG_POST_PUBLISHED',
  
  // E-commerce
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
  
  ORDER_CREATED = 'ORDER_CREATED',
  ORDER_UPDATED = 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
  
  // Settings
  SETTINGS_UPDATED = 'SETTINGS_UPDATED',
  MENU_UPDATED = 'MENU_UPDATED',
  WIDGET_ADDED = 'WIDGET_ADDED',
  WIDGET_REMOVED = 'WIDGET_REMOVED',
  
  // System
  SYSTEM_ERROR = 'SYSTEM_ERROR',
  SYSTEM_WARNING = 'SYSTEM_WARNING',
}
