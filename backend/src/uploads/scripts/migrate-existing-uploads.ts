import { PrismaClient, Visibility, UploadType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as mime from 'mime-types';

const prisma = new PrismaClient();

interface MigrationStats {
  scanned: number;
  created: number;
  skipped: number;
  errors: number;
}

/**
 * Migrate existing files from filesystem to database
 * Creates database records for files that don't have them
 */
export async function migrateExistingUploads(
  uploadsDir: string = './uploads',
  systemUserId?: string,
): Promise<MigrationStats> {
  console.log('🔄 Migrating existing uploads to database...');

  const stats: MigrationStats = {
    scanned: 0,
    created: 0,
    skipped: 0,
    errors: 0,
  };

  try {
    // Get system user or first admin user
    let uploaderId = systemUserId;
    if (!uploaderId) {
      const adminRole = await prisma.userRole.findFirst({
        where: { name: 'Admin' },
      });

      if (adminRole) {
        const adminUser = await prisma.user.findFirst({
          where: { roleId: adminRole.id },
        });
        uploaderId = adminUser?.id;
      }

      if (!uploaderId) {
        // Fallback to any user
        const anyUser = await prisma.user.findFirst();
        uploaderId = anyUser?.id;
      }

      if (!uploaderId) {
        throw new Error(
          'No users found in database. Please create a user first.',
        );
      }
    }

    console.log(`📁 Scanning directory: ${uploadsDir}`);
    console.log(`👤 Using uploader ID: ${uploaderId}`);

    // Check if directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.log('⚠️  Uploads directory does not exist');
      return stats;
    }

    // Get all files from filesystem
    const files = fs.readdirSync(uploadsDir);
    stats.scanned = files.length;
    console.log(`📊 Found ${files.length} files to process`);

    // Get existing database records
    const existingUploads = await prisma.upload.findMany({
      select: { filename: true },
    });
    const existingFilenames = new Set(
      existingUploads.map((u) => u.filename),
    );

    // Process each file
    for (const filename of files) {
      const filePath = path.join(uploadsDir, filename);

      try {
        // Skip if not a file
        const fileStats = fs.statSync(filePath);
        if (!fileStats.isFile()) {
          stats.skipped++;
          continue;
        }

        // Skip if already in database
        if (existingFilenames.has(filename)) {
          console.log(`⏭️  Skipping ${filename} (already in database)`);
          stats.skipped++;
          continue;
        }

        // Determine file type
        const mimeType = mime.lookup(filename) || 'application/octet-stream';
        const uploadType = determineUploadType(mimeType, filename);

        // Get image dimensions if it's an image
        let width: number | undefined;
        let height: number | undefined;
        if (uploadType === UploadType.IMAGE || uploadType === UploadType.EDITOR_IMAGE) {
          try {
            const sharp = require('sharp');
            const metadata = await sharp(filePath).metadata();
            width = metadata.width;
            height = metadata.height;
          } catch (err) {
            // Sharp not available or image processing failed
            console.log(`   ⚠️  Could not get dimensions for ${filename}`);
          }
        }

        // Create database record
        await prisma.upload.create({
          data: {
            filename,
            originalName: filename,
            mimeType,
            size: fileStats.size,
            url: `/uploads/${filename}`,
            path: filePath,
            type: uploadType,
            uploadedById: uploaderId,
            visibility: Visibility.PRIVATE,
            width,
            height,
          },
        });

        console.log(`✅ Migrated: ${filename}`);
        stats.created++;
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error);
        stats.errors++;
      }
    }

    // Print summary
    console.log('\n📊 Migration Summary:');
    console.log('─'.repeat(50));
    console.log(`📁 Files scanned: ${stats.scanned}`);
    console.log(`✅ Records created: ${stats.created}`);
    console.log(`⏭️  Files skipped: ${stats.skipped}`);
    console.log(`❌ Errors: ${stats.errors}`);
    console.log('─'.repeat(50));

    return stats;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Determine upload type based on MIME type and filename
 */
function determineUploadType(mimeType: string, filename: string): UploadType {
  // Check if it's an avatar
  if (filename.includes('avatar') || filename.includes('profile')) {
    return UploadType.AVATAR;
  }

  // Check if it's an editor image
  if (filename.includes('editor') || filename.includes('content')) {
    return UploadType.EDITOR_IMAGE;
  }

  // Check MIME type
  if (mimeType.startsWith('image/')) {
    return UploadType.IMAGE;
  }

  return UploadType.DOCUMENT;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const uploadsDir = args[0] || './uploads';
  const systemUserId = args[1];

  (async () => {
    try {
      await migrateExistingUploads(uploadsDir, systemUserId);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  })();
}
