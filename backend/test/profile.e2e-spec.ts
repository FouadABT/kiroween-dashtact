import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

describe('Profile (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testUser: any;

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

    // Create test user and get auth token
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `profile-test-${Date.now()}@example.com`,
        password: 'Password123',
        name: 'Profile Test User',
      });

    authToken = registerResponse.body.accessToken;
    testUser = registerResponse.body.user;
  });

  afterAll(async () => {
    // Clean up test user
    if (testUser) {
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    await app.close();
  });

  describe('GET /profile', () => {
    it('should require authentication', () => {
      return request(app.getHttpServer()).get('/profile').expect(401);
    });

    it('should return user profile with all fields', () => {
      return request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('email');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('avatarUrl');
          expect(res.body).toHaveProperty('bio');
          expect(res.body).toHaveProperty('phone');
          expect(res.body).toHaveProperty('location');
          expect(res.body).toHaveProperty('website');
          expect(res.body).toHaveProperty('role');
          expect(res.body).toHaveProperty('emailVerified');
          expect(res.body).toHaveProperty('twoFactorEnabled');
          expect(res.body).toHaveProperty('lastPasswordChange');
          expect(res.body).toHaveProperty('createdAt');
          expect(res.body).toHaveProperty('updatedAt');
        });
    });
  });

  describe('PATCH /profile', () => {
    it('should update profile with new fields', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'This is my updated bio',
        phone: '+1234567890',
        location: 'New York, NY',
        website: 'https://example.com',
      };

      const response = await request(app.getHttpServer())
        .patch('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.bio).toBe(updateData.bio);
      expect(response.body.phone).toBe(updateData.phone);
      expect(response.body.location).toBe(updateData.location);
      expect(response.body.website).toBe(updateData.website);
    });

    it('should validate bio length', async () => {
      const updateData = {
        bio: 'a'.repeat(501), // Exceeds 500 character limit
      };

      return request(app.getHttpServer())
        .patch('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should validate website URL format', async () => {
      const updateData = {
        website: 'not-a-valid-url',
      };

      return request(app.getHttpServer())
        .patch('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);
    });

    it('should update email if not in use', async () => {
      const newEmail = `updated-${Date.now()}@example.com`;

      const response = await request(app.getHttpServer())
        .patch('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: newEmail })
        .expect(200);

      expect(response.body.email).toBe(newEmail);
    });
  });

  describe('POST /profile/avatar', () => {
    const testImagePath = path.join(__dirname, 'test-avatar.png');

    beforeAll(() => {
      // Create a minimal test image if it doesn't exist
      if (!fs.existsSync(testImagePath)) {
        const pngBuffer = Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          'base64',
        );
        fs.writeFileSync(testImagePath, pngBuffer);
      }
    });

    afterAll(() => {
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('should upload avatar successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testImagePath)
        .expect(200);

      expect(response.body).toHaveProperty('avatarUrl');
      expect(response.body.avatarUrl).toBeTruthy();
    });

    it('should reject invalid file type', async () => {
      const textFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(textFilePath, 'This is not an image');

      await request(app.getHttpServer())
        .post('/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', textFilePath)
        .expect(400);

      fs.unlinkSync(textFilePath);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/profile/avatar')
        .attach('file', testImagePath)
        .expect(401);
    });
  });

  describe('DELETE /profile/avatar', () => {
    it('should delete avatar successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete('/profile/avatar')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.avatarUrl).toBeNull();
    });

    it('should require authentication', () => {
      return request(app.getHttpServer()).delete('/profile/avatar').expect(401);
    });
  });

  describe('POST /profile/password', () => {
    it('should change password successfully', async () => {
      const changePasswordData = {
        currentPassword: 'Password123',
        newPassword: 'NewPassword456',
        confirmPassword: 'NewPassword456',
      };

      const response = await request(app.getHttpServer())
        .post('/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(200);

      expect(response.body.message).toContain('Password changed successfully');

      // Verify lastPasswordChange was updated
      const profile = await request(app.getHttpServer())
        .get('/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(profile.body.lastPasswordChange).toBeTruthy();
    });

    it('should reject if passwords do not match', async () => {
      const changePasswordData = {
        currentPassword: 'NewPassword456',
        newPassword: 'AnotherPassword789',
        confirmPassword: 'DifferentPassword',
      };

      return request(app.getHttpServer())
        .post('/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(400);
    });

    it('should reject if current password is incorrect', async () => {
      const changePasswordData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword789',
        confirmPassword: 'NewPassword789',
      };

      return request(app.getHttpServer())
        .post('/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send(changePasswordData)
        .expect(401);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/profile/password')
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456',
          confirmPassword: 'NewPassword456',
        })
        .expect(401);
    });
  });
});
