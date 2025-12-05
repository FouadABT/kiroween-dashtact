-- CreateTable
CREATE TABLE "brand_settings" (
    "id" TEXT NOT NULL,
    "brand_name" TEXT NOT NULL DEFAULT 'Dashboard',
    "tagline" TEXT,
    "description" TEXT,
    "logo_url" TEXT,
    "logo_dark_url" TEXT,
    "favicon_url" TEXT,
    "website_url" TEXT,
    "support_email" TEXT,
    "social_links" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brand_settings_pkey" PRIMARY KEY ("id")
);
