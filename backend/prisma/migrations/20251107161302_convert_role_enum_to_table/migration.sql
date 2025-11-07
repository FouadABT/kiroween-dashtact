/*
  Warnings:

  - Converting UserRole from ENUM to relational table
  - Migrating existing user role data
  - Renaming timestamp columns to snake_case

*/

-- Step 1: Create the user_roles table
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- Step 2: Create unique index on role name
CREATE UNIQUE INDEX "user_roles_name_key" ON "user_roles"("name");

-- Step 3: Insert default roles (preserving the original enum values)
INSERT INTO "user_roles" ("id", "name", "description", "isActive", "created_at", "updated_at")
VALUES 
    ('cldefault_user', 'USER', 'Standard user with basic permissions', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cldefault_admin', 'ADMIN', 'Administrator with full system access', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('cldefault_moderator', 'MODERATOR', 'Moderator with content management permissions', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Step 4: Add new columns to users table (with temporary nullable constraint)
ALTER TABLE "users" 
ADD COLUMN "role_id" TEXT,
ADD COLUMN "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Step 5: Migrate existing role data to role_id
UPDATE "users" 
SET "role_id" = CASE 
    WHEN "role" = 'USER' THEN 'cldefault_user'
    WHEN "role" = 'ADMIN' THEN 'cldefault_admin'
    WHEN "role" = 'MODERATOR' THEN 'cldefault_moderator'
    ELSE 'cldefault_user'
END;

-- Step 6: Copy timestamp data
UPDATE "users" 
SET "created_at" = "createdAt",
    "updated_at" = "updatedAt";

-- Step 7: Make role_id NOT NULL now that data is migrated
ALTER TABLE "users" ALTER COLUMN "role_id" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;

-- Step 8: Drop old columns
ALTER TABLE "users" 
DROP COLUMN "createdAt",
DROP COLUMN "role",
DROP COLUMN "updatedAt";

-- Step 9: Drop the old enum type
DROP TYPE "UserRole";

-- Step 10: Create index on role_id for better query performance
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- Step 11: Add foreign key constraint
ALTER TABLE "users" 
ADD CONSTRAINT "users_role_id_fkey" 
FOREIGN KEY ("role_id") REFERENCES "user_roles"("id") 
ON DELETE RESTRICT 
ON UPDATE CASCADE;
