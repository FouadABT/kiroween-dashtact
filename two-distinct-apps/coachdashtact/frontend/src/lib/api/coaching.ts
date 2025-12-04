/**
 * Coaching Platform API Client
 * 
 * API methods for coaching platform features including members, coaches,
 * availability, sessions, and bookings.
 */

import { ApiClient } from '../api';
import type {
  MemberProfile,
  CoachProfile,
  CoachAvailability,
  Session,
  SessionBooking,
  AvailableSlot,
  CreateMemberDto,
  UpdateMemberDto,
  AssignCoachDto,
  CreateCoachProfileDto,
  UpdateCoachProfileDto,
  CreateAvailabilityDto,
  UpdateAvailabilityDto,
  GetAvailableSlotsDto,
  CreateSessionDto,
  UpdateSessionDto,
  CompleteSessionDto,
  RateSessionDto,
  CreateBookingDto,
} from '@/types/coaching';

/**
 * Members API
 */
export class MembersApi {
  /**
   * Get current user's member profile
   */
  static async getMe(): Promise<MemberProfile> {
    return ApiClient.get('/members/me');
  }

  /**
   * Get all members (filtered by role)
   */
  static async getAll(): Promise<MemberProfile[]> {
    return ApiClient.get('/members');
  }

  /**
   * Get member by ID
   */
  static async getById(id: string): Promise<MemberProfile> {
    return ApiClient.get(`/members/${id}`);
  }

  /**
   * Create member profile
   */
  static async create(data: CreateMemberDto): Promise<MemberProfile> {
    return ApiClient.post('/members', data);
  }

  /**
   * Update member profile
   */
  static async update(id: string, data: UpdateMemberDto): Promise<MemberProfile> {
    return ApiClient.patch(`/members/${id}`, data);
  }

  /**
   * Assign coach to member
   */
  static async assignCoach(memberId: string, data: AssignCoachDto): Promise<MemberProfile> {
    return ApiClient.patch(`/members/${memberId}/assign-coach`, data);
  }

  /**
   * Update member onboarding status
   */
  static async updateOnboarding(memberId: string, status: string): Promise<MemberProfile> {
    return ApiClient.patch(`/members/${memberId}/onboarding`, { status });
  }

  /**
   * Get members by coach ID
   */
  static async getByCoach(coachId: string): Promise<MemberProfile[]> {
    return ApiClient.get(`/members/coach/${coachId}`);
  }
}

/**
 * Coaches API
 */
export class CoachesApi {
  /**
   * Get all available coaches
   */
  static async getAvailable(): Promise<CoachProfile[]> {
    return ApiClient.get('/members/coaches/available');
  }

  /**
   * Get coach profile by user ID
   */
  static async getByUserId(userId: string): Promise<CoachProfile> {
    return ApiClient.get(`/members/coach-profile/${userId}`);
  }

  /**
   * Create coach profile
   */
  static async create(data: CreateCoachProfileDto): Promise<CoachProfile> {
    return ApiClient.post('/members/coach-profile', data);
  }

  /**
   * Update coach profile
   */
  static async update(data: UpdateCoachProfileDto): Promise<CoachProfile> {
    return ApiClient.patch('/members/coach-profile', data);
  }

  /**
   * Get current user's coach profile with member count and rating
   */
  static async getMyProfile(): Promise<CoachProfile> {
    return ApiClient.get('/members/coach-profile/me');
  }

  /**
   * Get coach profile with member count
   */
  static async getProfile(userId: string): Promise<CoachProfile> {
    return ApiClient.get(`/members/coach-profile/${userId}`);
  }
}

/**
 * Coach Availability API
 */
export class CoachAvailabilityApi {
  /**
   * Get current user's availability
   */
  static async getMine(): Promise<CoachAvailability[]> {
    return ApiClient.get('/coach-availability');
  }

  /**
   * Get specific coach's availability
   */
  static async getByCoach(coachId: string): Promise<CoachAvailability[]> {
    return ApiClient.get(`/coach-availability/${coachId}`);
  }

