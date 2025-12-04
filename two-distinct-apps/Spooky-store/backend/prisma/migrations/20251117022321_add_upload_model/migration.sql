-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('IMAGE', 'DOCUMENT', 'AVATAR', 'EDITOR_IMAGE');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE', 'ROLE_BASED');

-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" "UploadType" NOT NULL,
    "category" TEXT,
    "uploaded_by_id" TEXT NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "allowed_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "used_in" JSONB,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "alt_text" TEXT,
    "title" TEXT,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "width" INTEGER,
    "height" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "deleted_by_id" TEXT,

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uploads_filename_key" ON "uploads"("filename");

-- CreateIndex
CREATE INDEX "uploads_uploaded_by_id_idx" ON "uploads"("uploaded_by_id");

-- CreateIndex
CREATE INDEX "uploads_type_idx" ON "uploads"("type");

-- CreateIndex
CREATE INDEX "uploads_visibility_idx" ON "uploads"("visibility");

-- CreateIndex
CREATE INDEX "uploads_created_at_idx" ON "uploads"("created_at");

-- CreateIndex
CREATE INDEX "uploads_deleted_at_idx" ON "uploads"("deleted_at");

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_deleted_by_id_fkey" FOREIGN KEY ("deleted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
