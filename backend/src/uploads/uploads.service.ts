import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadResponseDto } from './dto/upload-response.dto';
import { UPLOAD_CONFIGS } from './interfaces/upload-config.interface';

@Injectable()
export class UploadsService {
  async uploadFile(
    file: Express.Multer.File,
    dto: UploadFileDto,
  ): Promise<UploadResponseDto> {
    // Validate file
    this.validateFile(file, dto.type);

    // Generate unique filename
    const ext = file.originalname.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;

    // Get upload directory
    const config = UPLOAD_CONFIGS[dto.type];
    const uploadDir = join(process.cwd(), config.uploadDir);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = join(uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);

    // Return response
    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url: `/${config.uploadDir}/${filename}`,
      uploadedAt: new Date(),
    };
  }

  async deleteFile(
    type: 'image' | 'document',
    filename: string,
  ): Promise<void> {
    // Validate filename (prevent directory traversal)
    if (
      filename.includes('..') ||
      filename.includes('/') ||
      filename.includes('\\')
    ) {
      throw new BadRequestException('Invalid filename');
    }

    // Get upload directory
    const config = UPLOAD_CONFIGS[type];
    const uploadDir = join(process.cwd(), config.uploadDir);
    const filepath = join(uploadDir, filename);

    try {
      // Check if file exists
      await fs.access(filepath);

      // Delete file
      await fs.unlink(filepath);
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'ENOENT'
      ) {
        throw new NotFoundException('File not found');
      }
      throw error;
    }
  }

  async uploadEditorImage(
    file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    // Generate unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const ext = file.originalname.split('.').pop();
    const filename = `${timestamp}-${randomString}.${ext}`;

    // Get upload directory for editor images
    const uploadDir = join(process.cwd(), 'uploads/editor-images');

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    const filepath = join(uploadDir, filename);
    await fs.writeFile(filepath, file.buffer);

    // Generate full URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/uploads/editor-images/${filename}`;

    // Return response
    return {
      filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      url,
      uploadedAt: new Date(),
    };
  }

  async uploadAvatar(
    file: Express.Multer.File,
    userId: string,
  ): Promise<UploadResponseDto> {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed',
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Generate unique filename
    const filename = `${userId}-${uuidv4()}.webp`;

    // Get upload directory for avatars
    const uploadDir = join(process.cwd(), 'uploads/avatars');

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Optimize image with Sharp
    // - Resize to 400x400
    // - Convert to WebP format
    // - Quality 85%
    // - Strip EXIF metadata
    const optimizedBuffer = await sharp(file.buffer)
      .rotate() // Auto-rotate based on EXIF (before stripping)
      .resize(400, 400, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 85 })
      .toBuffer();

    // Save optimized file
    const filepath = join(uploadDir, filename);
    await fs.writeFile(filepath, optimizedBuffer);

    // Generate full URL
    const baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
    const url = `${baseUrl}/uploads/avatars/${filename}`;

    // Return response
    return {
      filename,
      originalName: file.originalname,
      mimetype: 'image/webp',
      size: optimizedBuffer.length,
      url,
      uploadedAt: new Date(),
    };
  }

  private validateFile(
    file: Express.Multer.File,
    type: 'image' | 'document',
  ): void {
    const config = UPLOAD_CONFIGS[type];

    // Check file size
    if (file.size > config.maxFileSize) {
      throw new BadRequestException(
        `File size exceeds maximum of ${config.maxFileSize / 1024 / 1024}MB`,
      );
    }

    // Check mime type
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${config.allowedMimeTypes.join(', ')}`,
      );
    }
  }
}
