-- CreateTable
CREATE TABLE "ecommerce_settings" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "user_id" TEXT,
    "store_name" TEXT NOT NULL DEFAULT 'My Store',
    "store_description" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "currency_symbol" TEXT NOT NULL DEFAULT '$',
    "taxRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "tax_label" TEXT NOT NULL DEFAULT 'Tax',
    "shipping_enabled" BOOLEAN NOT NULL DEFAULT true,
    "portal_enabled" BOOLEAN NOT NULL DEFAULT true,
    "allow_guest_checkout" BOOLEAN NOT NULL DEFAULT false,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "auto_generate_order_numbers" BOOLEAN NOT NULL DEFAULT true,
    "order_number_prefix" TEXT NOT NULL DEFAULT 'ORD',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ecommerce_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ecommerce_settings_user_id_key" ON "ecommerce_settings"("user_id");

-- CreateIndex
CREATE INDEX "ecommerce_settings_scope_idx" ON "ecommerce_settings"("scope");

-- CreateIndex
CREATE INDEX "ecommerce_settings_user_id_idx" ON "ecommerce_settings"("user_id");
