import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';

describe('Sessions CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let coachToken: string;
  let memberToken: string;
  let testCoachId: string;
  let testMemberId: string;
  let testMemberProfileId: string;
  let testSessionId: string;
  let testCalendarEventId: string;

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

    await setupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function setupTestData() {
    // Create Admin user
    const adminRole = await prisma.userRole.findUnique({
      where: { name: 'Admin' },
    });

    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-sessions-test@example.com',
        name: 'Admin User',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        roleId: adminRole.id,
      },
    });

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin-sessions-test@example.com',
        password: 'password123',
      });

    adminToken = adminLoginResponse.body.accessToken;

    // Create Coach user
    const coachRole = await prisma.userRole.findUnique({
      where: { name: 'Coach' },
    });

    const coachUser = await prisma.user.create({
      data: {
        email: 'coach-sessions-test@example.com',
        name: 'Coach User',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        roleId: coachRole.id,
      },
    });

    testCoachId = coachUser.id;

    // Create coach profile
    await prisma.coachProfile.create({
      data: {
        userId: coachUser.id,
        specialization: 'Fitness',
        bio: 'Test coach bio',
        maxMembers: 20,
        isAcceptingMembers: true,
      },
    });

    // Login as coach
    const coachLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'coach-sessions-test@example.com',
        password: 'password123',
      });

    coachToken = coachLoginResponse.body.accessToken;

    // Create Member user
    const memberRole = await prisma.userRole.findUnique({
      where: { name: 'Member' },
    });

    const memberUser = await prisma.user.create({
      data: {
        email: 'member-sessions-test@example.com',
        name: 'Member User',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        roleId: memberRole.id,
      },
    });

    testMemberId = memberUser.id;

    // Create member profile
    const memberProfile = await prisma.memberProfile.create({
      data: {
        userId: memberUser.id,
        coachId: testCoachId,
        goals: 'Get fit',
        membershipStatus: 'active',
        onboardingStatus: 'completed',
      },
    });

    testMemberProfileId = memberProfile.id;

    // Login as member
    const memberLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'member-sessions-test@example.com',
        password: 'password123',
      });

    memberToken = memberLoginResponse.body.accessToken;

    // Ensure coaching session category exists
    await prisma.eventCategory.upsert({
      where: { slug: 'coaching-session' },
      update: {},
      create: {
        name: 'Coaching Session',
        slug: 'coaching-session',
        color: '#10b981',
        isActive: true,
      },
    });
  }

  async function cleanupTestData() {
    // Delete in correct order to respect foreign keys
    await prisma.session.deleteMany({
      where: {
        coach: {
          email: {
            in: [
              'admin-sessions-test@example.com',
              'coach-sessions-test@example.com',
              'member-sessions-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.memberProfile.deleteMany({
      where: {
        user: {
          email: {
            in: [
              'admin-sessions-test@example.com',
              'coach-sessions-test@example.com',
              'member-sessions-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.coachProfile.deleteMany({
      where: {
        user: {
          email: {
            in: [
              'admin-sessions-test@example.com',
              'coach-sessions-test@example.com',
              'member-sessions-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'admin-sessions-test@example.com',
            'coach-sessions-test@example.com',
            'member-sessions-test@example.com',
          ],
        },
      },
    });
  }

  describe('POST /sessions', () => {
    it('should create a session with calendar event', () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // Tomorrow

      return request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          type: 'initial',
          memberNotes: 'First session',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.memberId).toBe(testMemberProfileId);
          expect(res.body.coachId).toBe(testCoachId);
          expect(res.body.type).toBe('initial');
          expect(res.body.duration).toBe(60);
          expect(res.body.status).toBe('scheduled');
          expect(res.body).toHaveProperty('calendarEventId');
          testSessionId = res.body.id;
          testCalendarEventId = res.body.calendarEventId;
        });
    });

    it('should fail with invalid duration', () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 10, // Too short
          type: 'initial',
        })
        .expect(400);
    });

    it('should fail with invalid type', () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          type: 'invalid-type',
        })
        .expect(400);
    });

    it('should fail without authentication', () => {
      const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      return request(app.getHttpServer())
        .post('/sessions')
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          type: 'initial',
        })
        .expect(401);
    });
  });

  describe('GET /sessions', () => {
    it('should return all sessions for admin', () => {
      return request(app.getHttpServer())
        .get('/sessions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });

    it('should return only coach sessions for coach', () => {
      return request(app.getHttpServer())
        .get('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((session) => {
            expect(session.coachId).toBe(testCoachId);
          });
        });
    });

    it('should return only member sessions for member', () => {
      return request(app.getHttpServer())
        .get('/sessions')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((session) => {
            expect(session.memberId).toBe(testMemberProfileId);
          });
        });
    });
  });

  describe('GET /sessions/:id', () => {
    it('should return session by id for coach', () => {
      return request(app.getHttpServer())
        .get(`/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testSessionId);
          expect(res.body.coachId).toBe(testCoachId);
        });
    });

    it('should return session by id for member', () => {
      return request(app.getHttpServer())
        .get(`/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testSessionId);
          expect(res.body.memberId).toBe(testMemberProfileId);
        });
    });

    it('should fail for non-existent session', () => {
      return request(app.getHttpServer())
        .get('/sessions/non-existent-id')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(404);
    });
  });

  describe('PATCH /sessions/:id', () => {
    it('should update session', () => {
      const newScheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

      return request(app.getHttpServer())
        .patch(`/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          scheduledAt: newScheduledAt.toISOString(),
          duration: 90,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.duration).toBe(90);
        });
    });

    it('should fail for non-coach user', () => {
      return request(app.getHttpServer())
        .patch(`/sessions/${testSessionId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          duration: 90,
        })
        .expect(403);
    });
  });

  describe('PATCH /sessions/:id/complete', () => {
    it('should complete session', () => {
      return request(app.getHttpServer())
        .patch(`/sessions/${testSessionId}/complete`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          coachNotes: 'Great session, member made progress',
          outcomes: 'Completed initial assessment',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('completed');
          expect(res.body.coachNotes).toBe('Great session, member made progress');
          expect(res.body).toHaveProperty('completedAt');
        });
    });

    it('should fail to complete already completed session', () => {
      return request(app.getHttpServer())
        .patch(`/sessions/${testSessionId}/complete`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          coachNotes: 'Trying again',
        })
        .expect(400);
    });
  });

  describe('POST /sessions/:id/rate', () => {
    it('should rate completed session', () => {
      return request(app.getHttpServer())
        .post(`/sessions/${testSessionId}/rate`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          rating: 5,
          feedback: 'Excellent session!',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.rating).toBe(5);
          expect(res.body.ratingFeedback).toBe('Excellent session!');
        });
    });

    it('should fail with invalid rating', () => {
      return request(app.getHttpServer())
        .post(`/sessions/${testSessionId}/rate`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          rating: 6, // Out of range
        })
        .expect(400);
    });

    it('should fail to rate already rated session', () => {
      return request(app.getHttpServer())
        .post(`/sessions/${testSessionId}/rate`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          rating: 4,
        })
        .expect(400);
    });
  });

  describe('PATCH /sessions/:id/cancel', () => {
    it('should create and cancel a new session', async () => {
      // Create new session
      const scheduledAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const createResponse = await request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          type: 'regular',
        })
        .expect(201);

      const newSessionId = createResponse.body.id;

      // Cancel it
      return request(app.getHttpServer())
        .patch(`/sessions/${newSessionId}/cancel`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          reason: 'Coach unavailable',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('cancelled');
          expect(res.body.cancellationReason).toBe('Coach unavailable');
          expect(res.body).toHaveProperty('cancelledAt');
        });
    });

    it('should fail to cancel completed session', () => {
      return request(app.getHttpServer())
        .patch(`/sessions/${testSessionId}/cancel`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          reason: 'Test',
        })
        .expect(400);
    });
  });

  describe('GET /sessions/upcoming', () => {
    it('should return upcoming sessions', () => {
      return request(app.getHttpServer())
        .get('/sessions/upcoming')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((session) => {
            expect(session.status).toBe('scheduled');
            expect(new Date(session.scheduledAt).getTime()).toBeGreaterThan(
              Date.now(),
            );
          });
        });
    });
  });

  describe('POST /sessions/:id/coach-notes', () => {
    it('should add coach notes', async () => {
      // Create new session
      const scheduledAt = new Date(Date.now() + 96 * 60 * 60 * 1000);
      const createResponse = await request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          type: 'regular',
        })
        .expect(201);

      const newSessionId = createResponse.body.id;

      return request(app.getHttpServer())
        .post(`/sessions/${newSessionId}/coach-notes`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          notes: 'Member needs to focus on form',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.coachNotes).toBe('Member needs to focus on form');
        });
    });

    it('should fail for non-coach user', async () => {
      const scheduledAt = new Date(Date.now() + 120 * 60 * 60 * 1000);
      const createResponse = await request(app.getHttpServer())
        .post('/sessions')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          scheduledAt: scheduledAt.toISOString(),
          duration: 60,
          type: 'regular',
        })
        .expect(201);

      const newSessionId = createResponse.body.id;

      return request(app.getHttpServer())
        .post(`/sessions/${newSessionId}/coach-notes`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          notes: 'Trying to add coach notes as member',
        })
        .expect(403);
    });
  });
});
