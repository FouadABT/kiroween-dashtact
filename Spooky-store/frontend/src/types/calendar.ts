// Calendar Event Types

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  allDay: boolean;
  location?: string;
  color?: string;
  category: EventCategory;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY';
  creator: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  recurrenceRule?: RecurrenceRule;
  parentEventId?: string;
  attendees: EventAttendee[];
  reminders: EventReminder[];
  linkedEntities?: EventEntityLink[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface EventCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  isSystem: boolean;
  displayOrder: number;
  isActive: boolean;
}

export interface RecurrenceRule {
  id: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  byDay?: number[]; // 0=Sun, 6=Sat
  byMonthDay?: number[];
  byMonth?: number[];
  count?: number;
  until?: string;
  exceptions?: string[];
}

export interface EventAttendee {
  id: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  teamId?: string;
  responseStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'TENTATIVE';
  isOrganizer: boolean;
}

export interface EventReminder {
  id: string;
  minutesBefore: number;
  isSent: boolean;
  sentAt?: string;
}

export interface EventEntityLink {
  id: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
}

export interface CalendarSettings {
  id: string;
  userId?: string;
  defaultView: 'month' | 'week' | 'day' | 'agenda';
  weekStartsOn: number;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: number[];
  timeZone: string;
  defaultReminders: number[];
  showWeekNumbers: boolean;
}

export interface CalendarFilters {
  categories?: string[];
  users?: string[];
  teams?: string[];
  statuses?: ('SCHEDULED' | 'CANCELLED' | 'COMPLETED')[];
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda' | 'timeline';

// Create/Update DTOs

export interface CreateEventDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  location?: string;
  color?: string;
  categoryId: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY';
  attendeeIds?: string[];
  recurrenceRule?: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
    interval?: number;
    byDay?: number[];
    byMonthDay?: number[];
    byMonth?: number[];
    count?: number;
    until?: string;
    exceptions?: string[];
  };
  reminders?: number[];
  linkedEntities?: {
    entityType: string;
    entityId: string;
    metadata?: Record<string, any>;
  }[];
  metadata?: Record<string, any>;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
  status?: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDto extends Partial<CreateCategoryDto> {}

export interface UpdateCalendarSettingsDto {
  defaultView?: 'month' | 'week' | 'day' | 'agenda';
  weekStartsOn?: number;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  workingDays?: number[];
  timeZone?: string;
  defaultReminders?: number[];
  showWeekNumbers?: boolean;
}
