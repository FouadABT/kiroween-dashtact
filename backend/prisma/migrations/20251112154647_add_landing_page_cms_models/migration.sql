-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "PageVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateTable
CREATE TABLE "landing_page_content" (
    "id" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "settings" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "landing_page_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_pages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featured_image" TEXT,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "PageVisibility" NOT NULL DEFAULT 'PUBLIC',
    "parent_page_id" TEXT,
    "show_in_navigation" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "meta_title" TEXT,
    "meta_description" TEXT,
    "meta_keywords" TEXT,
    "custom_css_class" TEXT,
    "template_key" TEXT DEFAULT 'default',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "custom_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_redirects" (
    "id" TEXT NOT NULL,
    "from_slug" TEXT NOT NULL,
    "to_page_id" TEXT NOT NULL,
    "redirect_type" INTEGER NOT NULL DEFAULT 301,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_redirects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "custom_pages_slug_key" ON "custom_pages"("slug");

-- CreateIndex
CREATE INDEX "custom_pages_slug_idx" ON "custom_pages"("slug");

-- CreateIndex
CREATE INDEX "custom_pages_status_idx" ON "custom_pages"("status");

-- CreateIndex
CREATE INDEX "custom_pages_visibility_idx" ON "custom_pages"("visibility");

-- CreateIndex
CREATE INDEX "custom_pages_parent_page_id_idx" ON "custom_pages"("parent_page_id");

-- CreateIndex
CREATE INDEX "custom_pages_show_in_navigation_display_order_idx" ON "custom_pages"("show_in_navigation", "display_order");

-- CreateIndex
CREATE INDEX "custom_pages_published_at_idx" ON "custom_pages"("published_at");

-- CreateIndex
CREATE UNIQUE INDEX "page_redirects_from_slug_key" ON "page_redirects"("from_slug");

-- CreateIndex
CREATE INDEX "page_redirects_from_slug_idx" ON "page_redirects"("from_slug");

-- CreateIndex
CREATE INDEX "page_redirects_to_page_id_idx" ON "page_redirects"("to_page_id");

-- AddForeignKey
ALTER TABLE "custom_pages" ADD CONSTRAINT "custom_pages_parent_page_id_fkey" FOREIGN KEY ("parent_page_id") REFERENCES "custom_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_redirects" ADD CONSTRAINT "page_redirects_to_page_id_fkey" FOREIGN KEY ("to_page_id") REFERENCES "custom_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
