import { Test, TestingModule } from '@nestjs/testing';
import { TemplateService } from './template.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TemplateService', () => {
  let service: TemplateService;
  let prisma: PrismaService;

  const mockPrismaService = {
    sectionTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TemplateService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TemplateService>(TemplateService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTemplates', () => {
    it('should return all templates', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Hero Template',
          category: 'hero',
          isCustom: false,
        },
        {
          id: 'template-2',
          name: 'Features Template',
          category: 'features',
          isCustom: false,
        },
      ];

      mockPrismaService.sectionTemplate.findMany.mockResolvedValue(
        mockTemplates,
      );

      const result = await service.getTemplates();

      expect(result).toEqual(mockTemplates);
      expect(mockPrismaService.sectionTemplate.findMany).toHaveBeenCalledWith({
        where: { isPublic: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter templates by category', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Hero Template',
          category: 'hero',
        },
      ];

      mockPrismaService.sectionTemplate.findMany.mockResolvedValue(
        mockTemplates,
      );

      const result = await service.getTemplates('hero');

      expect(mockPrismaService.sectionTemplate.findMany).toHaveBeenCalledWith({
        where: { isPublic: true, category: 'hero' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return a template by ID', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Hero Template',
        category: 'hero',
      };

      mockPrismaService.sectionTemplate.findUnique.mockResolvedValue(
        mockTemplate,
      );

      const result = await service.getTemplateById('template-1');

      expect(result).toEqual(mockTemplate);
      expect(mockPrismaService.sectionTemplate.findUnique).toHaveBeenCalledWith(
        {
          where: { id: 'template-1' },
        },
      );
    });

    it('should return null if template not found', async () => {
      mockPrismaService.sectionTemplate.findUnique.mockResolvedValue(null);

      const result = await service.getTemplateById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('createCustomTemplate', () => {
    it('should create a custom template', async () => {
      const createDto = {
        name: 'My Custom Template',
        description: 'A custom hero section',
        category: 'hero',
        section: {
          type: 'hero',
          content: {},
        },
        userId: 'user-1',
      };

      const mockCreated = {
        id: 'template-custom-1',
        ...createDto,
        isCustom: true,
        isPublic: false,
      };

      mockPrismaService.sectionTemplate.create.mockResolvedValue(mockCreated);

      const result = await service.createCustomTemplate(createDto);

      expect(result).toEqual(mockCreated);
      expect(mockPrismaService.sectionTemplate.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          isCustom: true,
          isPublic: false,
        },
      });
    });
  });

  describe('updateCustomTemplate', () => {
    it('should update a custom template', async () => {
      const templateId = 'template-1';
      const updateDto = {
        name: 'Updated Template',
        description: 'Updated description',
      };

      const mockUpdated = {
        id: templateId,
        ...updateDto,
        category: 'hero',
      };

      mockPrismaService.sectionTemplate.update.mockResolvedValue(mockUpdated);

      const result = await service.updateCustomTemplate(templateId, updateDto);

      expect(result).toEqual(mockUpdated);
      expect(mockPrismaService.sectionTemplate.update).toHaveBeenCalledWith({
        where: { id: templateId },
        data: updateDto,
      });
    });
  });

  describe('deleteCustomTemplate', () => {
    it('should delete a custom template', async () => {
      const templateId = 'template-1';

      mockPrismaService.sectionTemplate.delete.mockResolvedValue({
        id: templateId,
      });

      await service.deleteCustomTemplate(templateId);

      expect(mockPrismaService.sectionTemplate.delete).toHaveBeenCalledWith({
        where: { id: templateId },
      });
    });
  });

  describe('exportTemplate', () => {
    it('should export a template as JSON', async () => {
      const mockTemplate = {
        id: 'template-1',
        name: 'Hero Template',
        category: 'hero',
        section: {
          type: 'hero',
          content: {},
        },
      };

      mockPrismaService.sectionTemplate.findUnique.mockResolvedValue(
        mockTemplate,
      );

      const result = await service.exportTemplate('template-1');

      expect(result).toBe(JSON.stringify(mockTemplate, null, 2));
    });
  });

  describe('importTemplate', () => {
    it('should import a template from JSON', async () => {
      const templateData = {
        name: 'Imported Template',
        category: 'hero',
        section: {
          type: 'hero',
          content: {},
        },
      };

      const jsonData = JSON.stringify(templateData);

      mockPrismaService.sectionTemplate.create.mockResolvedValue({
        id: 'template-imported-1',
        ...templateData,
        isCustom: true,
      });

      const result = await service.importTemplate(jsonData);

      expect(result.name).toBe('Imported Template');
      expect(mockPrismaService.sectionTemplate.create).toHaveBeenCalled();
    });

    it('should throw error for invalid JSON', async () => {
      const invalidJson = 'not valid json';

      await expect(service.importTemplate(invalidJson)).rejects.toThrow();
    });
  });

  describe('searchTemplates', () => {
    it('should search templates by name and description', async () => {
      const mockTemplates = [
        {
          id: 'template-1',
          name: 'Hero Section',
          description: 'A hero section template',
        },
      ];

      mockPrismaService.sectionTemplate.findMany.mockResolvedValue(
        mockTemplates,
      );

      const result = await service.searchTemplates('hero');

      expect(result).toEqual(mockTemplates);
    });
  });
});
