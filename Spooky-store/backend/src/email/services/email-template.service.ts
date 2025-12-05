import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEmailTemplateDto, UpdateEmailTemplateDto } from '../dto/email-template.dto';

@Injectable()
export class EmailTemplateService {
  private readonly logger = new Logger(EmailTemplateService.name);

  constructor(private prisma: PrismaService) {}

  async create(dto: CreateEmailTemplateDto, userId: string) {
    // Validate template variables
    this.validateTemplateVariables(dto.htmlBody, dto.variables);
    if (dto.textBody) {
      this.validateTemplateVariables(dto.textBody, dto.variables);
    }

    try {
      return await this.prisma.emailTemplate.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          subject: dto.subject,
          htmlBody: dto.htmlBody,
          textBody: dto.textBody,
          variables: dto.variables,
          category: dto.category || 'SYSTEM',
          createdBy: userId,
          updatedBy: userId,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Template with this name or slug already exists');
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.emailTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async findBySlug(slug: string) {
    const template = await this.prisma.emailTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      throw new NotFoundException('Email template not found');
    }

    return template;
  }

  async update(id: string, dto: UpdateEmailTemplateDto, userId: string) {
    const template = await this.findOne(id);

    // Validate template variables if body is being updated
    if (dto.htmlBody) {
      const variables = dto.variables || (template.variables as string[]);
      this.validateTemplateVariables(dto.htmlBody, variables);
    }
    if (dto.textBody) {
      const variables = dto.variables || (template.variables as string[]);
      this.validateTemplateVariables(dto.textBody, variables);
    }

    return this.prisma.emailTemplate.update({
      where: { id },
      data: {
        ...dto,
        updatedBy: userId,
      },
    });
  }

  async delete(id: string) {
    const template = await this.findOne(id);

    // Check if template is being used
    const usageCount = await this.prisma.emailLog.count({
      where: { templateId: id },
    });

    if (usageCount > 0) {
      throw new BadRequestException(
        'Cannot delete template that has been used. Consider deactivating it instead.',
      );
    }

    return this.prisma.emailTemplate.delete({
      where: { id },
    });
  }

  async renderTemplate(templateId: string, data: Record<string, any>): Promise<{ subject: string; htmlBody: string; textBody?: string }> {
    const template = await this.findOne(templateId);

    if (!template.isActive) {
      throw new BadRequestException('Template is not active');
    }

    // Render subject
    const subject = this.replaceVariables(template.subject, data);

    // Render HTML body
    const htmlBody = this.replaceVariables(template.htmlBody, data);

    // Render text body if exists
    const textBody = template.textBody ? this.replaceVariables(template.textBody, data) : undefined;

    return { subject, htmlBody, textBody };
  }

  private validateTemplateVariables(content: string, variables: string[]): void {
    // Find all {{variable}} patterns in content
    const variablePattern = /\{\{(\w+)\}\}/g;
    const foundVariables = new Set<string>();
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      foundVariables.add(match[1]);
    }

    // Check if all found variables are declared
    const declaredVariables = new Set(variables);
    const undeclaredVariables = Array.from(foundVariables).filter(
      (v) => !declaredVariables.has(v),
    );

    if (undeclaredVariables.length > 0) {
      throw new BadRequestException(
        `Template contains undeclared variables: ${undeclaredVariables.join(', ')}`,
      );
    }
  }

  private replaceVariables(content: string, data: Record<string, any>): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
      if (data.hasOwnProperty(variable)) {
        return String(data[variable]);
      }
      this.logger.warn(`Variable ${variable} not provided in template data`);
      return match; // Keep original if not found
    });
  }
}
