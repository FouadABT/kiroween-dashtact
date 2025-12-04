import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateFiltersDto } from './dto/template-filters.dto';
import type { NotificationTemplate } from '@prisma/client';

export interface RenderedTemplate {
  title: string;
  message: string;
}

@Injectable()
export class NotificationTemplateService {
  private readonly logger = new Logger(NotificationTemplateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new notification template
   */
  async create(dto: CreateTemplateDto): Promise<NotificationTemplate> {
    try {
      // Check if template with this key already exists
      const existing = await this.prisma.notificationTemplate.findUnique({
        where: { key: dto.key },
      });

      if (existing) {
        throw new ConflictException(
          `Template with key "${dto.key}" already exists`,
        );
      }

      // Validate variables in template content
      this.validateTemplateVariables(dto.title, dto.variables);
      this.validateTemplateVariables(dto.message, dto.variables);

      return await this.prisma.notificationTemplate.create({
        data: {
          key: dto.key,
          name: dto.name,
          description: dto.description,
          category: dto.category,
          title: dto.title,
          message: dto.message,
          variables: dto.variables || [],
          defaultChannels: dto.defaultChannels || ['IN_APP'],
          defaultPriority: dto.defaultPriority || 'NORMAL',
          version: 1,
          isActive: dto.isActive !== undefined ? dto.isActive : true,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to create template: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all templates with optional filters
   */
  async findAll(filters?: TemplateFiltersDto): Promise<NotificationTemplate[]> {
    try {
      const where: any = {};

      if (filters?.category) {
        where.category = filters.category;
      }

      if (filters?.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters?.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { key: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      return await this.prisma.notificationTemplate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch templates: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get a template by its unique key
   */
  async findByKey(key: string): Promise<NotificationTemplate> {
    try {
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { key },
      });

      if (!template) {
        throw new NotFoundException(`Template with key "${key}" not found`);
      }

      return template;
    } catch (error) {
      this.logger.error(`Failed to fetch template by key: ${error.message}`);
      throw error;
    }
  }

  /**
   * Update an existing template
   */
  async update(
    id: string,
    dto: UpdateTemplateDto,
  ): Promise<NotificationTemplate> {
    try {
      // Check if template exists
      const existing = await this.prisma.notificationTemplate.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(`Template with ID ${id} not found`);
      }

      // If key is being updated, check for conflicts
      if (dto.key && dto.key !== existing.key) {
        const keyExists = await this.prisma.notificationTemplate.findUnique({
          where: { key: dto.key },
        });

        if (keyExists) {
          throw new ConflictException(
            `Template with key "${dto.key}" already exists`,
          );
        }
      }

      // Validate variables if title or message is being updated
      const variables = dto.variables || existing.variables;
      if (dto.title) {
        this.validateTemplateVariables(dto.title, variables);
      }
      if (dto.message) {
        this.validateTemplateVariables(dto.message, variables);
      }

      // Increment version if content is being updated
      const shouldIncrementVersion =
        dto.title !== undefined ||
        dto.message !== undefined ||
        dto.variables !== undefined;

      return await this.prisma.notificationTemplate.update({
        where: { id },
        data: {
          ...dto,
          ...(shouldIncrementVersion && { version: existing.version + 1 }),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to update template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    try {
      const template = await this.prisma.notificationTemplate.findUnique({
        where: { id },
      });

      if (!template) {
        throw new NotFoundException(`Template with ID ${id} not found`);
      }

      await this.prisma.notificationTemplate.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error(`Failed to delete template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Render a template with provided variables
   */
  async render(
    templateKey: string,
    variables: Record<string, any>,
  ): Promise<RenderedTemplate> {
    try {
      const template = await this.findByKey(templateKey);

      // Validate that all required variables are provided
      const templateVariables = Array.isArray(template.variables)
        ? template.variables
        : [];
      const missingVariables = templateVariables.filter((varName) => {
        if (typeof varName === 'string') {
          return !(varName in variables);
        }
        return false;
      });

      if (missingVariables.length > 0) {
        throw new BadRequestException(
          `Missing required variables: ${missingVariables.join(', ')}`,
        );
      }

      return {
        title: this.substituteVariables(template.title, variables),
        message: this.substituteVariables(template.message, variables),
      };
    } catch (error) {
      this.logger.error(`Failed to render template: ${error.message}`);
      throw error;
    }
  }

  /**
   * Replace {{variable}} placeholders with actual values
   */
  substituteVariables(text: string, variables: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (key in variables) {
        const value = variables[key];
        // Convert to string, handling null/undefined
        return value !== null && value !== undefined ? String(value) : '';
      }
      // Keep placeholder if variable not provided
      return match;
    });
  }

  /**
   * Validate that template content only uses declared variables
   */
  private validateTemplateVariables(
    text: string,
    declaredVariables: any,
  ): void {
    const variablesArray = Array.isArray(declaredVariables)
      ? declaredVariables
      : [];

    // Extract all {{variable}} placeholders from text
    const usedVariables = new Set<string>();
    const regex = /\{\{(\w+)\}\}/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      usedVariables.add(match[1]);
    }

    // Check if all used variables are declared
    const undeclaredVariables = Array.from(usedVariables).filter(
      (varName) => !variablesArray.includes(varName),
    );

    if (undeclaredVariables.length > 0) {
      throw new BadRequestException(
        `Template uses undeclared variables: ${undeclaredVariables.join(', ')}. ` +
          `Please add them to the variables array.`,
      );
    }
  }
}
