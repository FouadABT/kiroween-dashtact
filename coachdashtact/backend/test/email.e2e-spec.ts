import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Email System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let superAdminUser: any;
  let configId: string;
  let templateId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);

    // Create super admin user for testing
    const superAdminRole = await prisma.userRole.findUnique({
      where: { name: 'Super Admin' },
    });

    superAdminUser = await prisma.user.create({
      data: {
        email: 'superadmin-email-test@example.com',
        name: 'Super Admin Email Test',
        password: 'hashedpassword',
        roleId: superAdminRole!.id,
      },
    });

    // Mock auth token (in real app, this would come from login)
    authToken = 'mock-super-admin-token';
  });

  afterAll(async () => {
    // Cleanup
    if (configId) {
      await prisma.emailConfiguration.deleteMany({
        where: { id: configId },
      });
    }
    if (templateId) {
      await prisma.emailTemplate.deleteMany({
        where: { id: templateId },
      });
    }
    await prisma.user.delete({
      where: { id: superAdminUser.id },
    });
    await app.close();
  });

  describe('/email/configuration (POST)', () => {
    it('should save email configuration', () => {
      return request(app.getHttpServer())
        .post('/email/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp.test.com',
          smtpPort: 587,
          smtpSecure: true,
          smtpUsername: 'test@test.com',
          smtpPassword: 'testpassword',
          senderEmail: 'noreply@test.com',
          senderName: 'Test App',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.smtpHost).toBe('smtp.test.com');
          expect(res.body.data.smtpPassword).not.toBe('testpassword'); // Should be encrypted
          configId = res.body.data.id;
        });
    });

    it('should reject invalid configuration', () => {
      return request(app.getHttpServer())
        .post('/email/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp.test.com',
          // Missing required fields
        })
        .expect(400);
    });

    it('should save configuration with empty password (Brevo)', () => {
      return request(app.getHttpServer())
        .post('/email/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp-relay.brevo.com',
          smtpPort: 587,
          smtpSecure: false,
          smtpUsername: 'xsmtpsib-full-key-here',
          smtpPassword: '', // Empty password for Brevo
          senderEmail: 'noreply@test.com',
          senderName: 'Test App',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.smtpHost).toBe('smtp-relay.brevo.com');
          expect(res.body.data.smtpSecure).toBe(false);
        });
    });

    it('should update configuration without changing password', async () => {
      // First create a configuration
      const createRes = await request(app.getHttpServer())
        .post('/email/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp.test.com',
          smtpPort: 587,
          smtpSecure: true,
          smtpUsername: 'test@test.com',
          smtpPassword: 'original-password',
          senderEmail: 'noreply@test.com',
          senderName: 'Test App',
        });

      const configId = createRes.body.data.id;

      // Update without password field
      return request(app.getHttpServer())
        .post('/email/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp.updated.com',
          smtpPort: 465,
          smtpSecure: true,
          smtpUsername: 'updated@test.com',
          // No smtpPassword - should keep existing
          senderEmail: 'noreply@updated.com',
          senderName: 'Updated App',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data.smtpHost).toBe('smtp.updated.com');
          expect(res.body.data.smtpPassword).not.toBe('original-password'); // Should be encrypted
        });
    });
  });

  describe('/email/configuration (GET)', () => {
    it('should get email configuration', () => {
      return request(app.getHttpServer())
        .get('/email/configuration')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.smtpPassword).toBe('********'); // Should be masked
        });
    });
  });

  describe('/email/configuration/toggle (PATCH)', () => {
    it('should enable email system', () => {
      return request(app.getHttpServer())
        .patch('/email/configuration/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isEnabled: true })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.isEnabled).toBe(true);
        });
    });

    it('should disable email system', () => {
      return request(app.getHttpServer())
        .patch('/email/configuration/toggle')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ isEnabled: false })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.isEnabled).toBe(false);
        });
    });
  });

  describe('/email/templates (POST)', () => {
    it('should create email template', () => {
      return request(app.getHttpServer())
        .post('/email/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Template',
          slug: 'test-template-e2e',
          subject: 'Test Subject {{name}}',
          htmlBody: '<p>Hello {{name}}</p>',
          textBody: 'Hello {{name}}',
          variables: ['name'],
          category: 'SYSTEM',
          isActive: true,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.name).toBe('Test Template');
          expect(res.body.data.slug).toBe('test-template-e2e');
          templateId = res.body.data.id;
        });
    });

    it('should reject duplicate slug', () => {
      return request(app.getHttpServer())
        .post('/email/templates')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Template',
          slug: 'test-template-e2e', // Duplicate
          subject: 'Subject',
          htmlBody: '<p>Body</p>',
          textBody: 'Body',
          variables: [],
          category: 'SYSTEM',
        })
        .expect(400);
    });
  });

  describe('/email/templates (GET)', () => {
    it('should get all templates with pagination', () => {
      return request(app.getHttpServer())
        .get('/email/templates?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(res.body).toHaveProperty('page');
          expect(res.body).toHaveProperty('limit');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
  });

  describe('/email/templates/:id (GET)', () => {
    it('should get template by id', () => {
      return request(app.getHttpServer())
        .get(`/email/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.id).toBe(templateId);
          expect(res.body.data.name).toBe('Test Template');
        });
    });

    it('should return 404 for non-existent template', () => {
      return request(app.getHttpServer())
        .get('/email/templates/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/email/templates/:id (PUT)', () => {
    it('should update template', () => {
      return request(app.getHttpServer())
        .put(`/email/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Test Template',
          subject: 'Updated Subject',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.name).toBe('Updated Test Template');
          expect(res.body.data.subject).toBe('Updated Subject');
        });
    });
  });

  describe('/email/templates/:id (DELETE)', () => {
    it('should delete template', () => {
      return request(app.getHttpServer())
        .delete(`/email/templates/${templateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toContain('deleted');
        });
    });

    it('should return 404 when deleting non-existent template', () => {
      return request(app.getHttpServer())
        .delete('/email/templates/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/email/logs (GET)', () => {
    it('should get email logs with filters', () => {
      return request(app.getHttpServer())
        .get('/email/logs?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('should filter logs by status', () => {
      return request(app.getHttpServer())
        .get('/email/logs?status=SENT')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('/email/logs/stats (GET)', () => {
    it('should get email statistics', () => {
      return request(app.getHttpServer())
        .get('/email/logs/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('totalSent');
          expect(res.body.data).toHaveProperty('totalFailed');
          expect(res.body.data).toHaveProperty('totalQueued');
          expect(res.body.data).toHaveProperty('failureRate');
        });
    });
  });
});
