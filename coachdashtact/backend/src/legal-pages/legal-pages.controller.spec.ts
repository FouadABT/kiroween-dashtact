import { Test, TestingModule } from '@nestjs/testing';
import { LegalPagesController } from './legal-pages.controller';
import { LegalPagesService } from './legal-pages.service';
import { LegalPageType } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';

describe('LegalPagesController', () => {
  let controller: LegalPagesController;
  let service: LegalPagesService;

  const mockLegalPagesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByType: jest.fn(),
    update: jest.fn(),
    updateByType: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalPagesController],
      providers: [
        {
          provide: LegalPagesService,
          useValue: mockLegalPagesService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<LegalPagesController>(LegalPagesController);
    service = module.get<LegalPagesService>(LegalPagesService);
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLegalPagesService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all legal pages', async () => {
      const expectedResult = [
        {
          id: 'id-1',
          pageType: LegalPageType.TERMS,
          content: 'Terms content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'id-2',
          pageType: LegalPageType.PRIVACY,
          content: 'Privacy content',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      mockLegalPagesService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByType', () => {
    it('should return a legal page by type', async () => {
      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.PRIVACY,
        content: 'Privacy content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLegalPagesService.findByType.mockResolvedValue(expectedResult);

      const result = await controller.findByType(LegalPageType.PRIVACY);

      expect(service.findByType).toHaveBeenCalledWith(LegalPageType.PRIVACY);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return a legal page by ID', async () => {
      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.TERMS,
        content: 'Terms content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLegalPagesService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne('test-id');

      expect(service.findOne).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a legal page by ID', async () => {
      const updateDto = {
        content: 'Updated content',
      };

      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.TERMS,
        content: 'Updated content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLegalPagesService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('test-id', updateDto);

      expect(service.update).toHaveBeenCalledWith('test-id', updateDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('updateByType', () => {
    it('should update a legal page by type', async () => {
      const updateDto = {
        content: 'Updated privacy policy',
      };

      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.PRIVACY,
        content: 'Updated privacy policy',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLegalPagesService.updateByType.mockResolvedValue(expectedResult);

      const result = await controller.updateByType(LegalPageType.PRIVACY, updateDto);

      expect(service.updateByType).toHaveBeenCalledWith(
        LegalPageType.PRIVACY,
        updateDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should delete a legal page', async () => {
      const expectedResult = {
        id: 'test-id',
        pageType: LegalPageType.TERMS,
        content: 'Terms content',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockLegalPagesService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove('test-id');

      expect(service.remove).toHaveBeenCalledWith('test-id');
      expect(result).toEqual(expectedResult);
    });
  });
});
