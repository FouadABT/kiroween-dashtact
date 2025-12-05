import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ActivityLogQueryDto } from './activity-log-query.dto';

describe('ActivityLogQueryDto', () => {
  it('should validate with default values', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {});

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(1);
    expect(dto.limit).toBe(50);
    expect(dto.sortOrder).toBe('desc');
  });

  it('should validate with all optional filters', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      userId: 'user123',
      entityType: 'Product',
      entityId: 'prod123',
      action: 'PRODUCT_CREATED',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      page: 2,
      limit: 25,
      sortOrder: 'asc',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should transform page to number', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      page: '3',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(3);
    expect(typeof dto.page).toBe('number');
  });

  it('should transform limit to number', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      limit: '10',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.limit).toBe(10);
    expect(typeof dto.limit).toBe('number');
  });

  it('should fail if page is less than 1', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      page: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should fail if page is negative', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      page: -1,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('page');
  });

  it('should fail if limit is less than 1', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      limit: 0,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail if limit exceeds 100', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      limit: 101,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('limit');
  });

  it('should fail if sortOrder is invalid', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      sortOrder: 'invalid',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('sortOrder');
  });

  it('should accept asc sortOrder', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      sortOrder: 'asc',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept desc sortOrder', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      sortOrder: 'desc',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if startDate is not a valid date string', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      startDate: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('startDate');
  });

  it('should fail if endDate is not a valid date string', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      endDate: 'invalid-date',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('endDate');
  });

  it('should accept ISO date strings', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should accept simple date strings', async () => {
    const dto = plainToInstance(ActivityLogQueryDto, {
      startDate: '2024-01-01',
      endDate: '2024-12-31',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
