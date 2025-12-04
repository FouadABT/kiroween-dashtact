-- CreateTable
CREATE TABLE "member_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "coach_id" TEXT,
    "membershipStatus" TEXT NOT NULL DEFAULT 'active',
    "onboardingStatus" TEXT NOT NULL DEFAULT 'pending',
    "goals" TEXT,
    "health_info" TEXT,
    "coach_notes" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "specialization" TEXT,
    "bio" TEXT,
    "certifications" TEXT,
    "max_members" INTEGER NOT NULL DEFAULT 20,
    "is_accepting_members" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coach_availability" (
    "id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "max_sessions_per_slot" INTEGER NOT NULL DEFAULT 1,
    "buffer_minutes" INTEGER NOT NULL DEFAULT 15,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "calendar_event_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'scheduled',
    "duration" INTEGER NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "coach_notes" TEXT,
    "member_notes" TEXT,
    "outcomes" TEXT,
    "rating" INTEGER,
    "rating_feedback" TEXT,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_bookings" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,
    "requested_date" TIMESTAMP(3) NOT NULL,
    "requested_time" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "member_notes" TEXT,
    "session_id" TEXT,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_bookings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_profiles_user_id_key" ON "member_profiles"("user_id");

-- CreateIndex
CREATE INDEX "member_profiles_coach_id_idx" ON "member_profiles"("coach_id");

-- CreateIndex
CREATE INDEX "member_profiles_membershipStatus_idx" ON "member_profiles"("membershipStatus");

-- CreateIndex
CREATE INDEX "member_profiles_user_id_idx" ON "member_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "coach_profiles_user_id_key" ON "coach_profiles"("user_id");

-- CreateIndex
CREATE INDEX "coach_profiles_is_accepting_members_idx" ON "coach_profiles"("is_accepting_members");

-- CreateIndex
CREATE INDEX "coach_profiles_user_id_idx" ON "coach_profiles"("user_id");

-- CreateIndex
CREATE INDEX "coach_availability_coach_id_idx" ON "coach_availability"("coach_id");

-- CreateIndex
CREATE INDEX "coach_availability_dayOfWeek_idx" ON "coach_availability"("dayOfWeek");

-- CreateIndex
CREATE INDEX "coach_availability_is_active_idx" ON "coach_availability"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_calendar_event_id_key" ON "sessions"("calendar_event_id");

-- CreateIndex
CREATE INDEX "sessions_member_id_idx" ON "sessions"("member_id");

-- CreateIndex
CREATE INDEX "sessions_coach_id_idx" ON "sessions"("coach_id");

-- CreateIndex
CREATE INDEX "sessions_status_idx" ON "sessions"("status");

-- CreateIndex
CREATE INDEX "sessions_scheduled_at_idx" ON "sessions"("scheduled_at");

-- CreateIndex
CREATE INDEX "sessions_calendar_event_id_idx" ON "sessions"("calendar_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "session_bookings_session_id_key" ON "session_bookings"("session_id");

-- CreateIndex
CREATE INDEX "session_bookings_member_id_idx" ON "session_bookings"("member_id");

-- CreateIndex
CREATE INDEX "session_bookings_coach_id_idx" ON "session_bookings"("coach_id");

-- CreateIndex
CREATE INDEX "session_bookings_status_idx" ON "session_bookings"("status");

-- CreateIndex
CREATE INDEX "session_bookings_requested_date_idx" ON "session_bookings"("requested_date");

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_profiles" ADD CONSTRAINT "member_profiles_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_profiles" ADD CONSTRAINT "coach_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_availability" ADD CONSTRAINT "coach_availability_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_calendar_event_id_fkey" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "member_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_bookings" ADD CONSTRAINT "session_bookings_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
