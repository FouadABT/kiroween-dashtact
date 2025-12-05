import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EcommerceSettingsService } from './ecommerce-settings.service';
import { CreateEcommerceSettingsDto } from './dto/create-ecommerce-settings.dto';
import { UpdateEcommerceSettingsDto } from './dto/update-ecommerce-settings.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('ecommerce-settings')
@Controller('ecommerce-settings')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EcommerceSettingsController {
  constructor(
    private readonly ecommerceSettingsService: EcommerceSettingsService,
  ) {}

  @Get('global')
  @Public()
  @ApiOperation({ summary: 'Get global e-commerce settings' })
  @ApiResponse({ status: 200, description: 'Global settings retrieved' })
  findGlobal() {
    return this.ecommerceSettingsService.findGlobal();
  }

  @Get('user/:userId')
  @Permissions('settings:read')
  @ApiOperation({ summary: 'Get user-specific e-commerce settings' })
  @ApiResponse({ status: 200, description: 'User settings retrieved' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  findByUserId(@Param('userId') userId: string) {
    return this.ecommerceSettingsService.findByUserId(userId);
  }

  @Get(':id')
  @Permissions('settings:read')
  @ApiOperation({ summary: 'Get e-commerce settings by ID' })
  @ApiResponse({ status: 200, description: 'Settings retrieved' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  findOne(@Param('id') id: string) {
    return this.ecommerceSettingsService.findOne(id);
  }

  @Post()
  @Permissions('settings:write')
  @ApiOperation({ summary: 'Create new e-commerce settings' })
  @ApiResponse({ status: 201, description: 'Settings created' })
  @ApiResponse({ status: 409, description: 'Settings already exist' })
  create(@Body() createDto: CreateEcommerceSettingsDto) {
    return this.ecommerceSettingsService.create(createDto);
  }

  @Patch(':id')
  @Permissions('settings:write')
  @ApiOperation({ summary: 'Update e-commerce settings' })
  @ApiResponse({ status: 200, description: 'Settings updated' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEcommerceSettingsDto,
  ) {
    return this.ecommerceSettingsService.update(id, updateDto);
  }

  @Delete(':id')
  @Permissions('settings:write')
  @ApiOperation({ summary: 'Delete e-commerce settings' })
  @ApiResponse({ status: 200, description: 'Settings deleted' })
  @ApiResponse({ status: 404, description: 'Settings not found' })
  remove(@Param('id') id: string) {
    return this.ecommerceSettingsService.remove(id);
  }
}

