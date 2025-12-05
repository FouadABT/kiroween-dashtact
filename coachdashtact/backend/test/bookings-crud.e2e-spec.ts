import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Bookings CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let coachToken: string;
  let memberToken: string;
  let testCoachId: string;
  let testMemberId: string;
  let testMemberProfileId: string;
  let testBookingId: string;
  let testAvailabilityId: string;

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
    // Create Coach user
    const coachRole = await prisma.userRole.findUnique({
      where: { name: 'Coach' },
    });

    const coachUser = await prisma.user.create({
      data: {
        email: 'coach-bookings-test@example.com',
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

    // Create coach availability
    const availability = await prisma.coachAvailability.create({
      data: {
        coachId: testCoachId,
        dayOfWeek: 1, // Monday
        startTime: '09:00',
        endTime: '17:00',
        maxSessionsPerSlot: 3,
        bufferMinutes: 15,
        isActive: true,
      },
    });

    testAvailabilityId = availability.id;

    // Login as coach
    const coachLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'coach-bookings-test@example.com',
        password: 'password123',
      });

    coachToken = coachLoginResponse.body.accessToken;

    // Create Member user
    const memberRole = await prisma.userRole.findUnique({
      where: { name: 'Member' },
    });

    const memberUser = await prisma.user.create({
      data: {
        email: 'member-bookings-test@example.com',
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
        email: 'member-bookings-test@example.com',
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
    await prisma.sessionBooking.deleteMany({
      where: {
        coach: {
          email: {
            in: [
              'coach-bookings-test@example.com',
              'member-bookings-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.session.deleteMany({
      where: {
        coach: {
          email: {
            in: [
              'coach-bookings-test@example.com',
              'member-bookings-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.coachAvailability.deleteMany({
      where: {
        coach: {
          email: 'coach-bookings-test@example.com',
        },
      },
    });

    await prisma.memberProfile.deleteMany({
      where: {
        user: {
          email: {
            in: [
              'coach-bookings-test@example.com',
              'member-bookings-test@example.com',
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
              'coach-bookings-test@example.com',
              'member-bookings-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'coach-bookings-test@example.com',
            'member-bookings-test@example.com',
          ],
        },
      },
    });
  }

  describe('POST /bookings', () => {
    it('should create a booking with auto-confirmation', () => {
      // Get next Monday
      const today = new Date();
      const nextMonday = new Date(today);
      nextMonday.setDate(
        today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7),
      );

      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          requestedDate: nextMonday.toISOString().split('T')[0],
          requestedTime: '10:00',
          duration: 60,
          memberNotes: 'First booking',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.memberId).toBe(testMemberProfileId);
          expect(res.body.coachId).toBe(testCoachId);
          expect(res.body.requestedTime).toBe('10:00');
          expect(res.body.duration).toBe(60);
          expect(res.body.status).toBe('confirmed');
          expect(res.body).toHaveProperty('sessionId');
          testBookingId = res.body.id;
        });
    });

    it('should fail with invalid duration', () => {
      const nextMonday = new Date();
      nextMonday.setDate(
        nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
      );

      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          requestedDate: nextMonday.toISOString().split('T')[0],
          requestedTime: '11:00',
          duration: 10, // Too short
        })
        .expect(400);
    });

    it('should fail without authentication', () => {
      const nextMonday = new Date();
      nextMonday.setDate(
        nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
      );

      return request(app.getHttpServer())
        .post('/bookings')
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          requestedDate: nextMonday.toISOString().split('T')[0],
          requestedTime: '12:00',
          duration: 60,
        })
        .expect(401);
    });
  });

  describe('GET /bookings', () => {
    it('should return all bookings for member', () => {
      return request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          res.body.forEach((booking) => {
            expect(booking.memberId).toBe(testMemberProfileId);
          });
        });
    });

    it('should return all bookings for coach', () => {
      return request(app.getHttpServer())
        .get('/bookings')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((booking) => {
            expect(booking.coachId).toBe(testCoachId);
          });
        });
    });
  });

  describe('GET /bookings/:id', () => {
    it('should return booking by id for member', () => {
      return request(app.getHttpServer())
        .get(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testBookingId);
          expect(res.body.memberId).toBe(testMemberProfileId);
        });
    });

    it('should return booking by id for coach', () => {
      return request(app.getHttpServer())
        .get(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testBookingId);
          expect(res.body.coachId).toBe(testCoachId);
        });
    });

    it('should fail for non-existent booking', () => {
      return request(app.getHttpServer())
        .get('/bookings/non-existent-id')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(404);
    });
  });

  describe('DELETE /bookings/:id', () => {
    it('should cancel booking', () => {
      return request(app.getHttpServer())
        .delete(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          reason: 'Schedule conflict',
        })
        .expect(200);
    });

    it('should fail to cancel already cancelled booking', () => {
      return request(app.getHttpServer())
        .delete(`/bookings/${testBookingId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          reason: 'Trying again',
        })
        .expect(400);
    });
  });

  describe('GET /bookings/pending', () => {
    it('should return pending bookings for coach', () => {
      return request(app.getHttpServer())
        .get('/bookings/pending')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((booking) => {
            expect(booking.status).toBe('pending');
            expect(booking.coachId).toBe(testCoachId);
          });
        });
    });
  });

  describe('Capacity Management', () => {
    it('should reject booking when slot is full', async () => {
      const nextMonday = new Date();
      nextMonday.setDate(
        nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7 || 7),
      );

      // Create 3 bookings (max capacity)
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post('/bookings')
          .set('Authorization', `Bearer ${memberToken}`)
          .send({
            memberId: testMemberProfileId,
            coachId: testCoachId,
            requestedDate: nextMonday.toISOString().split('T')[0],
            requestedTime: '14:00',
            duration: 60,
          })
          .expect(201);
      }

      // 4th booking should fail
      return request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          memberId: testMemberProfileId,
          coachId: testCoachId,
          requestedDate: nextMonday.toISOString().split('T')[0],
          requestedTime: '14:00',
          duration: 60,
        })
        .expect(409);
    });
  });
});
