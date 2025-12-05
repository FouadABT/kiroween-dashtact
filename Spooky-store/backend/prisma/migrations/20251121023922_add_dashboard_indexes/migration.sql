-- CreateIndex
CREATE INDEX "blog_posts_status_created_at_idx" ON "blog_posts"("status", "created_at");

-- CreateIndex
CREATE INDEX "cron_logs_started_at_status_idx" ON "cron_logs"("started_at", "status");

-- CreateIndex
CREATE INDEX "email_logs_created_at_status_idx" ON "email_logs"("created_at", "status");

-- CreateIndex
CREATE INDEX "inventory_quantity_low_stock_threshold_idx" ON "inventory"("quantity", "low_stock_threshold");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");
