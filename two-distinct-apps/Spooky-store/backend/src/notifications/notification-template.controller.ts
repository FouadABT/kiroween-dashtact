import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationTemplateService } from './notification-template.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { TemplateFiltersDto } from './dto/template-filters.dto';
import { RenderTemplateDto } from './dto/render-template.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('notifications/templates')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NotificationTemplateController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  /**
   * List all notification templates
   * GET /notifications/templates
   */
  @Get()
  @Permissions('notifications:read')
  async findAll(@Query() filters: TemplateFiltersDto) {
    return this.templateService.findAll(filters);
  }

  /**
   * Get a template by its unique key
   * GET /notifications/templates/:key
   */
  @Get(':key')
  @Permissions('notifications:read')
  async findByKey(@Param('key') key: string) {
    return this.templateService.findByKey(key);
  }

  /**
   * Create a new notification template (admin only)
   * POST /notifications/templates
   */
  @Post()
  @Permissions('notifications:write')
  async create(@Body() dto: CreateTemplateDto) {
    return this.templateService.create(dto);
  }

  /**
   * Update an existing template (admin only)
   * PATCH /notifications/templates/:id
   */
  @Patch(':id')
  @Permissions('notifications:write')
  async update(@Param('id') id: string, @Body() dto: UpdateTemplateDto) {
    return this.templateService.update(id, dto);
  }

  /**
   * Delete a template (admin only)
   * DELETE /notifications/templates/:id
   */
  @Delete(':id')
  @Permissions('notifications:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    await this.templateService.delete(id);
  }

  /**
   * Test template rendering with provided variables
   * POST /notifications/templates/:key/test
   */
  @Post(':key/test')
  @Permissions('notifications:read')
  async testRender(@Param('key') key: string, @Body() dto: RenderTemplateDto) {
    return this.templateService.render(key, dto.variables);
  }
}
