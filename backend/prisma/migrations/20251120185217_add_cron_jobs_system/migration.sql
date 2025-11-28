-- CreateEnum
CREATE TYPE "CronLogStatus" AS ENUM ('RUNNING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "cron_jobs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "schedule" TEXT NOT NULL,
    "handler" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "last_run_at" TIMESTAMP(3),
    "next_run_at" TIMESTAMP(3),
    "success_count" INTEGER NOT NULL DEFAULT 0,
    "failure_count" INTEGER NOT NULL DEFAULT 0,
    "consecutive_failures" INTEGER NOT NULL DEFAULT 0,
    "average_duration" DOUBLE PRECISION,
    "notify_on_failure" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cron_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cron_logs" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "status" "CronLogStatus" NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "duration" INTEGER,
    "error" TEXT,
    "stack_trace" TEXT,
    "metadata" JSONB,

    CONSTRAINT "cron_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cron_jobs_name_key" ON "cron_jobs"("name");

-- CreateIndex
CREATE INDEX "cron_jobs_is_enabled_idx" ON "cron_jobs"("is_enabled");

-- CreateIndex
CREATE INDEX "cron_jobs_next_run_at_idx" ON "cron_jobs"("next_run_at");

-- CreateIndex
CREATE INDEX "cron_logs_job_id_started_at_idx" ON "cron_logs"("job_id", "started_at");

-- CreateIndex
CREATE INDEX "cron_logs_status_idx" ON "cron_logs"("status");

-- AddForeignKey
ALTER TABLE "cron_logs" ADD CONSTRAINT "cron_logs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "cron_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
