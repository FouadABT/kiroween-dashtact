import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEcommerceSettingsDto } from './dto/create-ecommerce-settings.dto';
import { UpdateEcommerceSettingsDto } from './dto/update-ecommerce-settings.dto';

@Injectable()
export class EcommerceSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find global e-commerce settings
   */
  async findGlobal() {
    const settings = await this.prisma.ecommerceSettings.findFirst({
      where: { scope: 'global' },
    });

    if (!settings) {
      // Return default settings if none exist
      return this.getDefaultSettings();
    }

    return settings;
  }

  /**
   * Find user-specific e-commerce settings
   */
  async findByUserId(userId: string) {
    const settings = await this.prisma.ecommerceSettings.findUnique({
      where: { userId },
    });

    if (!settings) {
      // Fall back to global settings
      return this.findGlobal();
    }

    return settings;
  }

  /**
   * Find settings by ID
   */
  async findOne(id: string) {
    const settings = await this.prisma.ecommerceSettings.findUnique({
      where: { id },
    });

    if (!settings) {
      throw new NotFoundException(`Settings with ID ${id} not found`);
    }

    return settings;
  }

  /**
   * Create new e-commerce settings
   */
  async create(createDto: CreateEcommerceSettingsDto) {
    // Check if global settings already exist
    if (createDto.scope === 'global') {
      const existing = await this.prisma.ecommerceSettings.findFirst({
        where: { scope: 'global' },
      });

      if (existing) {
        throw new ConflictException('Global settings already exist');
      }
    }

    // Check if user settings already exist
    if (createDto.scope === 'user' && createDto.userId) {
      const existing = await this.prisma.ecommerceSettings.findUnique({
        where: { userId: createDto.userId },
      });

      if (existing) {
        throw new ConflictException(
          `Settings for user ${createDto.userId} already exist`,
        );
      }
    }

    return this.prisma.ecommerceSettings.create({
      data: createDto,
    });
  }

  /**
   * Update e-commerce settings
   */
  async update(id: string, updateDto: UpdateEcommerceSettingsDto) {
    // Verify settings exist
    await this.findOne(id);

    return this.prisma.ecommerceSettings.update({
      where: { id },
      data: updateDto,
    });
  }

  /**
   * Delete e-commerce settings
   */
  async remove(id: string) {
    // Verify settings exist
    await this.findOne(id);

    return this.prisma.ecommerceSettings.delete({
      where: { id },
    });
  }

  /**
   * Get default settings structure
   */
  private getDefaultSettings() {
    return {
      id: 'default',
      scope: 'global',
      userId: null,
      storeName: 'My Store',
      storeDescription: null,
      currency: 'USD',
      currencySymbol: '$',
      taxRate: 0,
      taxLabel: 'Tax',
      shippingEnabled: true,
      portalEnabled: true,
      allowGuestCheckout: false,
      trackInventory: true,
      lowStockThreshold: 10,
      autoGenerateOrderNumbers: true,
      orderNumberPrefix: 'ORD',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

