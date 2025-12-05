import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import {
  UpdateProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
  AddressResponseDto,
  AccountSettingsDto,
  AccountSettingsResponseDto,
  ChangePasswordDto,
  TwoFactorEnableDto,
  TwoFactorVerifyDto,
  TwoFactorDisableDto,
} from './dto';

@Injectable()
export class CustomerAccountService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get customer profile
   */
  async getProfile(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  /**
   * Update customer profile
   */
  async updateProfile(customerId: string, dto: UpdateProfileDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check if email is being changed and if it's already taken
    if (dto.email && dto.email !== customer.email) {
      const existingCustomer = await this.prisma.customer.findUnique({
        where: { email: dto.email },
      });

      if (existingCustomer) {
        throw new ConflictException('Email already in use');
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id: customerId },
      data: {
        firstName: dto.firstName ?? customer.firstName,
        lastName: dto.lastName ?? customer.lastName,
        email: dto.email ?? customer.email,
        phone: dto.phone ?? customer.phone,
        company: dto.company ?? customer.company,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        company: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updated;
  }

  /**
   * Get all addresses for a customer
   */
  async getAddresses(customerId: string): Promise<AddressResponseDto[]> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const addresses = await this.prisma.address.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return addresses.map((addr) => this.mapAddressToDto(addr));
  }

  /**
   * Create a new address
   */
  async createAddress(
    customerId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Check for duplicate address
    const existingAddress = await this.prisma.address.findFirst({
      where: {
        customerId,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        type: dto.type,
      },
    });

    if (existingAddress) {
      throw new ConflictException('This address already exists');
    }

    // If this is the first address of this type, make it default
    const existingAddressesOfType = await this.prisma.address.findFirst({
      where: {
        customerId,
        type: dto.type,
      },
    });

    const address = await this.prisma.address.create({
      data: {
        customerId,
        type: dto.type,
        street: dto.street,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        phone: dto.phone,
        apartment: dto.apartment,
        isDefault: !existingAddressesOfType,
      },
    });

    return this.mapAddressToDto(address);
  }

  /**
   * Update an address
   */
  async updateAddress(
    customerId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.customerId !== customerId) {
      throw new ForbiddenException('Cannot update address of another customer');
    }

    // Check for duplicate address if street/city/state/postal/country changed
    if (
      dto.street ||
      dto.city ||
      dto.state ||
      dto.postalCode ||
      dto.country ||
      dto.type
    ) {
      const existingAddress = await this.prisma.address.findFirst({
        where: {
          customerId,
          id: { not: addressId },
          street: dto.street ?? address.street,
          city: dto.city ?? address.city,
          state: dto.state ?? address.state,
          postalCode: dto.postalCode ?? address.postalCode,
          country: dto.country ?? address.country,
          type: dto.type ?? address.type,
        },
      });

      if (existingAddress) {
        throw new ConflictException('This address already exists');
      }
    }

    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: {
        street: dto.street ?? address.street,
        city: dto.city ?? address.city,
        state: dto.state ?? address.state,
        postalCode: dto.postalCode ?? address.postalCode,
        country: dto.country ?? address.country,
        phone: dto.phone ?? address.phone,
        apartment: dto.apartment ?? address.apartment,
        type: dto.type ?? address.type,
      },
    });

    return this.mapAddressToDto(updated);
  }

  /**
   * Delete an address
   */
  async deleteAddress(customerId: string, addressId: string): Promise<void> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.customerId !== customerId) {
      throw new ForbiddenException('Cannot delete address of another customer');
    }

    // If this is the default address, assign another as default
    if (address.isDefault) {
      const anotherAddress = await this.prisma.address.findFirst({
        where: {
          customerId,
          type: address.type,
          id: { not: addressId },
        },
      });

      if (anotherAddress) {
        await this.prisma.address.update({
          where: { id: anotherAddress.id },
          data: { isDefault: true },
        });
      }
    }

    await this.prisma.address.delete({
      where: { id: addressId },
    });
  }

  /**
   * Set an address as default
   */
  async setDefaultAddress(
    customerId: string,
    addressId: string,
  ): Promise<AddressResponseDto> {
    const address = await this.prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    if (address.customerId !== customerId) {
      throw new ForbiddenException('Cannot update address of another customer');
    }

    // Remove default from other addresses of the same type
    await this.prisma.address.updateMany({
      where: {
        customerId,
        type: address.type,
        id: { not: addressId },
      },
      data: { isDefault: false },
    });

    // Set this address as default
    const updated = await this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true },
    });

    return this.mapAddressToDto(updated);
  }

  /**
   * Get all payment methods for a customer
   */
  async getPaymentMethods(customerId: string) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const paymentMethods = await this.prisma.customerPaymentMethod.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return paymentMethods.map((pm) => this.mapPaymentMethodToDto(pm));
  }

  /**
   * Create a new payment method
   */
  async createPaymentMethod(customerId: string, dto: any) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // If this is the first payment method, make it default
    const existingPaymentMethods = await this.prisma.customerPaymentMethod.findFirst({
      where: { customerId },
    });

    const paymentMethod = await this.prisma.customerPaymentMethod.create({
      data: {
        customerId,
        paymentMethodId: dto.paymentMethodId || 'default',
        cardLast4: dto.cardLast4,
        cardExpiry: dto.cardExpiry,
        cardBrand: dto.cardBrand,
        billingAddressId: dto.billingAddressId,
        encryptedData: dto.encryptedData,
        isDefault: !existingPaymentMethods,
      },
    });

    return this.mapPaymentMethodToDto(paymentMethod);
  }

  /**
   * Update a payment method
   */
  async updatePaymentMethod(customerId: string, methodId: string, dto: any) {
    const paymentMethod = await this.prisma.customerPaymentMethod.findUnique({
      where: { id: methodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.customerId !== customerId) {
      throw new ForbiddenException(
        'Cannot update payment method of another customer',
      );
    }

    const updated = await this.prisma.customerPaymentMethod.update({
      where: { id: methodId },
      data: {
        cardLast4: dto.cardLast4 ?? paymentMethod.cardLast4,
        cardExpiry: dto.cardExpiry ?? paymentMethod.cardExpiry,
        cardBrand: dto.cardBrand ?? paymentMethod.cardBrand,
        billingAddressId: dto.billingAddressId ?? paymentMethod.billingAddressId,
        encryptedData: dto.encryptedData ?? paymentMethod.encryptedData,
      },
    });

    return this.mapPaymentMethodToDto(updated);
  }

  /**
   * Delete a payment method
   */
  async deletePaymentMethod(customerId: string, methodId: string): Promise<void> {
    const paymentMethod = await this.prisma.customerPaymentMethod.findUnique({
      where: { id: methodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.customerId !== customerId) {
      throw new ForbiddenException(
        'Cannot delete payment method of another customer',
      );
    }

    // If this is the default payment method, assign another as default
    if (paymentMethod.isDefault) {
      const anotherPaymentMethod = await this.prisma.customerPaymentMethod.findFirst({
        where: {
          customerId,
          id: { not: methodId },
        },
      });

      if (anotherPaymentMethod) {
        await this.prisma.customerPaymentMethod.update({
          where: { id: anotherPaymentMethod.id },
          data: { isDefault: true },
        });
      }
    }

    await this.prisma.customerPaymentMethod.delete({
      where: { id: methodId },
    });
  }

  /**
   * Set a payment method as default
   */
  async setDefaultPaymentMethod(
    customerId: string,
    methodId: string,
  ) {
    const paymentMethod = await this.prisma.customerPaymentMethod.findUnique({
      where: { id: methodId },
    });

    if (!paymentMethod) {
      throw new NotFoundException('Payment method not found');
    }

    if (paymentMethod.customerId !== customerId) {
      throw new ForbiddenException(
        'Cannot update payment method of another customer',
      );
    }

    // Remove default from other payment methods
    await this.prisma.customerPaymentMethod.updateMany({
      where: {
        customerId,
        id: { not: methodId },
      },
      data: { isDefault: false },
    });

    // Set this payment method as default
    const updated = await this.prisma.customerPaymentMethod.update({
      where: { id: methodId },
      data: { isDefault: true },
    });

    return this.mapPaymentMethodToDto(updated);
  }

  /**
   * Helper method to map address to DTO
   */
  private mapAddressToDto(address: any): AddressResponseDto {
    return {
      id: address.id,
      customerId: address.customerId,
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone,
      apartment: address.apartment,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }

  /**
   * Helper method to map payment method to DTO
   */
  private mapPaymentMethodToDto(pm: any) {
    return {
      id: pm.id,
      customerId: pm.customerId,
      paymentMethodId: pm.paymentMethodId,
      cardLast4: pm.cardLast4,
      cardExpiry: pm.cardExpiry,
      cardBrand: pm.cardBrand,
      billingAddressId: pm.billingAddressId,
      isDefault: pm.isDefault,
      createdAt: pm.createdAt,
      updatedAt: pm.updatedAt,
    };
  }

  /**
   * Get account settings for a customer
   */
  async getSettings(customerId: string): Promise<AccountSettingsResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let settings = await this.prisma.accountSettings.findUnique({
      where: { customerId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.accountSettings.create({
        data: {
          customerId,
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          orderUpdates: true,
          twoFactorEnabled: false,
          privacyLevel: 'private',
        },
      });
    }

    return this.mapSettingsToDto(settings);
  }

  /**
   * Update account settings
   */
  async updateSettings(
    customerId: string,
    dto: AccountSettingsDto,
  ): Promise<AccountSettingsResponseDto> {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    let settings = await this.prisma.accountSettings.findUnique({
      where: { customerId },
    });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await this.prisma.accountSettings.create({
        data: {
          customerId,
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
          orderUpdates: true,
          twoFactorEnabled: false,
          privacyLevel: 'private',
        },
      });
    }

    const updated = await this.prisma.accountSettings.update({
      where: { customerId },
      data: {
        emailNotifications:
          dto.emailNotifications ?? settings.emailNotifications,
        smsNotifications: dto.smsNotifications ?? settings.smsNotifications,
        marketingEmails: dto.marketingEmails ?? settings.marketingEmails,
        orderUpdates: dto.orderUpdates ?? settings.orderUpdates,
        privacyLevel: dto.privacyLevel ?? settings.privacyLevel,
      },
    });

    return this.mapSettingsToDto(updated);
  }

  /**
   * Change customer password
   */
  async changePassword(
    customerId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      customerAccount.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.customerAccount.update({
      where: { customerId },
      data: { password: hashedPassword },
    });

    return { message: 'Password changed successfully' };
  }

  /**
   * Enable two-factor authentication
   */
  async enableTwoFactor(
    customerId: string,
    dto: TwoFactorEnableDto,
  ): Promise<{ secret: string; qrCode: string }> {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      customerAccount.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    // Generate 2FA secret (base32 encoded random string)
    const secret = Buffer.from(Math.random().toString()).toString('base64').substring(0, 32);
    
    // Generate QR code URL (simplified - in production use qrcode library)
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Dashtact:${customerAccount.email}?secret=${secret}&issuer=Dashtact`;

    return {
      secret,
      qrCode,
    };
  }

  /**
   * Verify and confirm two-factor authentication
   */
  async verifyTwoFactor(
    customerId: string,
    dto: TwoFactorVerifyDto,
    secret: string,
  ): Promise<{ message: string; backupCodes: string[] }> {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify the code (simplified - in production use speakeasy or similar)
    // For now, accept any 6-digit code as valid
    if (!/^\d{6}$/.test(dto.code)) {
      throw new BadRequestException('Invalid verification code format');
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    // Update account settings to enable 2FA
    await this.prisma.accountSettings.update({
      where: { customerId },
      data: { twoFactorEnabled: true },
    });

    return {
      message: '2FA enabled successfully',
      backupCodes,
    };
  }

  /**
   * Disable two-factor authentication
   */
  async disableTwoFactor(
    customerId: string,
    dto: TwoFactorDisableDto,
  ): Promise<{ message: string }> {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      customerAccount.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Password is incorrect');
    }

    // Update account settings to disable 2FA
    await this.prisma.accountSettings.update({
      where: { customerId },
      data: { twoFactorEnabled: false },
    });

    return { message: '2FA disabled successfully' };
  }

  /**
   * Helper method to map settings to DTO
   */
  private mapSettingsToDto(settings: any): AccountSettingsResponseDto {
    return {
      id: settings.id,
      customerId: settings.customerId,
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      marketingEmails: settings.marketingEmails,
      orderUpdates: settings.orderUpdates,
      twoFactorEnabled: settings.twoFactorEnabled,
      privacyLevel: settings.privacyLevel,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  /**
   * Get customer's wishlist with product details
   */
  async getWishlist(customerId: string) {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: customerAccount.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                basePrice: true,
                featuredImage: true,
                isVisible: true,
              },
            },
            productVariant: {
              select: {
                id: true,
                name: true,
                price: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    // Create wishlist if it doesn't exist
    if (!wishlist) {
      await this.prisma.wishlist.create({
        data: {
          userId: customerAccount.id,
        },
      });
    }

    // Get items
    const items = await this.prisma.wishlistItem.findMany({
      where: { wishlistId: wishlist?.id || (await this.prisma.wishlist.findUnique({ where: { userId: customerAccount.id } }))?.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            featuredImage: true,
            isVisible: true,
          },
        },
        productVariant: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    const finalWishlist = wishlist || (await this.prisma.wishlist.findUnique({ where: { userId: customerAccount.id } }));

    return {
      id: finalWishlist!.id,
      customerId,
      items: items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productVariantId: item.productVariantId,
        product: item.product,
        productVariant: item.productVariant,
        createdAt: item.createdAt,
      })),
      createdAt: finalWishlist!.createdAt,
      updatedAt: finalWishlist!.updatedAt,
    };
  }

  /**
   * Add product to wishlist
   */
  async addToWishlist(
    customerId: string,
    productId: string,
    productVariantId?: string,
  ) {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Verify product variant if provided
    if (productVariantId) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: productVariantId },
      });

      if (!variant || variant.productId !== productId) {
        throw new NotFoundException('Product variant not found');
      }
    }

    // Get or create wishlist
    let wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: customerAccount.id },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId: customerAccount.id,
        },
      });
    }

    // Check if item already in wishlist
    const existingItem = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
        productVariantId: productVariantId || null,
      },
    });

    if (existingItem) {
      throw new ConflictException('Product already in wishlist');
    }

    // Add to wishlist
    const item = await this.prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId,
        productVariantId,
      },
    });

    // Fetch the full item with product details
    const fullItem = await this.prisma.wishlistItem.findUnique({
      where: { id: item.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            basePrice: true,
            featuredImage: true,
            isVisible: true,
          },
        },
        productVariant: {
          select: {
            id: true,
            name: true,
            price: true,
            isActive: true,
          },
        },
      },
    });

    if (!fullItem) {
      throw new NotFoundException('Wishlist item not found');
    }

    return {
      id: fullItem.id,
      productId: fullItem.productId,
      productVariantId: fullItem.productVariantId,
      product: fullItem.product,
      productVariant: fullItem.productVariant,
      createdAt: fullItem.createdAt,
    };
  }

  /**
   * Remove product from wishlist
   */
  async removeFromWishlist(
    customerId: string,
    productId: string,
  ): Promise<void> {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: customerAccount.id },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const item = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    if (!item) {
      throw new NotFoundException('Product not in wishlist');
    }

    await this.prisma.wishlistItem.delete({
      where: { id: item.id },
    });
  }

  /**
   * Check if product is in wishlist
   */
  async isProductInWishlist(
    customerId: string,
    productId: string,
  ): Promise<boolean> {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId: customerAccount.id },
    });

    if (!wishlist) {
      return false;
    }

    const item = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId: wishlist.id,
        productId,
      },
    });

    return !!item;
  }

  /**
   * Get customer's order history with pagination and filtering
   */
  async getOrderHistory(
    customerId: string,
    page: number = 1,
    limit: number = 10,
    status?: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    // Build filter conditions
    const where: any = {
      customerId,
    };

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    // Get total count
    const total = await this.prisma.order.count({ where });

    // Get paginated orders
    const orders = await this.prisma.order.findMany({
      where,
      include: {
        items: {
          select: {
            id: true,
            productName: true,
            variantName: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        discount: order.discount,
        total: order.total,
        items: order.items,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        paidAt: order.paidAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Delete customer account
   * Requires password verification for security
   */
  async deleteAccount(customerId: string, password: string): Promise<void> {
    const customerAccount = await this.prisma.customerAccount.findUnique({
      where: { customerId },
      select: {
        id: true,
        password: true,
      },
    });

    if (!customerAccount) {
      throw new NotFoundException('Customer account not found');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customerAccount.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Invalid password');
    }

    // Delete customer account and all related data
    // Cascade delete will handle related records
    await this.prisma.customer.delete({
      where: { id: customerId },
    });
  }
}
