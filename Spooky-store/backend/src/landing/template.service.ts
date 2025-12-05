import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateSectionTemplateDto,
  UpdateSectionTemplateDto,
} from './dto/section-template.dto';

@Injectable()
export class TemplateService {
  constructor(private prisma: PrismaService) {}

  async getTemplates(category?: string, userId?: string): Promise<any[]> {
    const where: any = {
      OR: [{ isPublic: true }, { userId }],
    };

    if (category) {
      where.category = category;
    }

    return this.prisma.sectionTemplate.findMany({
      where,
      orderBy: [{ isCustom: 'asc' }, { createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getTemplateById(id: string, userId?: string): Promise<any> {
    const template = await this.prisma.sectionTemplate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    // Check access permissions
    if (!template.isPublic && template.userId !== userId) {
      throw new ForbiddenException('Access denied to this template');
    }

    return template;
  }

  async createCustomTemplate(
    dto: CreateSectionTemplateDto,
    userId: string,
  ): Promise<any> {
    return this.prisma.sectionTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        thumbnail: dto.thumbnail,
        section: dto.section as any,
        isCustom: true,
        isPublic: dto.isPublic ?? false,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async updateCustomTemplate(
    id: string,
    dto: UpdateSectionTemplateDto,
    userId: string,
  ): Promise<any> {
    const template = await this.prisma.sectionTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('You can only update your own templates');
    }

    return this.prisma.sectionTemplate.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        thumbnail: dto.thumbnail,
        section: dto.section as any,
        isPublic: dto.isPublic,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteCustomTemplate(id: string, userId: string): Promise<void> {
    const template = await this.prisma.sectionTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('You can only delete your own templates');
    }

    await this.prisma.sectionTemplate.delete({
      where: { id },
    });
  }

  async exportTemplate(id: string, userId?: string): Promise<string> {
    const template = await this.getTemplateById(id, userId);

    return JSON.stringify(
      {
        name: template.name,
        description: template.description,
        category: template.category,
        section: template.section,
      },
      null,
      2,
    );
  }

  async importTemplate(
    data: string,
    userId: string,
  ): Promise<any> {
    try {
      const parsed = JSON.parse(data);

      // Validate required fields
      if (!parsed.name || !parsed.category || !parsed.section) {
        throw new Error('Invalid template data');
      }

      return this.createCustomTemplate(
        {
          name: parsed.name,
          description: parsed.description,
          category: parsed.category,
          section: parsed.section,
          isPublic: false,
        },
        userId,
      );
    } catch (error) {
      throw new Error(`Failed to import template: ${error.message}`);
    }
  }
}
