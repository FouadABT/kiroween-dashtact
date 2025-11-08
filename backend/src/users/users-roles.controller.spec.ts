import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { HttpStatus } from '@nestjs/common';

describe('UsersController - Roles Endpoint', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getRoles: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    hardDelete: jest.fn(),
    toggleStatus: jest.fn(),
  };

  const mockRoles = [
    {
      id: 'cldefault_user',
      name: 'USER',
      description: 'Standard user with basic permissions',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cldefault_admin',
      name: 'ADMIN',
      description: 'Administrator with full system access',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cldefault_moderator',
      name: 'MODERATOR',
      description: 'Moderator with elevated permissions',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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

  describe('GET /users/roles', () => {
    it('should return all available roles', async () => {
      mockUsersService.getRoles.mockResolvedValue(mockRoles);

      const result = await controller.getRoles();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Roles retrieved successfully',
        data: mockRoles,
      });
      expect(mockUsersService.getRoles).toHaveBeenCalled();
    });

    it('should return empty array if no roles exist', async () => {
      mockUsersService.getRoles.mockResolvedValue([]);

      const result = await controller.getRoles();

      expect(result.data).toEqual([]);
      expect(result.statusCode).toBe(HttpStatus.OK);
    });

    it('should handle service errors', async () => {
      mockUsersService.getRoles.mockRejectedValue(new Error('Database error'));

      await expect(controller.getRoles()).rejects.toThrow('Database error');
    });
  });

  describe('POST /users - with roleId', () => {
    it('should create user with specified roleId', async () => {
      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
        roleId: 'cldefault_admin',
      };

      const mockCreatedUser = {
        id: 'user123',
        email: createDto.email,
        name: createDto.name,
        roleId: 'cldefault_admin',
        role: mockRoles[1], // ADMIN role
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createDto);

      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.data.role.name).toBe('ADMIN');
      expect(mockUsersService.create).toHaveBeenCalledWith(createDto);
    });

    it('should create user with default role if roleId not provided', async () => {
      const createDto = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'password123',
      };

      const mockCreatedUser = {
        id: 'user123',
        email: createDto.email,
        name: createDto.name,
        roleId: 'cldefault_user',
        role: mockRoles[0], // USER role
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(mockCreatedUser);

      const result = await controller.create(createDto);

      expect(result.data.role.name).toBe('USER');
    });
  });

  describe('GET /users - with role filtering', () => {
    it('should filter users by roleId', async () => {
      const query = {
        roleId: 'cldefault_admin',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        users: [
          {
            id: 'user123',
            email: 'admin@example.com',
            name: 'Admin User',
            roleId: 'cldefault_admin',
            role: mockRoles[1],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result.data.users).toHaveLength(1);
      expect(result.data.users[0].role.name).toBe('ADMIN');
      expect(mockUsersService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter users by roleName', async () => {
      const query = {
        roleName: 'MODERATOR',
        page: 1,
        limit: 10,
      };

      const mockResponse = {
        users: [
          {
            id: 'user456',
            email: 'mod@example.com',
            name: 'Moderator User',
            roleId: 'cldefault_moderator',
            role: mockRoles[2],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUsersService.findAll.mockResolvedValue(mockResponse);

      const result = await controller.findAll(query);

      expect(result.data.users[0].role.name).toBe('MODERATOR');
    });
  });

  describe('PATCH /users/:id - with roleId update', () => {
    it('should update user role', async () => {
      const updateDto = {
        roleId: 'cldefault_admin',
      };

      const mockUpdatedUser = {
        id: 'user123',
        email: 'user@example.com',
        name: 'Test User',
        roleId: 'cldefault_admin',
        role: mockRoles[1], // ADMIN role
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.update.mockResolvedValue(mockUpdatedUser);

      const result = await controller.update('user123', updateDto);

      expect(result.data.role.name).toBe('ADMIN');
      expect(mockUsersService.update).toHaveBeenCalledWith(
        'user123',
        updateDto,
      );
    });
  });
});
