import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { CreateMenuDto, PageType } from './create-menu.dto';

describe('CreateMenuDto', () => {
  it('should validate a valid menu DTO', async () => {
    const dto = plainToClass(CreateMenuDto, {
      key: 'test-menu',
      label: 'Test Menu',
      icon: 'Home',
      route: '/test',
      order: 1,
      pageType: PageType.WIDGET_BASED,
      pageIdentifier: 'test-page',
      isActive: true,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when required fields are missing', async () => {
    const dto = plainToClass(CreateMenuDto, {
      label: 'Test Menu',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'key')).toBe(true);
    expect(errors.some((e) => e.property === 'icon')).toBe(true);
    expect(errors.some((e) => e.property === 'route')).toBe(true);
  });

  it('should fail validation when order is negative', async () => {
    const dto = plainToClass(CreateMenuDto, {
      key: 'test-menu',
      label: 'Test Menu',
      icon: 'Home',
      route: '/test',
      order: -1,
      pageType: PageType.WIDGET_BASED,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'order')).toBe(true);
  });

  it('should fail validation when pageType is invalid', async () => {
    const dto = plainToClass(CreateMenuDto, {
      key: 'test-menu',
      label: 'Test Menu',
      icon: 'Home',
      route: '/test',
      order: 1,
      pageType: 'INVALID_TYPE',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'pageType')).toBe(true);
  });

  it('should validate optional fields', async () => {
    const dto = plainToClass(CreateMenuDto, {
      key: 'test-menu',
      label: 'Test Menu',
      icon: 'Home',
      route: '/test',
      order: 1,
      pageType: PageType.HARDCODED,
      componentPath: '/components/Test',
      requiredPermissions: ['test:read'],
      requiredRoles: ['Admin'],
      featureFlag: 'test_feature',
      description: 'Test description',
      badge: 'New',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation when string exceeds max length', async () => {
    const dto = plainToClass(CreateMenuDto, {
      key: 'a'.repeat(101), // Max is 100
      label: 'Test Menu',
      icon: 'Home',
      route: '/test',
      order: 1,
      pageType: PageType.WIDGET_BASED,
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'key')).toBe(true);
  });

  it('should validate arrays correctly', async () => {
    const dto = plainToClass(CreateMenuDto, {
      key: 'test-menu',
      label: 'Test Menu',
      icon: 'Home',
      route: '/test',
      order: 1,
      pageType: PageType.WIDGET_BASED,
      requiredPermissions: ['perm1', 'perm2'],
      requiredRoles: ['role1', 'role2'],
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
