-- CreateEnum
CREATE TYPE "LegalPageType" AS ENUM ('TERMS', 'PRIVACY');

-- CreateTable
CREATE TABLE "legal_pages" (
    "id" TEXT NOT NULL,
    "pageType" "LegalPageType" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "legal_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_pages_pageType_key" ON "legal_pages"("pageType");

-- CreateIndex
CREATE INDEX "legal_pages_pageType_idx" ON "legal_pages"("pageType");
