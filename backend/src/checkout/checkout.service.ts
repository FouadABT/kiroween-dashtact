import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from '../orders/orders.service';
import { InventoryService } from '../inventory/inventory.service';
import { CustomersService } from '../customers/customers.service';
import { CheckoutDto, AddressDto } from './dto';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly ordersService: OrdersService,
    private readonly inventoryService: InventoryService,
    private readonly customersService: CustomersService,
  ) {}

  /**
   * Validate checkout data
   */
  async validateCheckout(dto: CheckoutDto): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate cart exists and has items
    const cart = await this.cartService.getOrCreateCart(dto.sessionId, dto.userId);
    if (!cart.items || cart.items.length === 0) {
      errors.push('Cart is empty');
    }

    // Validate inventory
    const inventoryValidation = await this.cartService.validateInventory(
      dto.sessionId,
      dto.userId,
    );
    if (!inventoryValidation.valid) {
      errors.push(...inventoryValidation.errors.map((e) => e.error));
    }

    // Validate shipping method
    const shippingMethod = await this.prisma.shippingMethod.findUnique({
      where: { id: dto.shippingMethodId },
    });
    if (!shippingMethod || !shippingMethod.isActive) {
      errors.push('Invalid shipping method');
    }

    // Validate payment method
    const paymentMethod = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.paymentMethodId },
    });
    if (!paymentMethod || !paymentMethod.isActive) {
      errors.push('Invalid payment method');
    }

    // Validate COD if selected
    if (paymentMethod && paymentMethod.type === 'COD') {
      const codValidation = await this.validateCOD(cart, dto.shippingAddress);
      if (!codValidation.valid) {
        errors.push(...codValidation.errors);
      }
    }

    // Validate addresses
    if (!this.validateAddress(dto.shippingAddress)) {
      errors.push('Invalid shipping address');
    }
    if (!dto.sameAsShipping && !this.validateAddress(dto.billingAddress)) {
      errors.push('Invalid billing address');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate shipping cost
   */
  async calculateShipping(
    cartId: string,
    shippingMethodId: string,
  ): Promise<{ shipping: string }> {
    const shippingMethod = await this.prisma.shippingMethod.findUnique({
      where: { id: shippingMethodId },
    });

    if (!shippingMethod) {
      throw new NotFoundException('Shipping method not found');
    }

    return {
      shipping: shippingMethod.price.toString(),
    };
  }

  /**
   * Calculate tax
   */
  async calculateTax(
    cartId: string,
    shippingAddress: AddressDto,
  ): Promise<{ tax: string }> {
    // Get cart
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Get tax rate from settings
    const settings = await this.prisma.ecommerceSettings.findFirst({
      where: { scope: 'global' },
    });

    const taxRate = settings?.taxRate || 0;

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.priceSnapshot) * item.quantity;
    }, 0);

    // Calculate tax
    const tax = (subtotal * Number(taxRate)) / 100;

    return {
      tax: tax.toFixed(2),
    };
  }

  /**
   * Calculate order totals
   */
  async calculateOrderTotals(
    cartId: string,
    shippingMethodId: string,
    shippingAddress: AddressDto,
    paymentMethodId?: string,
  ): Promise<{
    subtotal: string;
    tax: string;
    shipping: string;
    codFee?: string;
    total: string;
  }> {
    // Get cart
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: { items: true },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Calculate subtotal
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + Number(item.priceSnapshot) * item.quantity;
    }, 0);

    // Calculate shipping
    const shippingResult = await this.calculateShipping(cartId, shippingMethodId);
    const shipping = parseFloat(shippingResult.shipping);

    // Calculate tax
    const taxResult = await this.calculateTax(cartId, shippingAddress);
    const tax = parseFloat(taxResult.tax);

    // Calculate COD fee if applicable
    let codFee = 0;
    if (paymentMethodId) {
      const paymentMethod = await this.prisma.paymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      if (paymentMethod && paymentMethod.type === 'COD') {
        const settings = await this.prisma.ecommerceSettings.findFirst({
          where: { scope: 'global' },
        });
        codFee = settings?.codFee ? Number(settings.codFee) : 0;
      }
    }

    // Calculate total
    const total = subtotal + shipping + tax + codFee;

    const result: any = {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      shipping: shipping.toFixed(2),
      total: total.toFixed(2),
    };

    if (codFee > 0) {
      result.codFee = codFee.toFixed(2);
    }

    return result;
  }

  /**
   * Create order from cart
   */
  async createOrderFromCart(dto: CheckoutDto): Promise<any> {
    // Validate checkout
    const validation = await this.validateCheckout(dto);
    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join(', '));
    }

    // Get cart
    const cart = await this.cartService.getOrCreateCart(dto.sessionId, dto.userId);

    // Calculate totals
    const totals = await this.calculateOrderTotals(
      cart.id,
      dto.shippingMethodId,
      dto.shippingAddress,
      dto.paymentMethodId,
    );

    // Get or create customer
    let customer;
    if (dto.userId) {
      // Get customer from user account
      const account = await this.prisma.customerAccount.findUnique({
        where: { id: dto.userId },
        include: { customer: true },
      });
      customer = account?.customer;
    } else {
      // Create guest customer
      customer = await this.prisma.customer.create({
        data: {
          email: dto.customerEmail || dto.shippingAddress.firstName + '@guest.com',
          firstName: dto.shippingAddress.firstName,
          lastName: dto.shippingAddress.lastName,
          phone: dto.shippingAddress.phone,
          shippingAddress: dto.shippingAddress as any,
          billingAddress: (dto.sameAsShipping
            ? dto.shippingAddress
            : dto.billingAddress) as any,
        },
      });
    }

    if (!customer) {
      throw new BadRequestException('Could not create or find customer');
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Create order
    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        customerId: customer.id,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        fulfillmentStatus: FulfillmentStatus.UNFULFILLED,
        subtotal: totals.subtotal,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        shippingAddress: dto.shippingAddress as any,
        billingAddress: (dto.sameAsShipping
          ? dto.shippingAddress
          : dto.billingAddress) as any,
        shippingMethodId: dto.shippingMethodId,
        customerEmail: customer.email,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerPhone: customer.phone,
        customerNotes: dto.customerNotes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productVariantId: item.productVariantId,
            productName: item.product?.name || 'Unknown Product',
            variantName: item.productVariant?.name,
            sku: item.productVariant?.id || item.product?.id,
            quantity: item.quantity,
            unitPrice: item.priceSnapshot,
            totalPrice: Number(item.priceSnapshot) * item.quantity,
          })),
        },
      },
      include: {
        items: true,
        customer: true,
      },
    });

    // Reserve inventory
    for (const item of cart.items) {
      if (item.productVariantId) {
        await this.inventoryService.reserveStock({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        });
      }
    }

    // Clear cart
    await this.cartService.clearCart(cart.id);

    // Create order status history
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        toStatus: OrderStatus.PENDING,
        notes: 'Order created',
      },
    });

    return order;
  }

  /**
   * Get available payment methods
   */
  async getPaymentMethods(): Promise<any[]> {
    const methods = await this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });

    // Map to include available flag and extract configuration fields
    return methods.map((method) => {
      const config = method.configuration as any || {};
      
      return {
        id: method.id,
        name: method.name,
        type: method.type,
        description: method.description,
        available: method.isActive, // Active methods are available
        fee: config.fee || 0,
        minOrderAmount: config.minOrderAmount || 0,
        maxOrderAmount: config.maxOrderAmount || null,
      };
    });
  }

  /**
   * Get available shipping methods
   */
  async getShippingMethods(): Promise<any[]> {
    const methods = await this.prisma.shippingMethod.findMany({
      where: { isActive: true },
    });

    // Map to include available flag
    return methods.map((method) => ({
      id: method.id,
      name: method.name,
      description: method.description,
      price: method.price.toString(),
      available: method.isActive, // Active methods are available
      estimatedDays: this.extractEstimatedDays(method.description),
    }));
  }

  /**
   * Extract estimated days from description (e.g., "5-7 days" -> 7)
   */
  private extractEstimatedDays(description: string | null): number | undefined {
    if (!description) return undefined;
    
    const match = description.match(/(\d+)(?:-(\d+))?\s*days?/i);
    if (match) {
      // Return the higher number if range (e.g., "5-7 days" -> 7)
      return match[2] ? parseInt(match[2]) : parseInt(match[1]);
    }
    
    return undefined;
  }

  /**
   * Validate COD payment method
   */
  private async validateCOD(
    cart: any,
    shippingAddress: AddressDto,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Get COD settings
    const settings = await this.prisma.ecommerceSettings.findFirst({
      where: { scope: 'global' },
    });

    if (!settings) {
      errors.push('E-commerce settings not found');
      return { valid: false, errors };
    }

    // Check if COD is enabled
    if (!settings.codEnabled) {
      errors.push('Cash on Delivery is not available');
    }

    // Calculate cart total
    const subtotal = parseFloat(cart.subtotal);

    // Check minimum order amount
    if (
      settings.codMinOrderAmount &&
      subtotal < Number(settings.codMinOrderAmount)
    ) {
      errors.push(
        `Minimum order amount for COD is ${settings.currencySymbol}${settings.codMinOrderAmount}`,
      );
    }

    // Check maximum order amount
    if (
      settings.codMaxOrderAmount &&
      subtotal > Number(settings.codMaxOrderAmount)
    ) {
      errors.push(
        `Maximum order amount for COD is ${settings.currencySymbol}${settings.codMaxOrderAmount}`,
      );
    }

    // Check country restrictions
    if (
      settings.codAvailableCountries &&
      settings.codAvailableCountries.length > 0
    ) {
      if (!settings.codAvailableCountries.includes(shippingAddress.country)) {
        errors.push('Cash on Delivery is not available in your country');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate address
   */
  private validateAddress(address: AddressDto): boolean {
    return !!(
      address.firstName &&
      address.lastName &&
      address.address1 &&
      address.city &&
      address.state &&
      address.postalCode &&
      address.country &&
      address.phone
    );
  }

  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const settings = await this.prisma.ecommerceSettings.findFirst({
      where: { scope: 'global' },
    });

    const prefix = settings?.orderNumberPrefix || 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');

    return `${prefix}-${timestamp}-${random}`;
  }
}
