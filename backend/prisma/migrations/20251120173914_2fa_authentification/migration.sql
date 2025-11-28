-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_secret" TEXT,
ADD COLUMN     "two_factor_verified_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "two_factor_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "two_factor_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "two_factor_codes_user_id_idx" ON "two_factor_codes"("user_id");

-- CreateIndex
CREATE INDEX "two_factor_codes_code_idx" ON "two_factor_codes"("code");

-- CreateIndex
CREATE INDEX "two_factor_codes_expires_at_idx" ON "two_factor_codes"("expires_at");

-- AddForeignKey
ALTER TABLE "two_factor_codes" ADD CONSTRAINT "two_factor_codes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
