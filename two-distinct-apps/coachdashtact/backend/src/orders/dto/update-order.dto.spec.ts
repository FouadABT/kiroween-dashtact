import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateOrderDto } from './update-order.dto';
import { OrderStatus, PaymentStatus, FulfillmentStatus } from '@prisma/client';

describe('UpdateOrderDto', () => {
  it('should validate with status update', async () => {
    const dto = plainToClass(UpdateOrderDto, {
      status: OrderStatus.PROCESSING,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with payment status update', async () => {
    const dto = plainToClass(UpdateOrderDto, {
      paymentStatus: PaymentStatus.PAID,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with fulfillment status update', async () => {
    const dto = plainToClass(UpdateOrderDto, {
      fulfillmentStatus: FulfillmentStatus.FULFILLED,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with tracking number', async () => {
    const dto = plainToClass(UpdateOrderDto, {
      trackingNumber: 'TRACK123456',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with internal notes', async () => {
    const dto = plainToClass(UpdateOrderDto, {
      internalNotes: 'Customer requested expedited shipping',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with shipping method ID', async () => {
    const dto = plainToClass(UpdateOrderDto, {
      shippingMethodId: 'ship-123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate with 