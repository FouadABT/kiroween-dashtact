-- CreateTable
CREATE TABLE "settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "theme_mode" TEXT NOT NULL DEFAULT 'system',
    "active_theme" TEXT NOT NULL DEFAULT 'default',
    "light_palette" JSONB NOT NULL,
    "dark_palette" JSONB NOT NULL,
    "typography" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_user_id_key" ON "settings"("user_id");

-- CreateIndex
CREATE INDEX "settings_user_id_idx" ON "settings"("user_id");

-- CreateIndex
CREATE INDEX "settings_scope_idx" ON "settings"("scope");
