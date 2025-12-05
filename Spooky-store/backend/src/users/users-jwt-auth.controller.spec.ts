import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController - JWT Authentication Fields', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    toggleStatus: jest.fn(),
    getRoles: jest.fn(),
  };

  const mockRole = {
    id: 'role-1',
    name: 'USER',
    description: 'Standard user',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);

    jest.clearAllMocks();
  });

  describe('POST /users - Create with JWT Auth Fields', () => {
    it('should create user with default JWT auth values', async () => {
      const createDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const expectedUser = {
        id: 'user-1',
        email: createDto.email,
        name: createDto.name,
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'local',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createDto);

      expect(result.data.emailVerified).toBe(false);
      expect(result.data.authProvider).toBe('local');
      expect(result.data.twoFactorEnabled).toBe(false);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should create user with custom emailVerified', async () => {
      const createDto = {
        email: 'verified@example.com',
        password: 'password123',
        emailVerified: true,
      };

      const expectedUser = {
        id: 'user-2',
        email: createDto.email,
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'local',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createDto);

      expect(result.data.emailVerified).toBe(true);
    });

    it('should create user with OAuth provider', async () => {
      const createDto = {
        email: 'google@example.com',
        password: 'password123',
        authProvider: 'google',
        emailVerified: true,
      };

      const expectedUser = {
        id: 'user-3',
        email: createDto.email,
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'google',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createDto);

      expect(result.data.authProvider).toBe('google');
      expect(result.data.emailVerified).toBe(true);
    });

    it('should create user with 2FA enabled', async () => {
      const createDto = {
        email: '2fa@example.com',
        password: 'password123',
        twoFactorEnabled: true,
      };

      const expectedUser = {
        id: 'user-4',
        email: createDto.email,
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'local',
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createDto);

      expect(result.data.twoFactorEnabled).toBe(true);
    });
  });

  describe('PATCH /users/:id - Update JWT Auth Fields', () => {
    it('should update emailVerified status', async () => {
      const updateDto = { emailVerified: true };
      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'local',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update('user-1', updateDto);

      expect(result.data.emailVerified).toBe(true);
      expect(service.update).toHaveBeenCalledWith('user-1', updateDto);
    });

    it('should update authProvider', async () => {
      const updateDto = { authProvider: 'github' };
      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'github',
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update('user-1', updateDto);

      expect(result.data.authProvider).toBe('github');
    });

    it('should enable two-factor authentication', async () => {
      const updateDto = { twoFactorEnabled: true };
      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: false,
        authProvider: 'local',
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update('user-1', updateDto);

      expect(result.data.twoFactorEnabled).toBe(true);
    });

    it('should update multiple JWT auth fields', async () => {
      const updateDto = {
        emailVerified: true,
        authProvider: 'google',
        twoFactorEnabled: true,
      };
      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'google',
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update('user-1', updateDto);

      expect(result.data.emailVerified).toBe(true);
      expect(result.data.authProvider).toBe('google');
      expect(result.data.twoFactorEnabled).toBe(true);
    });
  });

  describe('GET /users - List with JWT Auth Fields', () => {
    it('should return users with JWT auth fields', async () => {
      const expectedResponse = {
        users: [
          {
            id: 'user-1',
            email: 'user1@example.com',
            roleId: 'role-1',
            role: mockRole,
            isActive: true,
            emailVerified: true,
            authProvider: 'local',
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'user-2',
            email: 'user2@example.com',
            roleId: 'role-1',
            role: mockRole,
            isActive: true,
            emailVerified: false,
            authProvider: 'google',
            twoFactorEnabled: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(expectedResponse);

      const result = await controller.findAll({});

      expect(result.data.users).toHaveLength(2);
      expect(result.data.users[0].emailVerified).toBe(true);
      expect(result.data.users[0].authProvider).toBe('local');
      expect(result.data.users[1].twoFactorEnabled).toBe(true);
    });
  });

  describe('GET /users/:id - Get with JWT Auth Fields', () => {
    it('should return user with JWT auth fields', async () => {
      const expectedUser = {
        id: 'user-1',
        email: 'test@example.com',
        roleId: 'role-1',
        role: mockRole,
        isActive: true,
        emailVerified: true,
        authProvider: 'github',
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne('user-1');

      expect(result.data.emailVerified).toBe(true);
      expect(result.data.authProvider).toBe('github');
      expect(result.data.twoFactorEnabled).toBe(true);
    });
  });
});
