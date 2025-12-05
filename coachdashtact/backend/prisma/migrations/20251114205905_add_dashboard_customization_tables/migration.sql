-- CreateTable
CREATE TABLE "widget_definitions" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "default_grid_span" INTEGER NOT NULL DEFAULT 6,
    "min_grid_span" INTEGER NOT NULL DEFAULT 3,
    "max_grid_span" INTEGER NOT NULL DEFAULT 12,
    "config_schema" JSONB NOT NULL,
    "data_requirements" JSONB NOT NULL,
    "use_cases" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "examples" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_system_widget" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dashboard_layouts" (
    "id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "user_id" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'global',
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dashboard_layouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "widget_instances" (
    "id" TEXT NOT NULL,
    "layout_id" TEXT NOT NULL,
    "widget_key" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "grid_span" INTEGER NOT NULL DEFAULT 6,
    "grid_row" INTEGER,
    "config" JSONB NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "widget_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "widget_definitions_key_key" ON "widget_definitions"("key");

-- CreateIndex
CREATE INDEX "widget_definitions_key_idx" ON "widget_definitions"("key");

-- CreateIndex
CREATE INDEX "widget_definitions_category_idx" ON "widget_definitions"("category");

-- CreateIndex
CREATE INDEX "widget_definitions_is_active_idx" ON "widget_definitions"("is_active");

-- CreateIndex
CREATE INDEX "dashboard_layouts_page_id_idx" ON "dashboard_layouts"("page_id");

-- CreateIndex
CREATE INDEX "dashboard_layouts_user_id_idx" ON "dashboard_layouts"("user_id");

-- CreateIndex
CREATE INDEX "dashboard_layouts_scope_idx" ON "dashboard_layouts"("scope");

-- CreateIndex
CREATE INDEX "dashboard_layouts_is_default_idx" ON "dashboard_layouts"("is_default");

-- CreateIndex
CREATE UNIQUE INDEX "dashboard_layouts_page_id_user_id_key" ON "dashboard_layouts"("page_id", "user_id");

-- CreateIndex
CREATE INDEX "widget_instances_layout_id_idx" ON "widget_instances"("layout_id");

-- CreateIndex
CREATE INDEX "widget_instances_widget_key_idx" ON "widget_instances"("widget_key");

-- CreateIndex
CREATE INDEX "widget_instances_position_idx" ON "widget_instances"("position");

-- AddForeignKey
ALTER TABLE "dashboard_layouts" ADD CONSTRAINT "dashboard_layouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_instances" ADD CONSTRAINT "widget_instances_layout_id_fkey" FOREIGN KEY ("layout_id") REFERENCES "dashboard_layouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "widget_instances" ADD CONSTRAINT "widget_instances_widget_key_fkey" FOREIGN KEY ("widget_key") REFERENCES "widget_definitions"("key") ON UPDATE CASCADE;
