-- AlterTable
ALTER TABLE "landing_page_content" ADD COLUMN     "footer_config_id" TEXT,
ADD COLUMN     "header_config_id" TEXT,
ADD COLUMN     "theme_mode" TEXT NOT NULL DEFAULT 'auto';

-- CreateTable
CREATE TABLE "header_configs" (
    "id" TEXT NOT NULL,
    "logo_light" TEXT,
    "logo_dark" TEXT,
    "logo_size" TEXT NOT NULL DEFAULT 'md',
    "logo_link" TEXT NOT NULL DEFAULT '/',
    "navigation" JSONB NOT NULL,
    "ctas" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "mobileMenu" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "header_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "footer_configs" (
    "id" TEXT NOT NULL,
    "layout" TEXT NOT NULL DEFAULT 'multi-column',
    "columns" JSONB NOT NULL,
    "social" JSONB NOT NULL,
    "newsletter" JSONB NOT NULL,
    "copyright" TEXT NOT NULL,
    "legalLinks" JSONB NOT NULL,
    "style" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "footer_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "thumbnail" TEXT,
    "section" JSONB NOT NULL,
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_analytics" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "device_type" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "referrer" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "landing_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "section_templates_category_idx" ON "section_templates"("category");

-- CreateIndex
CREATE INDEX "section_templates_user_id_idx" ON "section_templates"("user_id");

-- CreateIndex
CREATE INDEX "section_templates_is_custom_idx" ON "section_templates"("is_custom");

-- CreateIndex
CREATE INDEX "landing_analytics_page_id_timestamp_idx" ON "landing_analytics"("page_id", "timestamp");

-- CreateIndex
CREATE INDEX "landing_analytics_event_type_idx" ON "landing_analytics"("event_type");

-- CreateIndex
CREATE INDEX "landing_analytics_session_id_idx" ON "landing_analytics"("session_id");

-- CreateIndex
CREATE INDEX "landing_page_content_header_config_id_idx" ON "landing_page_content"("header_config_id");

-- CreateIndex
CREATE INDEX "landing_page_content_footer_config_id_idx" ON "landing_page_content"("footer_config_id");

-- AddForeignKey
ALTER TABLE "section_templates" ADD CONSTRAINT "section_templates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_page_content" ADD CONSTRAINT "landing_page_content_header_config_id_fkey" FOREIGN KEY ("header_config_id") REFERENCES "header_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_page_content" ADD CONSTRAINT "landing_page_content_footer_config_id_fkey" FOREIGN KEY ("footer_config_id") REFERENCES "footer_configs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
