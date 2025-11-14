import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { promises as fs } from 'fs';
import { join } from 'path';

describe('Uploads - File Upload (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

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
      })
    );
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Clean up uploaded test files
    try {
      const imagesDir = join(process.cwd(), 'uploads/images');
      const documentsDir = join(process.cwd(), 'uploads/documents');

      const imageFiles = await fs.readdir(imagesDir).catch(() => []);
      const documentFiles = await fs.readdir(documentsDir).catch(() => []);

      for (const file of imageFiles) {
        if (file.startsWith('test-')) {
          await fs.unlink(join(imagesDir, file)).catch(() => {});
        }
      }

      for (const file of documentFiles) {
        if (file.startsWith('test-')) {
          await fs.unlink(join(documentsDir, file)).catch(() => {});
        }
      }
    } catch (error) {
      // Ignore cleanup errors
    }

    await app.close();
  });

  describe('POST /uploads', () => {
    it('should upload an image file successfully', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .field('description', 'Test image upload')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('filename');
          expect(res.body).toHaveProperty('originalName', 'test-image.jpg');
          expect(res.body).toHaveProperty('mimetype', 'image/jpeg');
          expect(res.body).toHaveProperty('size');
          expect(res.body).toHaveProperty('url');
          expect(res.body).toHaveProperty('uploadedAt');
          expect(res.body.url).toContain('/uploads/images/');
        });
    });

    it('should upload a document file successfully', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'document')
        .attach('file', Buffer.from('fake-pdf-data'), {
          filename: 'test-document.pdf',
          contentType: 'application/pdf',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('filename');
          expect(res.body).toHaveProperty('originalName', 'test-document.pdf');
          expect(res.body).toHaveProperty('mimetype', 'application/pdf');
          expect(res.body.url).toContain('/uploads/documents/');
        });
    });

    it('should reject upload without authentication', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .field('type', 'image')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(401);
    });

    it('should reject upload without file', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('No file provided');
        });
    });

    it('should reject upload without type field', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400);
    });

    it('should reject upload with invalid type', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'invalid-type')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400);
    });

    it('should reject image file that is too large', () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .attach('file', largeBuffer, {
          filename: 'large-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('File size exceeds maximum');
        });
    });

    it('should reject document file that is too large', () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB

      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'document')
        .attach('file', largeBuffer, {
          filename: 'large-document.pdf',
          contentType: 'application/pdf',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('File size exceeds maximum');
        });
    });

    it('should reject invalid MIME type for images', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .attach('file', Buffer.from('fake-pdf-data'), {
          filename: 'document.pdf',
          contentType: 'application/pdf',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('File type');
          expect(res.body.message).toContain('is not allowed');
        });
    });

    it('should reject invalid MIME type for documents', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'document')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('File type');
          expect(res.body.message).toContain('is not allowed');
        });
    });

    it('should accept PNG images', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .attach('file', Buffer.from('fake-png-data'), {
          filename: 'test-image.png',
          contentType: 'image/png',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.mimetype).toBe('image/png');
        });
    });

    it('should accept GIF images', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .attach('file', Buffer.from('fake-gif-data'), {
          filename: 'test-image.gif',
          contentType: 'image/gif',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.mimetype).toBe('image/gif');
        });
    });

    it('should accept WebP images', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .attach('file', Buffer.from('fake-webp-data'), {
          filename: 'test-image.webp',
          contentType: 'image/webp',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.mimetype).toBe('image/webp');
        });
    });

    it('should accept Word documents', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'document')
        .attach('file', Buffer.from('fake-doc-data'), {
          filename: 'test-document.doc',
          contentType: 'application/msword',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.mimetype).toBe('application/msword');
        });
    });

    it('should accept DOCX documents', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'document')
        .attach('file', Buffer.from('fake-docx-data'), {
          filename: 'test-document.docx',
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.mimetype).toBe(
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          );
        });
    });

    it('should handle optional description field', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .field('description', 'User profile picture')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);
    });

    it('should work without description field', () => {
      return request(app.getHttpServer())
        .post('/uploads')
        .set('Authorization', `Bearer ${authToken}`)
        .field('type', 'image')
        .attach('file', Buffer.from('fake-image-data'), {
          filename: 'test-image.jpg',
          contentType: 'image/jpeg',
        })
        .expect(201);
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const filenames = new Set<string>();

      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/uploads')
          .set('Authorization', `Bearer ${authToken}`)
          .field('type', 'image')
          .attach('file', Buffer.from(`fake-image-data-${i}`), {
            filename: 'test-image.jpg',
            contentType: 'image/jpeg',
          })
          .expect(201);

        filenames.add(response.body.filename);
      }

      expect(filenames.size).toBe(5); // All filenames should be unique
    });
  });
});
