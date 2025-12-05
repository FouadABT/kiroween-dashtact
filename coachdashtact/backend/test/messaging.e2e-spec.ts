import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Messaging System (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let userId: string;
  let conversationId: string;
  let messageId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'Admin123!',
      });

    authToken = loginResponse.body.accessToken;
    userId = loginResponse.body.user.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/messaging/settings (GET)', () => {
    it('should get messaging settings', () => {
      return request(app.getHttpServer())
        .get('/messaging/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('enabled');
          expect(res.body.data).toHaveProperty('maxMessageLength');
        });
    });
  });

  describe('/messaging/settings (PATCH)', () => {
    it('should update messaging settings', () => {
      return request(app.getHttpServer())
        .patch('/messaging/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          enabled: true,
          maxMessageLength: 3000,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.data.enabled).toBe(true);
          expect(res.body.data.maxMessageLength).toBe(3000);
        });
    });
  });

  describe('/messaging/conversations (POST)', () => {
    it('should create a direct conversation', async () => {
      // Get another user to create conversation with
      const users = await prisma.user.findMany({ take: 2 });
      const otherUser = users.find(u => u.id !== userId);

      if (!otherUser) {
        throw new Error('No other user found for testing');
      }

      return request(app.getHttpServer())
        .post('/messaging/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'DIRECT',
          participantIds: [otherUser.id],
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.type).toBe('DIRECT');
          conversationId = res.body.data.id;
        });
    });
  });

  describe('/messaging/conversations (GET)', () => {
    it('should get user conversations', () => {
      return request(app.getHttpServer())
        .get('/messaging/conversations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('conversations');
          expect(Array.isArray(res.body.conversations)).toBe(true);
        });
    });
  });

  describe('/messaging/messages (POST)', () => {
    it('should send a message', () => {
      return request(app.getHttpServer())
        .post('/messaging/messages')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          conversationId,
          content: 'Hello, this is a test message!',
          type: 'TEXT',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.content).toBe('Hello, this is a test message!');
          messageId = res.body.data.id;
        });
    });
  });

  describe('/messaging/messages (GET)', () => {
    it('should get conversation messages', () => {
      return request(app.getHttpServer())
        .get(`/messaging/messages?conversationId=${conversationId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('messages');
          expect(Array.isArray(res.body.messages)).toBe(true);
        });
    });
  });

  describe('/messaging/messages/:id/read (POST)', () => {
    it('should mark message as read', () => {
      return request(app.getHttpServer())
        .post(`/messaging/messages/${messageId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Message marked as read');
        });
    });
  });

  describe('/messaging/unread-count (GET)', () => {
    it('should get unread message count', () => {
      return request(app.getHttpServer())
        .get('/messaging/unread-count')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('count');
          expect(typeof res.body.count).toBe('number');
        });
    });
  });
});