  /**
   * Get available booking slots
   */
  static async getAvailableSlots(
    coachId: string,
    params: GetAvailableSlotsDto
  ): Promise<AvailableSlot[]> {
    const query = new URLSearchParams({
      startDate: params.startDate,
      endDate: params.endDate,
      ...(params.duration && { duration: params.duration.toString() }),
    });
    return ApiClient.get(`/coach-availability/${coachId}/slots?${query}`);
  }

  /**
   * Create availability slot
   */
  static async create(data: CreateAvailabilityDto): Promise<CoachAvailability> {
    return ApiClient.post('/coach-availability', data);
  }

  /**
   * Update availability slot
   */
  static async update(id: string, data: UpdateAvailabilityDto): Promise<CoachAvailability> {
    return ApiClient.patch(`/coach-availability/${id}`, data);
  }

  /**
   * Delete availability slot
   */
  static async delete(id: string): Promise<void> {
    return ApiClient.delete(`/coach-availability/${id}`);
  }
}

/**
 * Sessions API
 */
export class SessionsApi {
  /**
   * Get all sessions (filtered by role)
   */
  static async getAll(): Promise<Session[]> {
    return ApiClient.get('/sessions');
  }

  /**
   * Get session by ID
   */
  static async getById(id: string): Promise<Session> {
    return ApiClient.get(`/sessions/${id}`);
  }

  /**
   * Create session
   */
  static async create(data: CreateSessionDto): Promise<Session> {
    return ApiClient.post('/sessions', data);
  }

  /**
   * Update session
   */
  static async update(id: string, data: UpdateSessionDto): Promise<Session> {
    return ApiClient.patch(`/sessions/${id}`, data);
  }

  /**
   * Complete session
   */
  static async complete(id: string, data: CompleteSessionDto): Promise<Session> {
    return ApiClient.patch(`/sessions/${id}/complete`, data);
  }

  /**
   * Cancel session
   */
  static async cancel(id: string, reason?: string): Promise<Session> {
    return ApiClient.patch(`/sessions/${id}/cancel`, { reason });
  }

  /**
   * Add coach notes to session
   */
  static async addCoachNotes(id: string, notes: string): Promise<Session> {
    return ApiClient.post(`/sessions/${id}/coach-notes`, { notes });
  }

  /**
   * Add member notes to session
   */
  static async addMemberNotes(id: string, notes: string): Promise<Session> {
    return ApiClient.post(`/sessions/${id}/member-notes`, { notes });
  }

  /**
   * Rate session
   */
  static async rate(id: string, data: RateSessionDto): Promise<Session> {
    return ApiClient.post(`/sessions/${id}/rate`, data);
  }

  /**
   * Get upcoming sessions
   */
  static async getUpcoming(): Promise<Session[]> {
    return ApiClient.get('/sessions/upcoming');
  }

  /**
   * Get sessions by member ID
   */
  static async getByMember(memberId: string): Promise<Session[]> {
    return ApiClient.get(`/sessions/member/${memberId}`);
  }

  /**
   * Get sessions by coach ID
   */
  static async getByCoach(coachId: string): Promise<Session[]> {
    return ApiClient.get(`/sessions/coach/${coachId}`);
  }
}

/**
 * Bookings API
 */
export class BookingsApi {
  /**
   * Get all bookings (filtered by role)
   */
  static async getAll(): Promise<SessionBooking[]> {
    return ApiClient.get('/bookings');
  }

  /**
   * Get booking by ID
   */
  static async getById(id: string): Promise<SessionBooking> {
    return ApiClient.get(`/bookings/${id}`);
  }

  /**
   * Create booking
   */
  static async create(data: CreateBookingDto): Promise<SessionBooking> {
    return ApiClient.post('/bookings', data);
  }

  /**
   * Cancel booking
   */
  static async cancel(id: string, reason?: string): Promise<void> {
    return ApiClient.delete(`/bookings/${id}`, reason ? { reason } : undefined);
  }

  /**
   * Get pending bookings (coach only)
   */
  static async getPending(): Promise<SessionBooking[]> {
    return ApiClient.get('/bookings/pending');
  }
}
