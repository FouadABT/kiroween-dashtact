// Coaching Platform Types

export interface MemberProfile {
  id: string;
  userId: string;
  coachId: string | null;
  membershipStatus: 'active' | 'inactive' | 'paused';
  onboardingStatus: 'pending' | 'in_progress' | 'completed';
  goals: string | null;
  healthInfo: string | null;
  coachNotes: string | null;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  coach?: User;
  sessions?: Session[];
  bookings?: SessionBooking[];
}

export interface CoachProfile {
  id: string;
  userId: string;
  specialization: string | null;
  bio: string | null;
  certifications: string | null;
  maxMembers: number;
  isAcceptingMembers: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  user?: User;
  availability?: CoachAvailability[];
  sessions?: Session[];
  bookings?: SessionBooking[];
  // Computed
  currentMemberCount?: number;
  averageRating?: number;
  totalRatings?: number;
  availableCapacity?: number;
  isAtCapacity?: boolean;
}

export interface CoachAvailability {
  id: string;
  coachId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  maxSessionsPerSlot: number;
  bufferMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Relations
  coach?: User;
}

export interface Session {
  id: string;
  calendarEventId: string;
  memberId: string;
  coachId: string;
  type: 'initial' | 'regular' | 'followup';
  status: 'scheduled' | 'completed' | 'cancelled';
  duration: number; // minutes
  scheduledAt: string;
  coachNotes: string | null;
  memberNotes: string | null;
  outcomes: string | null;
  rating: number | null; // 1-5
  ratingFeedback: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  calendarEvent?: CalendarEvent;
  member?: MemberProfile;
  coach?: User;
  booking?: SessionBooking;
}

export interface SessionBooking {
  id: string;
  memberId: string;
  coachId: string;
  requestedDate: string;
  requestedTime: string; // HH:mm format
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  memberNotes: string | null;
  sessionId: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  // Relations
  member?: MemberProfile;
  coach?: User;
  session?: Session;
}

export interface AvailableSlot {
  date: string;
  time: string; // HH:mm format
  availableCapacity: number;
  maxCapacity: number;
}

// User type (simplified - extend as needed)
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  roleId: string;
  role?: {
    id: string;
    name: string;
  };
}

// Calendar Event type (simplified)
export interface CalendarEvent {
  id: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
}

// DTOs for API requests

export interface CreateMemberDto {
  userId: string;
  coachId?: string;
  goals?: string;
  healthInfo?: string;
}

export interface UpdateMemberDto {
  goals?: string;
  healthInfo?: string;
  coachNotes?: string;
  membershipStatus?: 'active' | 'inactive' | 'paused';
}

export interface AssignCoachDto {
  coachId: string;
}

export interface CreateCoachProfileDto {
  userId: string;
  specialization?: string;
  bio?: string;
  certifications?: string;
  maxMembers?: number;
  isAcceptingMembers?: boolean;
}

export interface UpdateCoachProfileDto {
  specialization?: string;
  bio?: string;
  certifications?: string;
  maxMembers?: number;
  isAcceptingMembers?: boolean;
}

export interface CreateAvailabilityDto {
  coachId?: string;  // Optional - will be auto-filled from authenticated user
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxSessionsPerSlot?: number;
  bufferMinutes?: number;
}

export interface UpdateAvailabilityDto {
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
  maxSessionsPerSlot?: number;
  bufferMinutes?: number;
  isActive?: boolean;
}

export interface GetAvailableSlotsDto {
  startDate: string;
  endDate: string;
  duration?: number;
}

export interface CreateSessionDto {
  memberId: string;
  coachId: string;
  scheduledAt: string;
  duration: number;
  type: 'initial' | 'regular' | 'followup';
  memberNotes?: string;
  createGroupChat?: boolean;
}

export interface UpdateSessionDto {
  scheduledAt?: string;
  duration?: number;
  type?: 'initial' | 'regular' | 'followup';
  memberNotes?: string;
}

export interface CompleteSessionDto {
  coachNotes: string;
  outcomes?: string;
}

export interface RateSessionDto {
  rating: number; // 1-5
  feedback?: string;
}

export interface CreateBookingDto {
  memberId: string;
  coachId: string;
  requestedDate: string;
  requestedTime: string;
  duration: number;
  memberNotes?: string;
}

export interface CancelBookingDto {
  reason?: string;
}

export interface AddNotesDto {
  notes: string;
}

export interface CancelSessionDto {
  reason?: string;
}

// API Response types

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
