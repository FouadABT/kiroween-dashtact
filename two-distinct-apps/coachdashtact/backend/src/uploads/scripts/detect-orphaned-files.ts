import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface OrphanedFilesReport {
  filesystemOrphans: string[]; // Files in filesystem but not in database
  databaseOrphans: string[]; // Files in database but not in filesystem
  softDeletedFiles: string[]; // Files marked as deleted but still in filesystem
  totalFilesystemFiles: number;
  totalDatabaseRecords: number;
}

/**
 * Detect orphaned files by comparing filesystem with database records
 */
export async function detectOrphanedFiles(
  uploadsDir: string = './uploads',
): Promise<OrphanedFilesReport> {
  console.log('🔍 Scanning for orphaned files...');

  const report: OrphanedFilesReport = {
    filesystemOrphans: [],
    databaseOrphans: [],
    softDeletedFiles: [],
    totalFilesystemFiles: 0,
    totalDatabaseRecords: 0,
  };

  try {
    // Get all files from filesystem
    const filesystemFiles = new Set<string>();
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      files.forEach((file) => {
        const filePath = path.join(uploadsDir, file);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          filesystemFiles.add(file);
        }
      });
    }
    report.totalFilesystemFiles = filesystemFiles.size;
    console.log(`📁 Found ${filesystemFiles.size} files in filesystem`);

    // Get all upload records from database
    const uploads = await prisma.upload.findMany({
      select: {
        filename: true,
        deletedAt: true,
      },
    });
    report.totalDatabaseRecords = uploads.length;
    console.log(`💾 Found ${uploads.length} records in database`);

    const databaseFiles = new Set<string>();
    const softDeletedFilenames = new Set<string>();

    uploads.forEach((upload) => {
      databaseFiles.add(upload.filename);
      if (upload.deletedAt) {
        softDeletedFilenames.add(upload.filename);
      }
    });

    // Find files in filesystem but not in database
    filesystemFiles.forEach((file) => {
      if (!databaseFiles.has(file)) {
        report.filesystemOrphans.push(file);
      }
    });

    // Find files in database but not in filesystem
    databaseFiles.forEach((file) => {
      if (!filesystemFiles.has(file)) {
        report.databaseOrphans.push(file);
      }
    });

    // Find soft-deleted files still in filesystem
    softDeletedFilenames.forEach((file) => {
      if (filesystemFiles.has(file)) {
        report.softDeletedFiles.push(file);
      }
    });

    // Print report
    console.log('\n📊 Orphaned Files Report:');
    console.log('─'.repeat(50));
    console.log(
      `🗂️  Files in filesystem but not in database: ${report.filesystemOrphans.length}`,
    );
    console.log(
      `💾 Files in database but not in filesystem: ${report.databaseOrphans.length}`,
    );
    console.log(
      `🗑️  Soft-deleted files still in filesystem: ${report.softDeletedFiles.length}`,
    );
    console.log('─'.repeat(50));

    if (report.filesystemOrphans.length > 0) {
      console.log('\n🗂️  Filesystem Orphans (first 10):');
      report.filesystemOrphans.slice(0, 10).forEach((file) => {
        console.log(`   - ${file}`);
      });
      if (report.filesystemOrphans.length > 10) {
        console.log(
          `   ... and ${report.filesystemOrphans.length - 10} more`,
        );
      }
    }

    if (report.databaseOrphans.length > 0) {
      console.log('\n💾 Database Orphans (first 10):');
      report.databaseOrphans.slice(0, 10).forEach((file) => {
        console.log(`   - ${file}`);
      });
      if (report.databaseOrphans.length > 10) {
        console.log(`   ... and ${report.databaseOrphans.length - 10} more`);
      }
    }

    if (report.softDeletedFiles.length > 0) {
      console.log('\n🗑️  Soft-Deleted Files (first 10):');
      report.softDeletedFiles.slice(0, 10).forEach((file) => {
        console.log(`   - ${file}`);
      });
      if (report.softDeletedFiles.length > 10) {
        console.log(`   ... and ${report.softDeletedFiles.length - 10} more`);
      }
    }

    return report;
  } catch (error) {
    console.error('❌ Error detecting orphaned files:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up orphaned files from filesystem
 */
export async function cleanupFilesystemOrphans(
  uploadsDir: string = './uploads',
  dryRun: boolean = true,
): Promise<number> {
  console.log(
    `🧹 Cleaning up filesystem orphans (${dryRun ? 'DRY RUN' : 'LIVE'})...`,
  );

  const report = await detectOrphanedFiles(uploadsDir);
  let deletedCount = 0;

  for (const file of report.filesystemOrphans) {
    const filePath = path.join(uploadsDir, file);
    try {
      if (dryRun) {
        console.log(`   Would delete: ${file}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Deleted: ${file}`);
      }
      deletedCount++;
    } catch (error) {
      console.error(`   ❌ Failed to delete ${file}:`, error);
    }
  }

  console.log(
    `\n${dryRun ? 'Would delete' : 'Deleted'} ${deletedCount} orphaned files`,
  );
  return deletedCount;
}

/**
 * Clean up soft-deleted files from filesystem
 */
export async function cleanupSoftDeletedFiles(
  uploadsDir: string = './uploads',
  dryRun: boolean = true,
): Promise<number> {
  console.log(
    `🧹 Cleaning up soft-deleted files (${dryRun ? 'DRY RUN' : 'LIVE'})...`,
  );

  const report = await detectOrphanedFiles(uploadsDir);
  let deletedCount = 0;

  for (const file of report.softDeletedFiles) {
    const filePath = path.join(uploadsDir, file);
    try {
      if (dryRun) {
        console.log(`   Would delete: ${file}`);
      } else {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Deleted: ${file}`);
      }
      deletedCount++;
    } catch (error) {
      console.error(`   ❌ Failed to delete ${file}:`, error);
    }
  }

  console.log(
    `\n${dryRun ? 'Would delete' : 'Deleted'} ${deletedCount} soft-deleted files`,
  );
  return deletedCount;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0] || 'detect';
  const dryRun = !args.includes('--live');

  (async () => {
    try {
      switch (command) {
        case 'detect':
          await detectOrphanedFiles();
          break;
        case 'cleanup-filesystem':
          await cleanupFilesystemOrphans('./uploads', dryRun);
          break;
        case 'cleanup-soft-deleted':
          await cleanupSoftDeletedFiles('./uploads', dryRun);
          break;
        default:
          console.log('Usage:');
          console.log('  npm run detect-orphaned-files detect');
          console.log(
            '  npm run detect-orphaned-files cleanup-filesystem [--live]',
          );
          console.log(
            '  npm run detect-orphaned-files cleanup-soft-deleted [--live]',
          );
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
