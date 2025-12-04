-- CreateIndex
CREATE INDEX "blog_posts_title_idx" ON "blog_posts"("title");

-- CreateIndex
CREATE INDEX "blog_posts_content_idx" ON "blog_posts"("content");

-- CreateIndex
CREATE INDEX "custom_pages_title_idx" ON "custom_pages"("title");

-- CreateIndex
CREATE INDEX "customers_first_name_idx" ON "customers"("first_name");

-- CreateIndex
CREATE INDEX "customers_last_name_idx" ON "customers"("last_name");

-- CreateIndex
CREATE INDEX "products_name_idx" ON "products"("name");

-- CreateIndex
CREATE INDEX "products_description_idx" ON "products"("description");

-- CreateIndex
CREATE INDEX "users_name_idx" ON "users"("name");
