import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Coaching Platform E2E Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let coachToken: string;
  let memberToken: string;
  let coachUserId: string;
  let memberUserId: string;
  let coachProfileId: string;
  let memberProfileId: string;
  let availabilitySlotId: string;
  let sessionId: string;
  let bookingId: string;

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

    // Clean up any existing test data
    await cleanupTestData();
  });

  afterAll(async () => {
    await cleanupTestData();
    await app.close();
  });

  async function cleanupTestData() {
    // Delete in correct order to respect foreign keys
    await prisma.sessionBooking.deleteMany({
      where: {
        OR: [
          { member: { user: { email: { contains: 'e2e-test' } } } },
          { coach: { email: { contains: 'e2e-test' } } },
        ],
      },
    });

    await prisma.session.deleteMany({
      where: {
        OR: [
          { member: { user: { email: { contains: 'e2e-test' } } } },
          { coach: { email: { contains: 'e2e-test' } } },
        ],
      },
    });

    await prisma.coachAvailability.deleteMany({
      where: { coach: { email: { contains: 'e2e-test' } } },
    });

    await prisma.memberProfile.deleteMany({
      where: { user: { email: { contains: 'e2e-test' } } },
    });

    await prisma.coachProfile.deleteMany({
      where: { user: { email: { contains: 'e2e-test' } } },
    });

    await prisma.user.deleteMany({
      where: { email: { contains: 'e2e-test' } },
    });
  }

  describe('1. Complete Member Flow', () => {
    it('should create admin user and get token', async () => {
      // Register admin
      const adminEmail = `e2e-test-admin-${Date.now()}@test.com`;
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: adminEmail,
          password: 'Test123!@#',
          name: 'E2E Test Admin',
        })
        .expect(201);

      // Manually set admin role
      await prisma.user.update({
        where: { id: registerResponse.body.user.id },
        data: { roleId: 'super-admin' },
      });

      // Login as admin
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: adminEmail,
          password: 'Test123!@#',
        })
        .expect(200);

      adminToken = loginResponse.body.access_token;
      expect(adminToken).toBeDefined();
    });

    it('should create coach user with profile', async () => {
      const coachEmail = `e2e-test-coach-${Date.now()}@test.com`;
      
      // Register coach
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: coachEmail,
          password: 'Test123!@#',
          name: 'E2E Test Coach',
        })
        .expect(201);

      coachUserId = registerResponse.body.user.id;

      // Set coach role
      await prisma.user.update({
        where: { id: coachUserId },
        data: { roleId: 'coach' },
      });

      // Create coach profile
      const coachProfile = await prisma.coachProfile.create({
        data: {
          userId: coachUserId,
          specialization: 'Life Coaching',
          bio: 'E2E Test Coach Bio',
          maxMembers: 5,
          isAcceptingMembers: true,
        },
      });

      coachProfileId = coachProfile.id;

      // Login as coach
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: coachEmail,
          password: 'Test123!@#',
        })
        .expect(200);

      coachToken = loginResponse.body.access_token;
      expect(coachToken).toBeDefined();
    });

    it('should create member user and assign to coach', async () => {
      const memberEmail = `e2e-test-member-${Date.now()}@test.com`;
      
      // Register member
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: memberEmail,
          password: 'Test123!@#',
          name: 'E2E Test Member',
        })
        .expect(201);

      memberUserId = registerResponse.body.user.id;

      // Set member role
      await prisma.user.update({
        where: { id: memberUserId },
        data: { roleId: 'member' },
      });

      // Create member profile
      const memberProfile = await prisma.memberProfile.create({
        data: {
          userId: memberUserId,
          coachId: coachUserId,
          goals: 'E2E Test Goals',
          membershipStatus: 'active',
          onboardingStatus: 'completed',
        },
      });

      memberProfileId = memberProfile.id;

      // Login as member
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: memberEmail,
          password: 'Test123!@#',
        })
        .expect(200);

      memberToken = loginResponse.body.access_token;
      expect(memberToken).toBeDefined();
    });

    it('should allow coach to set availability', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dayOfWeek = tomorrow.getDay();

      const response = await request(app.getHttpServer())
        .post('/coach-availability')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          maxSessionsPerSlot: 2,
          bufferMinutes: 15,
        })
        .expect(201);

      availabilitySlotId = response.body.id;
      expect(response.body.dayOfWeek).toBe(dayOfWeek);
      expect(response.body.maxSessionsPerSlot).toBe(2);
    });

    it('should allow member to view available slots', async () => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await request(app.getHttpServer())
        .get(`/coach-availability/${coachUserId}/slots`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        })
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should allow member to book a session', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          coachId: coachUserId,
          requestedDate: tomorrow.toISOString(),
          requestedTime: '10:00',
          duration: 60,
          memberNotes: 'E2E Test Booking',
        })
        .expect(201);

      bookingId = response.body.id;
      sessionId = response.body.sessionId;
      expect(response.body.status).toBe('confirmed');
      expect(sessionId).toBeDefined();
    });

    it('should allow coach to view the booking', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);

      expect(response.body.id).toBe(sessionId);
      expect(response.body.memberId).toBe(memberProfileId);
      expect(response.body.status).toBe('scheduled');
    });

    it('should allow coach to complete the session', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/sessions/${sessionId}/complete`)
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          coachNotes: 'E2E Test Session Completed',
          outcomes: 'Great progress made',
        })
        .expect(200);

      expect(response.body.status).toBe('completed');
      expect(response.body.completedAt).toBeDefined();
    });

    it('should allow member to rate the session', async () => {
      const response = await request(app.getHttpServer())
        .post(`/sessions/${sessionId}/rate`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          rating: 5,
          feedback: 'Excellent session!',
        })
        .expect(200);

      expect(response.body.rating).toBe(5);
      expect(response.body.ratingFeedback).toBe('Excellent session!');
    });
  });

  describe('2. Capacity Limits', () => {
    it('should prevent booking when slot is at capacity', async () => {
      // Create a second booking for the same slot
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);

      // First booking should succeed (we already have one from previous test)
      // Create another member
      const member2Email = `e2e-test-member2-${Date.now()}@test.com`;
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: member2Email,
          password: 'Test123!@#',
          name: 'E2E Test Member 2',
        })
        .expect(201);

      const member2UserId = registerResponse.body.user.id;
      await prisma.user.update({
        where: { id: member2UserId },
        data: { roleId: 'member' },
      });

      const member2Profile = await prisma.memberProfile.create({
        data: {
          userId: member2UserId,
          coachId: coachUserId,
          goals: 'E2E Test Goals 2',
          membershipStatus: 'active',
          onboardingStatus: 'completed',
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: member2Email,
          password: 'Test123!@#',
        })
        .expect(200);

      const member2Token = loginResponse.body.access_token;

      // Second booking should succeed (capacity is 2)
      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${member2Token}`)
        .send({
          coachId: coachUserId,
          requestedDate: tomorrow.toISOString(),
          requestedTime: '10:00',
          duration: 60,
          memberNotes: 'E2E Test Booking 2',
        })
        .expect(201);

      // Create third member
      const member3Email = `e2e-test-member3-${Date.now()}@test.com`;
      const register3Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: member3Email,
          password: 'Test123!@#',
          name: 'E2E Test Member 3',
        })
        .expect(201);

      const member3UserId = register3Response.body.user.id;
      await prisma.user.update({
        where: { id: member3UserId },
        data: { roleId: 'member' },
      });

      await prisma.memberProfile.create({
        data: {
          userId: member3UserId,
          coachId: coachUserId,
          goals: 'E2E Test Goals 3',
          membershipStatus: 'active',
          onboardingStatus: 'completed',
        },
      });

      const login3Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: member3Email,
          password: 'Test123!@#',
        })
        .expect(200);

      const member3Token = login3Response.body.access_token;

      // Third booking should fail (capacity is 2)
      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${member3Token}`)
        .send({
          coachId: coachUserId,
          requestedDate: tomorrow.toISOString(),
          requestedTime: '10:00',
          duration: 60,
          memberNotes: 'E2E Test Booking 3',
        })
        .expect(400);

      expect(response.body.message).toContain('full');
    });

    it('should prevent coach from accepting more members than maxMembers', async () => {
      // Coach has maxMembers = 5, currently has 3 members
      // Add 2 more members to reach capacity
      for (let i = 4; i <= 5; i++) {
        const memberEmail = `e2e-test-member${i}-${Date.now()}@test.com`;
        const registerResponse = await request(app.getHttpServer())
          .post('/auth/register')
          .send({
            email: memberEmail,
            password: 'Test123!@#',
            name: `E2E Test Member ${i}`,
          })
          .expect(201);

        const userId = registerResponse.body.user.id;
        await prisma.user.update({
          where: { id: userId },
          data: { roleId: 'member' },
        });

        await prisma.memberProfile.create({
          data: {
            userId,
            coachId: coachUserId,
            goals: `E2E Test Goals ${i}`,
            membershipStatus: 'active',
            onboardingStatus: 'completed',
          },
        });
      }

      // Try to add 6th member (should fail)
      const member6Email = `e2e-test-member6-${Date.now()}@test.com`;
      const register6Response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: member6Email,
          password: 'Test123!@#',
          name: 'E2E Test Member 6',
        })
        .expect(201);

      const member6UserId = register6Response.body.user.id;
      await prisma.user.update({
        where: { id: member6UserId },
        data: { roleId: 'member' },
      });

      // Attempt to create member profile with coach assignment should fail
      await expect(
        prisma.memberProfile.create({
          data: {
            userId: member6UserId,
            coachId: coachUserId,
            goals: 'E2E Test Goals 6',
            membershipStatus: 'active',
            onboardingStatus: 'completed',
          },
        }),
      ).rejects.toThrow();
    });
  });

  describe('3. Cancellation Flow', () => {
    let cancelBookingId: string;
    let cancelSessionId: string;

    it('should create a booking to cancel', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(14, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          coachId: coachUserId,
          requestedDate: tomorrow.toISOString(),
          requestedTime: '14:00',
          duration: 60,
          memberNotes: 'E2E Test Booking to Cancel',
        })
        .expect(201);

      cancelBookingId = response.body.id;
      cancelSessionId = response.body.sessionId;
    });

    it('should allow member to cancel booking', async () => {
      await request(app.getHttpServer())
        .delete(`/bookings/${cancelBookingId}`)
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200);

      // Verify session is cancelled
      const session = await prisma.session.findUnique({
        where: { id: cancelSessionId },
      });
      expect(session.status).toBe('cancelled');
    });

    it('should allow rebooking after cancellation', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 2);
      tomorrow.setHours(14, 0, 0, 0);

      const response = await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          coachId: coachUserId,
          requestedDate: tomorrow.toISOString(),
          requestedTime: '14:00',
          duration: 60,
          memberNotes: 'E2E Test Rebooking',
        })
        .expect(201);

      expect(response.body.status).toBe('confirmed');
    });
  });

  describe('4. Permission Enforcement', () => {
    it('should prevent member from viewing other members', async () => {
      // Try to access members list as member
      await request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(403);
    });

    it('should prevent member from viewing coach availability management', async () => {
      await request(app.getHttpServer())
        .post('/coach-availability')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
          maxSessionsPerSlot: 1,
          bufferMinutes: 15,
        })
        .expect(403);
    });

    it('should allow coach to view their members', async () => {
      const response = await request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Should only see their own members
      response.body.forEach((member: any) => {
        expect(member.coachId).toBe(coachUserId);
      });
    });

    it('should allow admin to view all members', async () => {
      const response = await request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      // Admin should see all members
      expect(response.body.length).toBeGreaterThanOrEqual(5);
    });

    it('should prevent coach from viewing sessions of other coaches', async () => {
      // Create another coach
      const coach2Email = `e2e-test-coach2-${Date.now()}@test.com`;
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: coach2Email,
          password: 'Test123!@#',
          name: 'E2E Test Coach 2',
        })
        .expect(201);

      const coach2UserId = registerResponse.body.user.id;
      await prisma.user.update({
        where: { id: coach2UserId },
        data: { roleId: 'coach' },
      });

      await prisma.coachProfile.create({
        data: {
          userId: coach2UserId,
          specialization: 'Career Coaching',
          maxMembers: 5,
          isAcceptingMembers: true,
        },
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: coach2Email,
          password: 'Test123!@#',
        })
        .expect(200);

      const coach2Token = loginResponse.body.access_token;

      // Coach 2 tries to view Coach 1's session
      await request(app.getHttpServer())
        .get(`/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${coach2Token}`)
        .expect(403);
    });
  });

  describe('5. Data Validation', () => {
    it('should reject invalid availability slot times', async () => {
      await request(app.getHttpServer())
        .post('/coach-availability')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          dayOfWeek: 1,
          startTime: '17:00',
          endTime: '09:00', // End before start
          maxSessionsPerSlot: 1,
          bufferMinutes: 15,
        })
        .expect(400);
    });

    it('should reject invalid session rating', async () => {
      await request(app.getHttpServer())
        .post(`/sessions/${sessionId}/rate`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          rating: 6, // Invalid rating (should be 1-5)
          feedback: 'Test',
        })
        .expect(400);
    });

    it('should reject duplicate session rating', async () => {
      // Session was already rated in previous test
      await request(app.getHttpServer())
        .post(`/sessions/${sessionId}/rate`)
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          rating: 4,
          feedback: 'Another rating',
        })
        .expect(400);
    });

    it('should reject booking outside availability', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(20, 0, 0, 0); // 8 PM - outside availability

      await request(app.getHttpServer())
        .post('/bookings')
        .set('Authorization', `Bearer ${memberToken}`)
        .send({
          coachId: coachUserId,
          requestedDate: tomorrow.toISOString(),
          requestedTime: '20:00',
          duration: 60,
          memberNotes: 'E2E Test Invalid Booking',
        })
        .expect(400);
    });
  });
});
