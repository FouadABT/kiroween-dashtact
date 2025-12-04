#!/usr/bin/env ts-node

/**
 * Migration Script for Permission-Based Authentication System
 * 
 * This script migrates existing systems from a simple role-based system
 * to the new permission-based RBAC system.
 * 
 * Features:
 * - Database backup before migration
 * - Maps existing roles to new permission system
 * - Verifies all users have valid role assignments
 * - Provides rollback instructions
 * - Validates migration success
 * 
 * Usage:
 *   npm run migrate:permissions
 *   or
 *   ts-node backend/src/scripts/migrate-to-permissions.ts
 * 
 * IMPORTANT: Always backup your database before running this script!
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

const prisma = new PrismaClient();

interface MigrationConfig {
  backupPath: string;
  dryRun: boolean;
  verbose: boolean;
}

interface RoleMapping {
  roleName: string;
  permissions: string[];
  isSystemRole: boolean;
}

/**
 * Default role to permission mappings
 * Customize these based on your existing role structure
 */
const DEFAULT_ROLE_MAPPINGS: RoleMapping[] = [
  {
    roleName: 'Super Admin',
    permissions: ['*:*'],
    isSystemRole: true,
  },
  {
    roleName: 'Admin',
    permissions: [
      'users:read',
      'users:write',
      'users:delete',
      'roles:read',
      'roles:write',
      'permissions:read',
      'permissions:write',
      'settings:read',
      'settings:write',
      'profile:write',
    ],
    isSystemRole: true,
  },
  {
    roleName: 'Manager',
    permissions: [
      'users:read',
      'users:write',
      'roles:read',
      'settings:read',
      'profile:write',
    ],
    isSystemRole: false,
  },
  {
    roleName: 'User',
    permissions: ['users:read', 'profile:write', 'settings:read'],
    isSystemRole: true,
  },
];

/**
 * Create readline interface for user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * Ask user a yes/no question
 */
async function askYesNo(question: string): Promise<boolean> {
  const rl = createReadlineInterface();

  return new Promise((resolve) => {
    rl.question(`${question} (y/n): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Log with timestamp
 */
function log(message: string, config: MigrationConfig) {
  if (config.verbose) {
    console.log(`[${new Date().toISOString()}] ${message}`);
  } else {
    console.log(message);
  }
}

/**
 * Step 1: Create database backup
 */
async function createBackup(config: MigrationConfig): Promise<void> {
  log('📦 Creating database backup...', config);

  try {
    // Export current state to JSON
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
    });

    const roles = await prisma.userRole.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    const permissions = await prisma.permission.findMany();
    const rolePermissions = await prisma.rolePermission.findMany();

    const backup = {
      timestamp: new Date().toISOString(),
      users,
      roles,
      permissions,
      rolePermissions,
    };

    // Ensure backup directory exists
    const backupDir = path.dirname(config.backupPath);
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    fs.writeFileSync(config.backupPath, JSON.stringify(backup, null, 2));

    log(`✅ Backup created: ${config.backupPath}`, config);
    log(`   Users: ${users.length}`, config);
    log(`   Roles: ${roles.length}`, config);
    log(`   Permissions: ${permissions.length}`, config);
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

/**
 * Step 2: Create permissions if they don't exist
 */
async function createPermissions(config: MigrationConfig): Promise<void> {
  log('\n📝 Creating permissions...', config);

  // Collect all unique permissions from role mappings
  const allPermissions = new Set<string>();
  for (const mapping of DEFAULT_ROLE_MAPPINGS) {
    for (const perm of mapping.permissions) {
      allPermissions.add(perm);
    }
  }

  let created = 0;
  let existing = 0;

  for (const permName of allPermissions) {
    const [resource, action] = permName.split(':');

    const existingPerm = await prisma.permission.findUnique({
      where: { name: permName },
    });

    if (existingPerm) {
      existing++;
      if (config.verbose) {
        log(`   ⏭️  Permission already exists: ${permName}`, config);
      }
      continue;
    }

    if (!config.dryRun) {
      await prisma.permission.create({
        data: {
          name: permName,
          resource,
          action,
          description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`,
        },
      });
    }

    created++;
    log(`   ✅ Created permission: ${permName}`, config);
  }

  log(`\n   Total: ${created} created, ${existing} existing`, config);
}

