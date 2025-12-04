import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateActivityLogDto } from './create-activity-log.dto';

describe('CreateActivityLogDto', () => {
  it('should validate a valid DTO', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      userId: 'user123',
      actorName: 'John Doe',
      entityType: 'User',
      entityId: 'user123',
      metadata: { key: 'value' },
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should validate with only required fields', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('should fail if action is missing', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      userId: 'user123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('action');
  });

  it('should fail if action is empty string', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: '',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('action');
  });

  it('should fail if action exceeds max length', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'A'.repeat(201),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('action');
  });

  it('should fail if actorName exceeds max length', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      actorName: 'A'.repeat(201),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('actorName');
  });

  it('should fail if entityType exceeds max length', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      entityType: 'A'.repeat(101),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('entityType');
  });

  it('should fail if ipAddress exceeds max length', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      ipAddress: 'A'.repeat(46),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('ipAddress');
  });

  it('should fail if userAgent exceeds max length', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      userAgent: 'A'.repeat(501),
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('userAgent');
  });

  it('should fail if metadata is not an object', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      metadata: 'not an object',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('metadata');
  });

  it('should accept null optional fields', async () => {
    const dto = plainToInstance(CreateActivityLogDto, {
      action: 'USER_LOGIN',
      userId: null,
      actorName: null,
      entityType: null,
      entityId: null,
      metadata: null,
      ipAddress: null,
      userAgent: null,
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });
});
