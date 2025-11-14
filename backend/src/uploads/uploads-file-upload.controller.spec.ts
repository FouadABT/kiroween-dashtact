import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadFileDto } from './dto/upload-file.dto';
import { UploadResponseDto } from './dto/upload-response.dto';

describe('UploadsController - File Upload', () => {
  let controller: UploadsController;
  let service: UploadsService;

  const mockUploadService = {
    uploadFile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadsController],
      providers: [
        {
          provide: UploadsService,
          useValue: mockUploadService,
        },
      ],
    }).compile();

    controller = module.get<UploadsController>(UploadsController);
    service = module.get<UploadsService>(UploadsService);

    jest.clearAllMocks();
  });

  describe('uploadFile', () => {
    const mockFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test-image.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 1024 * 1024,
      buffer: Buffer.from('fake-image-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    };

    const mockResponse: UploadResponseDto = {
      filename: 'abc123.jpg',
      originalName: 'test-image.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 1024,
      url: '/uploads/images/abc123.jpg',
      uploadedAt: new Date(),
    };

    it('should upload a file successfully', async () => {
      const dto: UploadFileDto = {
        type: 'image',
        description: 'Test upload',
      };

      mockUploadService.uploadFile.mockResolvedValue(mockResponse);

      const result = await controller.uploadFile(mockFile, dto);

      expect(result).toEqual(mockResponse);
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, dto);
      expect(service.uploadFile).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException when no file is provided', async () => {
      const dto: UploadFileDto = {
        type: 'image',
      };

      await expect(controller.uploadFile(undefined as any, dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.uploadFile(undefined as any, dto)).rejects.toThrow(
        'No file provided'
      );
      expect(service.uploadFile).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when file is null', async () => {
      const dto: UploadFileDto = {
        type: 'image',
      };

      await expect(controller.uploadFile(null as any, dto)).rejects.toThrow(
        BadRequestException
      );
      expect(service.uploadFile).not.toHaveBeenCalled();
    });

    it('should handle image uploads', async () => {
      const dto: UploadFileDto = {
        type: 'image',
      };

      mockUploadService.uploadFile.mockResolvedValue(mockResponse);

      const result = await controller.uploadFile(mockFile, dto);

      expect(result).toBeDefined();
      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, dto);
    });

    it('should handle document uploads', async () => {
      const documentFile: Express.Multer.File = {
        ...mockFile,
        originalname: 'test-document.pdf',
        mimetype: 'application/pdf',
      };

      const documentResponse: UploadResponseDto = {
        ...mockResponse,
        filename: 'xyz789.pdf',
        originalName: 'test-document.pdf',
        mimetype: 'application/pdf',
        url: '/uploads/documents/xyz789.pdf',
      };

      const dto: UploadFileDto = {
        type: 'document',
      };

      mockUploadService.uploadFile.mockResolvedValue(documentResponse);

      const result = await controller.uploadFile(documentFile, dto);

      expect(result).toEqual(documentResponse);
      expect(service.uploadFile).toHaveBeenCalledWith(documentFile, dto);
    });

    it('should pass description to service', async () => {
      const dto: UploadFileDto = {
        type: 'image',
        description: 'User profile picture',
      };

      mockUploadService.uploadFile.mockResolvedValue(mockResponse);

      await controller.uploadFile(mockFile, dto);

      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, dto);
      expect(service.uploadFile).toHaveBeenCalledWith(
        mockFile,
        expect.objectContaining({ description: 'User profile picture' })
      );
    });

    it('should handle service errors', async () => {
      const dto: UploadFileDto = {
        type: 'image',
      };

      const error = new BadRequestException('File size exceeds maximum');
      mockUploadService.uploadFile.mockRejectedValue(error);

      await expect(controller.uploadFile(mockFile, dto)).rejects.toThrow(
        BadRequestException
      );
      await expect(controller.uploadFile(mockFile, dto)).rejects.toThrow(
        'File size exceeds maximum'
      );
    });

    it('should validate DTO type field', async () => {
      const invalidDto = {
        type: 'invalid-type', // Not 'image' or 'document'
      } as any;

      mockUploadService.uploadFile.mockResolvedValue(mockResponse);

      // Note: In real scenario, class-validator would catch this before reaching controller
      // This test verifies the controller passes DTO to service
      await controller.uploadFile(mockFile, invalidDto);

      expect(service.uploadFile).toHaveBeenCalledWith(mockFile, invalidDto);
    });

    it('should return response with all required fields', async () => {
      const dto: UploadFileDto = {
        type: 'image',
      };

      mockUploadService.uploadFile.mockResolvedValue(mockResponse);

      const result = await controller.uploadFile(mockFile, dto);

      expect(result).toHaveProperty('filename');
      expect(result).toHaveProperty('originalName');
      expect(result).toHaveProperty('mimetype');
      expect(result).toHaveProperty('size');
      expect(result).toHaveProperty('url');
      expect(result).toHaveProperty('uploadedAt');
    });
  });
});