/**
 * Step 3: Map existing roles to permissions
 */
async function mapRolesToPermissions(
  config: MigrationConfig
): Promise<void> {
  log('\n🔗 Mapping roles to permissions...', config);

  for (const mapping of DEFAULT_ROLE_MAPPINGS) {
    // Find or create role
    let role = await prisma.userRole.findUnique({
      where: { name: mapping.roleName },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      if (!config.dryRun) {
        role = await prisma.userRole.create({
          data: {
            name: mapping.roleName,
            description: `${mapping.roleName} role`,
            isSystemRole: mapping.isSystemRole,
          },
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        });
      }
      log(`   ✅ Created role: ${mapping.roleName}`, config);
    } else {
      log(`   ⏭️  Role exists: ${mapping.roleName}`, config);

      // Update isSystemRole flag if needed
      if (role.isSystemRole !== mapping.isSystemRole && !config.dryRun) {
        await prisma.userRole.update({
          where: { id: role.id },
          data: { isSystemRole: mapping.isSystemRole },
        });
        log(`      Updated isSystemRole flag`, config);
      }
    }

    if (!role) continue;

    // Get existing permissions for this role
    const existingPermissions = new Set(
      role.rolePermissions.map((rp) => rp.permission.name)
    );

    // Assign permissions
    let assigned = 0;
    for (const permName of mapping.permissions) {
      if (existingPermissions.has(permName)) {
        if (config.verbose) {
          log(`      ⏭️  Permission already assigned: ${permName}`, config);
        }
        continue;
      }

      const permission = await prisma.permission.findUnique({
        where: { name: permName },
      });

      if (!permission) {
        log(`      ⚠️  Permission not found: ${permName}`, config);
        continue;
      }

      if (!config.dryRun) {
        await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }

      assigned++;
      log(`      ✅ Assigned permission: ${permName}`, config);
    }

    if (assigned > 0) {
      log(`      Total assigned: ${assigned}`, config);
    }
  }
}

/**
 * Step 4: Verify all users have valid role assignments
 */
async function verifyUserRoles(config: MigrationConfig): Promise<void> {
  log('\n🔍 Verifying user role assignments...', config);

  const users = await prisma.user.findMany({
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  let valid = 0;
  let invalid = 0;
  let fixed = 0;

  for (const user of users) {
    if (!user.role) {
      invalid++;
      log(`   ⚠️  User ${user.email} has no role assigned`, config);

      // Assign default User role
      const defaultRole = await prisma.userRole.findUnique({
        where: { name: 'User' },
      });

      if (defaultRole && !config.dryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: defaultRole.id },
        });
        fixed++;
        log(`      ✅ Assigned default User role`, config);
      }
    } else {
      valid++;
      if (config.verbose) {
        const permCount = user.role.rolePermissions.length;
        log(
          `   ✅ User ${user.email}: ${user.role.name} (${permCount} permissions)`,
          config
        );
      }
    }
  }

  log(`\n   Total: ${valid} valid, ${invalid} invalid, ${fixed} fixed`, config);
}

/**
 * Step 5: Validate migration
 */
