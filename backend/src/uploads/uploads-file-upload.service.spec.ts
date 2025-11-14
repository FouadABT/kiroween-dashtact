import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

describe('UploadsService - File Upload', () => {
  let service: UploadsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadsService],
    }).compile();

    service = module.get<UploadsService>(UploadsService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockImageFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
      buffer: Buffer.from('fake-image-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const mockDocumentFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-document.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size: 2 * 1024 * 1024, // 2MB
      buffer: Buffer.from('fake-pdf-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    it('should upload an image file successfully', async () => {
      const dto: UploadFileDto = {
        type: 'image',
        description: 'Test image upload',
      };

      const result = await service.uploadFile(mockImageFile, dto);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('test-image.jpg');
      expect(result.mimetype).toBe('image/jpeg');
      expect(result.size).toBe(1024 * 1024);
      expect(result.filename).toMatch(/^[a-f0-9-]+\.jpg$/);
      expect(result.url).toContain('/uploads/images/');
      expect(result.uploadedAt).toBeInstanceOf(Date);
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads/images'),
        { recursive: true }
      );
      expect(fs.writeFile).toHaveBeenCalled();
    });

    it('should upload a document file successfully', async () => {
      const dto: UploadFileDto = {
        type: 'document',
      };

      const result = await service.uploadFile(mockDocumentFile, dto);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('test-document.pdf');
      expect(result.mimetype).toBe('application/pdf');
      expect(result.size).toBe(2 * 1024 * 1024);
      expect(result.filename).toMatch(/^[a-f0-9-]+\.pdf$/);
      expect(result.url).toContain('/uploads/documents/');
      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads/documents'),
        { recursive: true }
      );
    });

    it('should reject file exceeding size limit for images', async () => {
      const largeImageFile: Express.Multer.File = {
        ...mockImageFile,
        size: 6 * 1024 * 1024, // 6MB (exceeds 5MB limit)
      };

      const dto: UploadFileDto = {
        type: 'image',
      };

      await expect(service.uploadFile(largeImageFile, dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.uploadFile(largeImageFile, dto)).rejects.toThrow(
        'File size exceeds maximum of 5MB'
      );
    });

    it('should reject file exceeding size limit for documents', async () => {
      const largeDocumentFile: Express.Multer.File = {
        ...mockDocumentFile,
        size: 11 * 1024 * 1024, // 11MB (exceeds 10MB limit)
      };

      const dto: UploadFileDto = {
        type: 'document',
      };

      await expect(service.uploadFile(largeDocumentFile, dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.uploadFile(largeDocumentFile, dto)).rejects.toThrow(
        'File size exceeds maximum of 10MB'
      );
    });

    it('should reject invalid MIME type for images', async () => {
      const invalidImageFile: Express.Multer.File = {
        ...mockImageFile,
        mimetype: 'application/pdf',
      };

      const dto: UploadFileDto = {
        type: 'image',
      };

      await expect(service.uploadFile(invalidImageFile, dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.uploadFile(invalidImageFile, dto)).rejects.toThrow(
        /File type .* is not allowed/
      );
    });

    it('should reject invalid MIME type for documents', async () => {
      const invalidDocumentFile: Express.Multer.File = {
        ...mockDocumentFile,
        mimetype: 'image/jpeg',
      };

      const dto: UploadFileDto = {
        type: 'document',
      };

      await expect(service.uploadFile(invalidDocumentFile, dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.uploadFile(invalidDocumentFile, dto)).rejects.toThrow(
        /File type .* is not allowed/
      );
    });

    it('should accept all allowed image MIME types', async () => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

      for (const mimetype of allowedTypes) {
        const file: Express.Multer.File = {
          ...mockImageFile,
          mimetype,
          originalname: `test.${mimetype.split('/')[1]}`,
        };

        const dto: UploadFileDto = { type: 'image' };
        const result = await service.uploadFile(file, dto);

        expect(result).toBeDefined();
        expect(result.mimetype).toBe(mimetype);
      }
    });

    it('should accept all allowed document MIME types', async () => {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];

      for (const mimetype of allowedTypes) {
        const file: Express.Multer.File = {
          ...mockDocumentFile,
          mimetype,
          originalname: 'test.doc',
        };

        const dto: UploadFileDto = { type: 'document' };
        const result = await service.uploadFile(file, dto);

        expect(result).toBeDefined();
        expect(result.mimetype).toBe(mimetype);
      }
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const dto: UploadFileDto = { type: 'image' };
      const filenames = new Set<string>();

      for (let i = 0; i < 10; i++) {
        const result = await service.uploadFile(mockImageFile, dto);
        filenames.add(result.filename);
      }

      expect(filenames.size).toBe(10); // All filenames should be unique
    });

    it('should preserve file extension in generated filename', async () => {
      const files = [
        { ...mockImageFile, originalname: 'test.jpg' },
        { ...mockImageFile, originalname: 'test.png', mimetype: 'image/png' },
        { ...mockImageFile, originalname: 'test.gif', mimetype: 'image/gif' },
      ];

      for (const file of files) {
        const dto: UploadFileDto = { type: 'image' };
        const result = await service.uploadFile(file, dto);
        const ext = file.originalname.split('.').pop();

        expect(result.filename).toMatch(new RegExp(`\\.${ext}$`));
      }
    });

    it('should create upload directory if it does not exist', async () => {
      const dto: UploadFileDto = { type: 'image' };

      await service.uploadFile(mockImageFile, dto);

      expect(fs.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('uploads/images'),
        { recursive: true }
      );
    });

    it('should handle files without description', async () => {
      const dto: UploadFileDto = {
        type: 'image',
        // description is optional
      };

      const result = await service.uploadFile(mockImageFile, dto);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('test-image.jpg');
    });

    it('should handle files with description', async () => {
      const dto: UploadFileDto = {
        type: 'image',
        description: 'Profile picture for user',
      };

      const result = await service.uploadFile(mockImageFile, dto);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('test-image.jpg');
      // Note: Description is not stored in response, but validated in DTO
    });
  });
});
