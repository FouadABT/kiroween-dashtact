import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Permissions (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let createdPermissionId: string;
  let testRoleId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Create a test role for permission assignment tests
    const testRole = await prisma.userRole.create({
      data: {
        name: 'TEST_ROLE_PERMISSIONS',
        description: 'Test role for permissions e2e tests',
        isActive: true,
        isSystemRole: false,
      },
    });
    testRoleId = testRole.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (createdPermissionId) {
      await prisma.rolePermission.deleteMany({
        where: { permissionId: createdPermissionId },
      });
      await prisma.permission.delete({
        where: { id: createdPermissionId },
      }).catch(() => {});
    }

    if (testRoleId) {
      await prisma.rolePermission.deleteMany({
        where: { roleId: testRoleId },
      });
      await prisma.userRole.delete({
        where: { id: testRoleId },
      }).catch(() => {});
    }

    await app.close();
  });

  describe('POST /permissions', () => {
    it('should create a new permission with valid data', () => {
      return request(app.getHttpServer())
        .post('/permissions')
        .send({
          name: 'test:create',
          resource: 'test',
          action: 'create',
          description: 'Test permission for e2e',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe('test:create');
          expect(res.body.resource).toBe('test');
          expect(res.body.action).toBe('create');
          expect(res.body.description).toBe('Test permission for e2e');
          createdPermissionId = res.body.id;
        });
    });

    it('should fail to create permission with invalid name format', () => {
      return request(app.getHttpServer())
        .post('/permissions')
        .send({
          name: 'invalid-format',
          resource: 'test',
          action: 'read',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Permission name must follow format');
        });
    });

    it('should fail to create permission with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/permissions')
        .send({
          name: 'test:read',
        })
        .expect(400);
    });

    it('should fail to create duplicate permission', () => {
      return request(app.getHttpServer())
        .post('/permissions')
        .send({
          name: 'test:create',
          resource: 'test',
          action: 'create',
        })
        .expect(409);
    });

    it('should create permission with wildcard resource', () => {
      return request(app.getHttpServer())
        .post('/permissions')
        .send({
          name: '*:read',
          resource: '*',
          action: 'read',
          description: 'Read all resources',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('*:read');
          expect(res.body.resource).toBe('*');
        })
        .then((res) => {
          // Clean up
          return prisma.permission.delete({
            where: { id: res.body.id },
          });
        });
    });

    it('should create permission with wildcard action', () => {
      return request(app.getHttpServer())
        .post('/permissions')
        .send({
          name: 'test:*',
          resource: 'test',
          action: '*',
          description: 'All test actions',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.name).toBe('test:*');
          expect(res.body.action).toBe('*');
        })
        .then((res) => {
          // Clean up
          return prisma.permission.delete({
            where: { id: res.body.id },
          });
        });
    });
  });

  describe('GET /permissions', () => {
    it('should return all permissions', () => {
      return request(app.getHttpServer())
        .get('/permissions')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('resource');
          expect(res.body[0]).toHaveProperty('action');
        });
    });

    it('should return permissions filtered by resource', () => {
      return request(app.getHttpServer())
        .get('/permissions?resource=test')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((permission: any) => {
            expect(permission.resource).toBe('test');
          });
        });
    });
  });

  describe('GET /permissions/:id', () => {
    it('should return a permission by id', () => {
      return request(app.getHttpServer())
        .get(`/permissions/${createdPermissionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPermissionId);
          expect(res.body.name).toBe('test:create');
        });
    });

    it('should return 404 for non-existent permission', () => {
      return request(app.getHttpServer())
        .get('/permissions/nonexistent-id')
        .expect(404);
    });
  });

  describe('PATCH /permissions/:id', () => {
    it('should update a permission', () => {
      return request(app.getHttpServer())
        .patch(`/permissions/${createdPermissionId}`)
        .send({
          description: 'Updated test permission',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPermissionId);
          expect(res.body.description).toBe('Updated test permission');
        });
    });

    it('should update permission name', () => {
      return request(app.getHttpServer())
        .patch(`/permissions/${createdPermissionId}`)
        .send({
          name: 'test:update',
          resource: 'test',
          action: 'update',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toBe('test:update');
        });
    });

    it('should fail to update with invalid name format', () => {
      return request(app.getHttpServer())
        .patch(`/permissions/${createdPermissionId}`)
        .send({
          name: 'invalid format',
        })
        .expect(400);
    });

    it('should return 404 for non-existent permission', () => {
      return request(app.getHttpServer())
        .patch('/permissions/nonexistent-id')
        .send({
          description: 'Updated',
        })
        .expect(404);
    });
  });

  describe('POST /permissions/assign', () => {
    it('should assign a permission to a role', () => {
      return request(app.getHttpServer())
        .post('/permissions/assign')
        .send({
          roleId: testRoleId,
          permissionId: createdPermissionId,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Permission assigned successfully');
        });
    });

    it('should fail to assign non-existent permission', () => {
      return request(app.getHttpServer())
        .post('/permissions/assign')
        .send({
          roleId: testRoleId,
          permissionId: 'nonexistent-id',
        })
        .expect(404);
    });

    it('should fail to assign permission to non-existent role', () => {
      return request(app.getHttpServer())
        .post('/permissions/assign')
        .send({
          roleId: 'nonexistent-id',
          permissionId: createdPermissionId,
        })
        .expect(404);
    });

    it('should fail to assign duplicate permission to role', () => {
      return request(app.getHttpServer())
        .post('/permissions/assign')
        .send({
          roleId: testRoleId,
          permissionId: createdPermissionId,
        })
        .expect(409);
    });
  });

  describe('GET /permissions/role/:roleId', () => {
    it('should return all permissions for a role', () => {
      return request(app.getHttpServer())
        .get(`/permissions/role/${testRoleId}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('name');
        });
    });

    it('should return 404 for non-existent role', () => {
      return request(app.getHttpServer())
        .get('/permissions/role/nonexistent-id')
        .expect(404);
    });
  });

  describe('DELETE /permissions/assign', () => {
    it('should remove a permission from a role', () => {
      return request(app.getHttpServer())
        .delete('/permissions/assign')
        .send({
          roleId: testRoleId,
          permissionId: createdPermissionId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe('Permission removed successfully');
        });
    });

    it('should fail to remove non-existent assignment', () => {
      return request(app.getHttpServer())
        .delete('/permissions/assign')
        .send({
          roleId: testRoleId,
          permissionId: createdPermissionId,
        })
        .expect(404);
    });
  });

  describe('GET /permissions/user/:userId/check/:permission', () => {
    let testUserId: string;

    beforeAll(async () => {
      // Create a test user with the test role
      const testUser = await prisma.user.create({
        data: {
          email: 'permissions-test@example.com',
          name: 'Permissions Test User',
          password: 'hashedpassword',
          roleId: testRoleId,
          isActive: true,
        },
      });
      testUserId = testUser.id;

      // Assign permission back to role for this test
      await prisma.rolePermission.create({
        data: {
          roleId: testRoleId,
          permissionId: createdPermissionId,
        },
      });
    });

    afterAll(async () => {
      if (testUserId) {
        await prisma.user.delete({
          where: { id: testUserId },
        }).catch(() => {});
      }
    });

    it('should return true if user has permission', () => {
      return request(app.getHttpServer())
        .get(`/permissions/user/${testUserId}/check/test:update`)
        .expect(200)
        .expect((res) => {
          expect(res.body.hasPermission).toBe(true);
        });
    });

    it('should return false if user does not have permission', () => {
      return request(app.getHttpServer())
        .get(`/permissions/user/${testUserId}/check/posts:write`)
        .expect(200)
        .expect((res) => {
          expect(res.body.hasPermission).toBe(false);
        });
    });
  });

  describe('DELETE /permissions/:id', () => {
    it('should delete a permission', () => {
      return request(app.getHttpServer())
        .delete(`/permissions/${createdPermissionId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(createdPermissionId);
        })
        .then(() => {
          // Verify deletion
          return request(app.getHttpServer())
            .get(`/permissions/${createdPermissionId}`)
            .expect(404);
        });
    });

    it('should return 404 for non-existent permission', () => {
      return request(app.getHttpServer())
        .delete('/permissions/nonexistent-id')
        .expect(404);
    });
  });
});
