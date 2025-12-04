import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateOrderDto, OrderItemDto, AddressDto } from './create-order.dto';

describe('CreateOrderDto', () => {
  describe('OrderItemDto', () => {
    it('should validate a valid order item', async () => {
      const dto = plainToClass(OrderItemDto, {
        productId: 'prod-123',
        quantity: 2,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate order item with variant', async () => {
      const dto = plainToClass(OrderItemDto, {
        productId: 'prod-123',
        productVariantId: 'var-456',
        quantity: 1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when productId is missing', async () => {
      const dto = plainToClass(OrderItemDto, {
        quantity: 2,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('productId');
    });

    it('should fail validation when quantity is less than 1', async () => {
      const dto = plainToClass(OrderItemDto, {
        productId: 'prod-123',
        quantity: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('quantity');
    });

    it('should fail validation when quantity is negative', async () => {
      const dto = plainToClass(OrderItemDto, {
        productId: 'prod-123',
        quantity: -1,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('AddressDto', () => {
    it('should validate a valid address', async () => {
      const dto = plainToClass(AddressDto, {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate address with apartment', async () => {
      const dto = plainToClass(AddressDto, {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        apartment: 'Apt 4B',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when required fields are missing', async () => {
      const dto = plainToClass(AddressDto, {
        street: '123 Main St',
        city: 'New York',
        // Missing state, postalCode, country
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when street is empty', async () => {
      const dto = plainToClass(AddressDto, {
        street: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('street');
    });
  });

  describe('CreateOrderDto', () => {
    const validAddress = {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
    };

    const validItem = {
      productId: 'prod-123',
      quantity: 2,
    };

    it('should validate a valid order', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should validate order with optional fields', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        customerPhone: '+1234567890',
        shippingMethodId: 'ship-123',
        tax: 10.50,
        shipping: 5.99,
        discount: 2.00,
        customerNotes: 'Please deliver after 5pm',
        internalNotes: 'VIP customer',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when customerId is missing', async () => {
      const dto = plainToClass(CreateOrderDto, {
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const customerIdError = errors.find(e => e.property === 'customerId');
      expect(customerIdError).toBeDefined();
    });

    it('should fail validation when items array is empty', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation when customerEmail is invalid', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'invalid-email',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const emailError = errors.find(e => e.property === 'customerEmail');
      expect(emailError).toBeDefined();
    });

    it('should fail validation when tax is negative', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        tax: -5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const taxError = errors.find(e => e.property === 'tax');
      expect(taxError).toBeDefined();
    });

    it('should fail validation when shipping is negative', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        shipping: -10,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const shippingError = errors.find(e => e.property === 'shipping');
      expect(shippingError).toBeDefined();
    });

    it('should fail validation when discount is negative', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
        discount: -2,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      const discountError = errors.find(e => e.property === 'discount');
      expect(discountError).toBeDefined();
    });

    it('should validate nested order items', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1, productVariantId: 'var-1' },
        ],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation when nested item is invalid', async () => {
      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [
          { productId: 'prod-1', quantity: 0 }, // Invalid quantity
        ],
        shippingAddress: validAddress,
        billingAddress: validAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should validate different shipping and billing addresses', async () => {
      const shippingAddress = {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
      };

      const billingAddress = {
        street: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postalCode: '90001',
        country: 'USA',
      };

      const dto = plainToClass(CreateOrderDto, {
        customerId: 'cust-123',
        items: [validItem],
        shippingAddress,
        billingAddress,
        customerEmail: 'customer@example.com',
        customerName: 'John Doe',
      });

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});
