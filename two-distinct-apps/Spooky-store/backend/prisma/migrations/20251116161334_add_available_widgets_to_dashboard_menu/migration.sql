-- AlterTable
ALTER TABLE "dashboard_menus" ADD COLUMN     "available_widgets" TEXT[] DEFAULT ARRAY[]::TEXT[];
