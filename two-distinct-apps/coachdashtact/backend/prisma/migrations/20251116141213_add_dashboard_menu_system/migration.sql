-- CreateEnum
CREATE TYPE "PageType" AS ENUM ('WIDGET_BASED', 'HARDCODED', 'CUSTOM', 'EXTERNAL');

-- DropForeignKey
ALTER TABLE "widget_instances" DROP CONSTRAINT "widget_instances_widget_key_fkey";

-- CreateTable
CREATE TABLE "dashboard_menus" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "parent_id" TEXT,
    "page_type" "PageType" NOT NULL,
    "page_identifier" TEXT,
    "component_path" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "required_permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required_roles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "feature_flag" TEXT,
    "description" TEXT,
    "badge" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_menus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_menus_key_key" ON "dashboard_menus"("key");

-- CreateIndex
CREATE INDEX "dashboard_menus_key_idx" ON "dashboard_menus"("key");

-- CreateIndex
CREATE INDEX "dashboard_menus_is_active_idx" ON "dashboard_menus"("is_active");

-- CreateIndex
CREATE INDEX "dashboard_menus_order_idx" ON "dashboard_menus"("order");

-- CreateIndex
CREATE INDEX "dashboard_menus_parent_id_idx" ON "dashboard_menus"("parent_id");

-- AddForeignKey
ALTER TABLE "widget_instances" ADD CONSTRAINT "widget_instances_widget_key_fkey" FOREIGN KEY ("widget_key") REFERENCES "widget_definitions"("key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_menus" ADD CONSTRAINT "dashboard_menus_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "dashboard_menus"("id") ON DELETE SET NULL ON UPDATE CASCADE;
