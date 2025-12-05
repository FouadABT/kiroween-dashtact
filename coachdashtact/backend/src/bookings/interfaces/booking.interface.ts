/**
 * Booking-related interfaces for type safety
 */

export interface BookingWithRelations {
  id: string;
  memberId: string;
  coachId: string;
  requestedDate: Date;
  requestedTime: string;
  duration: number;
  status: string; // Changed from union to string to match Prisma return type
  memberNotes: string | null;
  sessionId: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
  member: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string | null;
      email: string;
      avatarUrl: string | null;
    };
  };
  coach: {
    id: string;
    name: string | null;
    email: string;
    avatarUrl: string | null;
  };
  session: {
    id: string;
    calendarEventId: string;
    scheduledAt: Date;
    status: string;
  } | null;
}

export interface AuthenticatedRequest {
  user: {
    userId: string;
    role: string;
    email: string;
  };
}
