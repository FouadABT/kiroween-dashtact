import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const mkdir = promisify(fs.mkdir);
const unlink = promisify(fs.unlink);
const access = promisify(fs.access);

export interface FileValidationOptions {
  allowedTypes: string[];
  maxSize: number;
}

export class FileUploadUtil {
  private static readonly UPLOAD_DIR = 'public/uploads/branding';
  private static readonly LOGOS_DIR = path.join(
    FileUploadUtil.UPLOAD_DIR,
    'logos',
  );
  private static readonly FAVICONS_DIR = path.join(
    FileUploadUtil.UPLOAD_DIR,
    'favicons',
  );

  // Allowed file types
  static readonly LOGO_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
  ];
  static readonly FAVICON_TYPES = [
    'image/x-icon',
    'image/vnd.microsoft.icon',
    'image/png',
    'image/svg+xml',
  ];

  // Size limits
  static readonly MAX_LOGO_SIZE = 5 * 1024 * 1024; // 5MB
  static readonly MAX_FAVICON_SIZE = 1 * 1024 * 1024; // 1MB

  /**
   * Ensure upload directories exist
   */
  static async ensureDirectories(): Promise<void> {
    const dirs = [
      FileUploadUtil.UPLOAD_DIR,
      FileUploadUtil.LOGOS_DIR,
      FileUploadUtil.FAVICONS_DIR,
    ];

    for (const dir of dirs) {
      try {
        await access(dir);
      } catch {
        await mkdir(dir, { recursive: true });
      }
    }
  }

  /**
   * Validate file type and size
   */
  static validateFile(
    file: Express.Multer.File,
    options: FileValidationOptions,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Validate file type
    if (!options.allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${options.allowedTypes.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > options.maxSize) {
      const maxSizeMB = (options.maxSize / (1024 * 1024)).toFixed(2);
      throw new BadRequestException(
        `File size exceeds ${maxSizeMB}MB limit`,
      );
    }
  }

  /**
   * Generate unique filename with timestamp
   */
  static generateFilename(originalName: string, prefix: string): string {
    const timestamp = Date.now();
    const ext = path.extname(originalName);
    const sanitized = originalName
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .toLowerCase();
    return `${prefix}-${sanitized}-${timestamp}${ext}`;
  }

  /**
   * Save file to disk
   */
  static async saveFile(
    file: Express.Multer.File,
    directory: string,
    filename: string,
  ): Promise<string> {
    await FileUploadUtil.ensureDirectories();

    const filePath = path.join(directory, filename);
    await fs.promises.writeFile(filePath, file.buffer);

    // Return public URL path
    return `/${filePath.replace(/\\/g, '/')}`;
  }

  /**
   * Delete file from disk
   */
  static async deleteFile(url: string): Promise<void> {
    if (!url) return;

    try {
      // Convert URL to file path
      const filePath = url.startsWith('/') ? url.substring(1) : url;
      await unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      console.warn(`Failed to delete file: ${url}`, error);
    }
  }

  /**
   * Upload logo file
   */
  static async uploadLogo(
    file: Express.Multer.File,
    isDark = false,
  ): Promise<string> {
    FileUploadUtil.validateFile(file, {
      allowedTypes: FileUploadUtil.LOGO_TYPES,
      maxSize: FileUploadUtil.MAX_LOGO_SIZE,
    });

    const prefix = isDark ? 'logo-dark' : 'logo-light';
    const filename = FileUploadUtil.generateFilename(file.originalname, prefix);

    return FileUploadUtil.saveFile(
      file,
      FileUploadUtil.LOGOS_DIR,
      filename,
    );
  }

  /**
   * Upload favicon file
   */
  static async uploadFavicon(file: Express.Multer.File): Promise<string> {
    FileUploadUtil.validateFile(file, {
      allowedTypes: FileUploadUtil.FAVICON_TYPES,
      maxSize: FileUploadUtil.MAX_FAVICON_SIZE,
    });

    const filename = FileUploadUtil.generateFilename(
      file.originalname,
      'favicon',
    );

    return FileUploadUtil.saveFile(
      file,
      FileUploadUtil.FAVICONS_DIR,
      filename,
    );
  }
}
