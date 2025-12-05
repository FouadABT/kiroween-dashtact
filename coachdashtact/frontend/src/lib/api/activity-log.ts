import { ApiClient } from '@/lib/api';
import type {
  ActivityLog,
  ActivityLogFilters,
  ActivityLogResponse,
  CreateActivityLogDto,
} from '@/types/activity-log';

export const ActivityLogApi = {
  /**
   * Get all activity logs with optional filters
   */
  async getAll(filters?: ActivityLogFilters): Promise<ActivityLogResponse> {
    return ApiClient.get<ActivityLogResponse>('/activity-logs', filters as Record<string, unknown>);
  },

  /**
   * Get a single activity log by ID
   */
  async getById(id: string): Promise<ActivityLog> {
    return ApiClient.get<ActivityLog>(`/activity-logs/${id}`);
  },

  /**
   * Create a new activity log entry
   */
  async create(data: CreateActivityLogDto): Promise<ActivityLog> {
    return ApiClient.post<ActivityLog>('/activity-logs', data);
  },
};
