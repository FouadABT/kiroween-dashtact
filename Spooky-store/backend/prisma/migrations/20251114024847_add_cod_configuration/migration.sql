-- AlterTable
ALTER TABLE "ecommerce_settings" ADD COLUMN     "cod_available_countries" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "cod_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cod_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "cod_max_order_amount" DECIMAL(10,2),
ADD COLUMN     "cod_min_order_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;
