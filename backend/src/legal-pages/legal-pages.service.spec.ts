import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { LegalPagesService } from './legal-pages.service';
import { PrismaService } from '../prisma/prisma.service';
import { LegalPageType } from '@prisma/client';

describe('LegalPagesService', () => {
  let service: LegalPagesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    legalPage: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalPagesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LegalPagesService>(LegalPagesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new legal page', async () => {
      const createDto = {
        pageType: LegalPageType.TERMS,
        content: 'Terms of Service content',
      };

      const expectedResult = {
        id: 'test-id',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue(null);
      mockPrismaService.legalPage.create.mockResolvedValue(expectedResult);

      const result = await service.create(createDto);

      expect(mockPrismaService.legalPage.findUnique).toHaveBeenCalledWith({
        where: { pageType: createDto.pageType },
      });
      expect(mockPrismaService.legalPage.create).toHaveBeenCalledWith({
        data: createDto,
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw ConflictException if page type already exists', async () => {
      const createDto = {
        pageType: LegalPageType.TERMS,
        content: 'Terms of Service content',
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue({
        id: 'existing-id',
        ...createDto,
      });

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.legalPage.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all legal pages', async () => {
      const expectedResult = [
        {
          id: 'id-1',
          pageType: LegalPageType.TERMS,
          content: 'Terms content',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'id-2',
          pageType: LegalPageType.PRIVACY,
          content: 'Privacy content',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.legalPage.findMany.mockResolvedValue(expectedResult);

      const result = await service.findAll();

      expect(mockPrismaService.legalPage.findMany).toHaveBeenCalledWith({
        orderBy: { pageType: 'asc' },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a legal page by ID', async () => {
      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.TERMS,
        content: 'Terms content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findOne('test-id');

      expect(mockPrismaService.legalPage.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if page not found', async () => {
      mockPrismaService.legalPage.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByType', () => {
    it('should return a legal page by type', async () => {
      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.PRIVACY,
        content: 'Privacy content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue(expectedResult);

      const result = await service.findByType(LegalPageType.PRIVACY);

      expect(mockPrismaService.legalPage.findUnique).toHaveBeenCalledWith({
        where: { pageType: LegalPageType.PRIVACY },
      });
      expect(result).toEqual(expectedResult);
    });

    it('should throw NotFoundException if page type not found', async () => {
      mockPrismaService.legalPage.findUnique.mockResolvedValue(null);

      await expect(service.findByType(LegalPageType.TERMS)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a legal page by ID', async () => {
      const updateDto = {
        content: 'Updated content',
      };

      const existingPage = {
        id: 'test-id',
        pageType: LegalPageType.TERMS,
        content: 'Old content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPage = {
        ...existingPage,
        ...updateDto,
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue(existingPage);
      mockPrismaService.legalPage.update.mockResolvedValue(updatedPage);

      const result = await service.update('test-id', updateDto);

      expect(mockPrismaService.legalPage.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: updateDto,
      });
      expect(result).toEqual(updatedPage);
    });

    it('should throw NotFoundException if page not found', async () => {
      mockPrismaService.legalPage.findUnique.mockResolvedValue(null);

      await expect(
        service.update('non-existent-id', { content: 'New content' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.legalPage.update).not.toHaveBeenCalled();
    });
  });

  describe('updateByType', () => {
    it('should update a legal page by type', async () => {
      const updateDto = {
        content: 'Updated privacy policy',
      };

      const existingPage = {
        id: 'test-id',
        pageType: LegalPageType.PRIVACY,
        content: 'Old privacy policy',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPage = {
        ...existingPage,
        ...updateDto,
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue(existingPage);
      mockPrismaService.legalPage.update.mockResolvedValue(updatedPage);

      const result = await service.updateByType(LegalPageType.PRIVACY, updateDto);

      expect(mockPrismaService.legalPage.update).toHaveBeenCalledWith({
        where: { pageType: LegalPageType.PRIVACY },
        data: updateDto,
      });
      expect(result).toEqual(updatedPage);
    });

    it('should throw NotFoundException if page type not found', async () => {
      mockPrismaService.legalPage.findUnique.mockResolvedValue(null);

      await expect(
        service.updateByType(LegalPageType.TERMS, { content: 'New content' }),
      ).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.legalPage.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a legal page', async () => {
      const existingPage = {
        id: 'test-id',
        pageType: LegalPageType.TERMS,
        content: 'Terms content',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.legalPage.findUnique.mockResolvedValue(existingPage);
      mockPrismaService.legalPage.delete.mockResolvedValue(existingPage);

      const result = await service.remove('test-id');

      expect(mockPrismaService.legalPage.delete).toHaveBeenCalledWith({
        where: { id: 'test-id' },
      });
      expect(result).toEqual(existingPage);
    });

    it('should throw NotFoundException if page not found', async () => {
      mockPrismaService.legalPage.findUnique.mockResolvedValue(null);

      await expect(service.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPrismaService.legalPage.delete).not.toHaveBeenCalled();
    });
  });
});
