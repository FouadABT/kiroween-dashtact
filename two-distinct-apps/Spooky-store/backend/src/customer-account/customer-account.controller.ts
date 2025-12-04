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
  BadRequestException,
} from '@nestjs/common';
import { CustomerAccountService } from './customer-account.service';
import {
  UpdateProfileDto,
  CreateAddressDto,
  UpdateAddressDto,
  AccountSettingsDto,
  ChangePasswordDto,
  TwoFactorEnableDto,
  TwoFactorVerifyDto,
  TwoFactorDisableDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { FeatureGuard } from '../common/guards/feature.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { FeatureEnabled } from '../common/decorators/feature-enabled.decorator';

@Controller('customer-account')
@UseGuards(JwtAuthGuard, PermissionsGuard, FeatureGuard)
@FeatureEnabled('customerAccount')
export class CustomerAccountController {
  constructor(
    private readonly customerAccountService: CustomerAccountService,
  ) {}

  /**
   * Get current customer profile
   */
  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return this.customerAccountService.getProfile(user.customerId);
  }

  /**
   * Update current customer profile
   */
  @Patch('profile')
  @Permissions('profile:write')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.customerAccountService.updateProfile(user.customerId, dto);
  }

  /**
   * Get all addresses for current customer
   */
  @Get('addresses')
  async getAddresses(@CurrentUser() user: any) {
    return this.customerAccountService.getAddresses(user.customerId);
  }

  /**
   * Create a new address
   */
  @Post('addresses')
  @Permissions('addresses:write')
  async createAddress(
    @CurrentUser() user: any,
    @Body() dto: CreateAddressDto,
  ) {
    return this.customerAccountService.createAddress(user.customerId, dto);
  }

  /**
   * Update an address
   */
  @Patch('addresses/:id')
  @Permissions('addresses:write')
  async updateAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.customerAccountService.updateAddress(
      user.customerId,
      addressId,
      dto,
    );
  }

  /**
   * Delete an address
   */
  @Delete('addresses/:id')
  @Permissions('addresses:delete')
  async deleteAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
  ) {
    await this.customerAccountService.deleteAddress(user.customerId, addressId);
    return { message: 'Address deleted successfully' };
  }

  /**
   * Set an address as default
   */
  @Patch('addresses/:id/default')
  @Permissions('addresses:write')
  async setDefaultAddress(
    @CurrentUser() user: any,
    @Param('id') addressId: string,
  ) {
    return this.customerAccountService.setDefaultAddress(
      user.customerId,
      addressId,
    );
  }

  /**
   * Get all payment methods for current customer
   */
  @Get('payment-methods')
  async getPaymentMethods(@CurrentUser() user: any) {
    return this.customerAccountService.getPaymentMethods(user.customerId);
  }

  /**
   * Create a new payment method
   */
  @Post('payment-methods')
  @Permissions('payment-methods:write')
  async createPaymentMethod(
    @CurrentUser() user: any,
    @Body() dto: any,
  ) {
    return this.customerAccountService.createPaymentMethod(user.customerId, dto);
  }

  /**
   * Update a payment method
   */
  @Patch('payment-methods/:id')
  @Permissions('payment-methods:write')
  async updatePaymentMethod(
    @CurrentUser() user: any,
    @Param('id') methodId: string,
    @Body() dto: any,
  ) {
    return this.customerAccountService.updatePaymentMethod(
      user.customerId,
      methodId,
      dto,
    );
  }

  /**
   * Delete a payment method
   */
  @Delete('payment-methods/:id')
  @Permissions('payment-methods:delete')
  async deletePaymentMethod(
    @CurrentUser() user: any,
    @Param('id') methodId: string,
  ) {
    await this.customerAccountService.deletePaymentMethod(
      user.customerId,
      methodId,
    );
    return { message: 'Payment method deleted successfully' };
  }

  /**
   * Set a payment method as default
   */
  @Patch('payment-methods/:id/default')
  @Permissions('payment-methods:write')
  async setDefaultPaymentMethod(
    @CurrentUser() user: any,
    @Param('id') methodId: string,
  ) {
    return this.customerAccountService.setDefaultPaymentMethod(
      user.customerId,
      methodId,
    );
  }

  /**
   * Get account settings
   */
  @Get('settings')
  async getSettings(@CurrentUser() user: any) {
    return this.customerAccountService.getSettings(user.customerId);
  }

  /**
   * Update account settings
   */
  @Patch('settings')
  @Permissions('settings:write')
  async updateSettings(
    @CurrentUser() user: any,
    @Body() dto: AccountSettingsDto,
  ) {
    return this.customerAccountService.updateSettings(user.customerId, dto);
  }

  /**
   * Change password
   */
  @Post('password/change')
  @Permissions('account:security')
  async changePassword(
    @CurrentUser() user: any,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.customerAccountService.changePassword(user.customerId, dto);
  }

  /**
   * Enable two-factor authentication
   */
  @Post('2fa/enable')
  @Permissions('account:security')
  async enableTwoFactor(
    @CurrentUser() user: any,
    @Body() dto: TwoFactorEnableDto,
  ) {
    return this.customerAccountService.enableTwoFactor(user.customerId, dto);
  }

  /**
   * Verify and confirm two-factor authentication
   */
  @Post('2fa/verify')
  @Permissions('account:security')
  async verifyTwoFactor(
    @CurrentUser() user: any,
    @Body() dto: TwoFactorVerifyDto & { secret: string },
  ) {
    return this.customerAccountService.verifyTwoFactor(
      user.customerId,
      { code: dto.code },
      dto.secret,
    );
  }

  /**
   * Disable two-factor authentication
   */
  @Post('2fa/disable')
  @Permissions('account:security')
  async disableTwoFactor(
    @CurrentUser() user: any,
    @Body() dto: TwoFactorDisableDto,
  ) {
    return this.customerAccountService.disableTwoFactor(user.customerId, dto);
  }

  /**
   * Get customer's wishlist
   */
  @Get('wishlist')
  async getWishlist(@CurrentUser() user: any) {
    return this.customerAccountService.getWishlist(user.customerId);
  }

  /**
   * Add product to wishlist
   */
  @Post('wishlist/items')
  @Permissions('wishlist:write')
  async addToWishlist(
    @CurrentUser() user: any,
    @Body() body: { productId: string; productVariantId?: string },
  ) {
    return this.customerAccountService.addToWishlist(
      user.customerId,
      body.productId,
      body.productVariantId,
    );
  }

  /**
   * Remove product from wishlist
   */
  @Delete('wishlist/items/:productId')
  @Permissions('wishlist:delete')
  async removeFromWishlist(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    await this.customerAccountService.removeFromWishlist(
      user.customerId,
      productId,
    );
    return { message: 'Product removed from wishlist' };
  }

  /**
   * Check if product is in wishlist
   */
  @Get('wishlist/items/:productId')
  async isProductInWishlist(
    @CurrentUser() user: any,
    @Param('productId') productId: string,
  ) {
    const isInWishlist = await this.customerAccountService.isProductInWishlist(
      user.customerId,
      productId,
    );
    return { productId, isInWishlist };
  }

  /**
   * Get customer's order history
   */
  @Get('orders')
  async getOrderHistory(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = page ? parseInt(page) : 1;
    const limitNum = limit ? parseInt(limit) : 10;
    const startDateObj = startDate ? new Date(startDate) : undefined;
    const endDateObj = endDate ? new Date(endDate) : undefined;

    return this.customerAccountService.getOrderHistory(
      user.customerId,
      pageNum,
      limitNum,
      status,
      startDateObj,
      endDateObj,
    );
  }

  /**
   * Delete customer account
   */
  @Post('delete')
  @Permissions('account:delete')
  async deleteAccount(
    @CurrentUser() user: any,
    @Body() body: { password: string },
  ) {
    if (!body.password) {
      throw new BadRequestException('Password is required to delete account');
    }
    await this.customerAccountService.deleteAccount(user.customerId, body.password);
    return { message: 'Account deleted successfully' };
  }
}