async function validateMigration(config: MigrationConfig): Promise<boolean> {
  log('\n✅ Validating migration...', config);

  let isValid = true;

  // Check all roles have permissions
  const roles = await prisma.userRole.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      users: true,
    },
  });

  for (const role of roles) {
    if (role.rolePermissions.length === 0) {
      log(`   ⚠️  Role "${role.name}" has no permissions`, config);
      isValid = false;
    } else {
      log(
        `   ✅ Role "${role.name}": ${role.rolePermissions.length} permissions, ${role.users.length} users`,
        config
      );
    }
  }

  // Check all users have roles
  const allUsers = await prisma.user.findMany({
    include: { role: true },
  });
  const usersWithoutRoles = allUsers.filter((u) => !u.role).length;

  if (usersWithoutRoles > 0) {
    log(`   ⚠️  ${usersWithoutRoles} users without roles`, config);
    isValid = false;
  } else {
    log(`   ✅ All users have role assignments`, config);
  }

  return isValid;
}

/**
 * Generate rollback instructions
 */
function generateRollbackInstructions(config: MigrationConfig): void {
  console.log('\n' + '='.repeat(60));
  console.log('📋 ROLLBACK INSTRUCTIONS');
  console.log('='.repeat(60));
  console.log('\nIf you need to rollback this migration:\n');
  console.log('1. Restore from backup:');
  console.log(`   - Backup file: ${config.backupPath}`);
  console.log('   - Use your database restore tools\n');
  console.log('2. Or manually revert:');
  console.log('   - Delete role_permissions entries');
  console.log('   - Delete permissions entries');
  console.log('   - Restore original role assignments\n');
  console.log('3. Run Prisma migrations:');
  console.log('   cd backend');
  console.log('   npm run prisma:migrate\n');
  console.log('='.repeat(60) + '\n');
}

/**
 * Main migration function
 */
async function migrate(config: MigrationConfig): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 PERMISSION SYSTEM MIGRATION');
  console.log('='.repeat(60));
  console.log(`\nMode: ${config.dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`Backup: ${config.backupPath}\n`);

  if (config.dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made\n');
  } else {
    console.log('⚠️  LIVE MODE - Database will be modified\n');
    const confirmed = await askYesNo('Continue with migration?');
    if (!confirmed) {
      console.log('\n❌ Migration cancelled\n');
      return;
    }
  }

  try {
    // Step 1: Backup
    await createBackup(config);

    // Step 2: Create permissions
    await createPermissions(config);

    // Step 3: Map roles to permissions
    await mapRolesToPermissions(config);

    // Step 4: Verify user roles
    await verifyUserRoles(config);

    // Step 5: Validate
    const isValid = await validateMigration(config);

    console.log('\n' + '='.repeat(60));
    if (isValid) {
      console.log('✅ MIGRATION COMPLETED SUCCESSFULLY');
    } else {
      console.log('⚠️  MIGRATION COMPLETED WITH WARNINGS');
      console.log('   Please review the warnings above');
    }
    console.log('='.repeat(60) + '\n');

    if (!config.dryRun) {
      generateRollbackInstructions(config);
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.log('\n💡 Your database has not been modified (backup available)');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * CLI Entry Point
 */
async function main() {
  const args = process.argv.slice(2);

  const config: MigrationConfig = {
    backupPath: path.join(
      process.cwd(),
      'backend/prisma/backups',
      `migration-backup-${Date.now()}.json`
    ),
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('--verbose') || args.includes('-v'),
  };

  // Check if custom backup path provided
  const backupIndex = args.indexOf('--backup');
  if (backupIndex !== -1 && args[backupIndex + 1]) {
    config.backupPath = args[backupIndex + 1];
  }

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Permission System Migration Script

Usage:
  npm run migrate:permissions [options]
  ts-node backend/src/scripts/migrate-to-permissions.ts [options]

Options:
  --dry-run           Run without making changes (preview mode)
  --verbose, -v       Show detailed output
  --backup <path>     Custom backup file path
  --help, -h          Show this help message

Examples:
  npm run migrate:permissions --dry-run
  npm run migrate:permissions --verbose
  npm run migrate:permissions --backup ./my-backup.json
    `);
    return;
  }

  await migrate(config);
}

// Run if executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { migrate, DEFAULT_ROLE_MAPPINGS };
export type { MigrationConfig, RoleMapping };
