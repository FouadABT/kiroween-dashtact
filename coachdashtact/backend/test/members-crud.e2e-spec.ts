import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Members CRUD (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authToken: string;
  let adminToken: string;
  let coachToken: string;
  let memberToken: string;
  let testUserId: string;
  let testCoachId: string;
  let testMemberId: string;
  let testMemberProfileId: string;

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

    // Create test users and get tokens
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
        email: 'admin-members-test@example.com',
        name: 'Admin User',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // hashed password
        roleId: adminRole.id,
      },
    });

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin-members-test@example.com',
        password: 'password123',
      });

    adminToken = adminLoginResponse.body.accessToken;

    // Create Coach user
    const coachRole = await prisma.userRole.findUnique({
      where: { name: 'Coach' },
    });

    const coachUser = await prisma.user.create({
      data: {
        email: 'coach-members-test@example.com',
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
        email: 'coach-members-test@example.com',
        password: 'password123',
      });

    coachToken = coachLoginResponse.body.accessToken;

    // Create Member user
    const memberRole = await prisma.userRole.findUnique({
      where: { name: 'Member' },
    });

    const memberUser = await prisma.user.create({
      data: {
        email: 'member-test@example.com',
        name: 'Member User',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
        roleId: memberRole.id,
      },
    });

    testUserId = memberUser.id;
    testMemberId = memberUser.id;

    // Login as member
    const memberLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'member-test@example.com',
        password: 'password123',
      });

    memberToken = memberLoginResponse.body.accessToken;
  }

  async function cleanupTestData() {
    // Delete in correct order to respect foreign keys
    await prisma.memberProfile.deleteMany({
      where: {
        user: {
          email: {
            in: [
              'admin-members-test@example.com',
              'coach-members-test@example.com',
              'member-test@example.com',
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
              'admin-members-test@example.com',
              'coach-members-test@example.com',
              'member-test@example.com',
            ],
          },
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'admin-members-test@example.com',
            'coach-members-test@example.com',
            'member-test@example.com',
          ],
        },
      },
    });
  }

  describe('POST /members', () => {
    it('should create a member profile', () => {
      return request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          coachId: testCoachId,
          goals: 'Get fit and healthy',
          healthInfo: 'No health issues',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.userId).toBe(testUserId);
          expect(res.body.coachId).toBe(testCoachId);
          expect(res.body.goals).toBe('Get fit and healthy');
          expect(res.body.healthInfo).toBe('No health issues');
          expect(res.body.membershipStatus).toBe('active');
          expect(res.body.onboardingStatus).toBe('pending');
          testMemberProfileId = res.body.id;
        });
    });

    it('should fail to create duplicate member profile', () => {
      return request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: testUserId,
          coachId: testCoachId,
          goals: 'Get fit',
          healthInfo: 'No issues',
        })
        .expect(409);
    });

    it('should fail with invalid userId format', () => {
      return request(app.getHttpServer())
        .post('/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 'invalid-uuid',
          coachId: testCoachId,
          goals: 'Get fit',
        })
        .expect(400);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/members')
        .send({
          userId: testUserId,
          goals: 'Get fit',
        })
        .expect(401);
    });
  });

  describe('GET /members', () => {
    it('should return all members for admin', () => {
      return request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
          expect(res.body[0]).toHaveProperty('id');
          expect(res.body[0]).toHaveProperty('userId');
          expect(res.body[0]).toHaveProperty('user');
        });
    });

    it('should return only assigned members for coach', () => {
      return request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((member) => {
            expect(member.coachId).toBe(testCoachId);
          });
        });
    });

    it('should return only own profile for member', () => {
      return request(app.getHttpServer())
        .get('/members')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeLessThanOrEqual(1);
          if (res.body.length > 0) {
            expect(res.body[0].userId).toBe(testMemberId);
          }
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer()).get('/members').expect(401);
    });
  });

  describe('GET /members/:id', () => {
    it('should return member profile by id for admin', () => {
      return request(app.getHttpServer())
        .get(`/members/${testMemberProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMemberProfileId);
          expect(res.body).toHaveProperty('user');
          expect(res.body).toHaveProperty('coach');
        });
    });

    it('should return member profile for assigned coach', () => {
      return request(app.getHttpServer())
        .get(`/members/${testMemberProfileId}`)
        .set('Authorization', `Bearer ${coachToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(testMemberProfileId);
        });
    });

    it('should fail for non-existent member', () => {
      return request(app.getHttpServer())
        .get('/members/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/members/${testMemberProfileId}`)
        .expect(401);
    });
  });

  describe('PATCH /members/:id', () => {
    it('should update member profile', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          goals: 'Updated fitness goals',
          healthInfo: 'Updated health information',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.goals).toBe('Updated fitness goals');
          expect(res.body.healthInfo).toBe('Updated health information');
        });
    });

    it('should update membership status', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          membershipStatus: 'paused',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.membershipStatus).toBe('paused');
        });
    });

    it('should fail with invalid membership status', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          membershipStatus: 'invalid-status',
        })
        .expect(400);
    });

    it('should fail for non-existent member', () => {
      return request(app.getHttpServer())
        .patch('/members/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          goals: 'Updated goals',
        })
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}`)
        .send({
          goals: 'Updated goals',
        })
        .expect(401);
    });
  });

  describe('PATCH /members/:id/assign-coach', () => {
    it('should assign coach to member', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/assign-coach`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          coachId: testCoachId,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.coachId).toBe(testCoachId);
        });
    });

    it('should fail with invalid coach id', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/assign-coach`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          coachId: 'invalid-uuid',
        })
        .expect(400);
    });

    it('should fail for non-existent member', () => {
      return request(app.getHttpServer())
        .patch('/members/non-existent-id/assign-coach')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          coachId: testCoachId,
        })
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/assign-coach`)
        .send({
          coachId: testCoachId,
        })
        .expect(401);
    });
  });

  describe('PATCH /members/:id/onboarding', () => {
    it('should update onboarding status', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/onboarding`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'in_progress',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.onboardingStatus).toBe('in_progress');
        });
    });

    it('should update to completed status', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/onboarding`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.onboardingStatus).toBe('completed');
        });
    });

    it('should fail with invalid status', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/onboarding`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'invalid-status',
        })
        .expect(400);
    });

    it('should fail for non-existent member', () => {
      return request(app.getHttpServer())
        .patch('/members/non-existent-id/onboarding')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed',
        })
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .patch(`/members/${testMemberProfileId}/onboarding`)
        .send({
          status: 'completed',
        })
        .expect(401);
    });
  });

  describe('GET /members/coaches/available', () => {
    it('should return available coaches', () => {
      return request(app.getHttpServer())
        .get('/members/coaches/available')
        .set('Authorization', `Bearer ${memberToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((coach) => {
            expect(coach).toHaveProperty('userId');
            expect(coach).toHaveProperty('specialization');
            expect(coach).toHaveProperty('currentMemberCount');
            expect(coach).toHaveProperty('availableCapacity');
            expect(coach).toHaveProperty('isAtCapacity');
            expect(coach.isAcceptingMembers).toBe(true);
            expect(coach.isAtCapacity).toBe(false);
          });
        });
    });

    it('should work without authentication', () => {
      return request(app.getHttpServer())
        .get('/members/coaches/available')
        .expect(200);
    });
  });

  describe('GET /members/coach/:coachId', () => {
    it('should return members for specific coach', () => {
      return request(app.getHttpServer())
        .get(`/members/coach/${testCoachId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          res.body.forEach((member) => {
            expect(member.coachId).toBe(testCoachId);
          });
        });
    });

    it('should return empty array for coach with no members', async () => {
      // Create a new coach with no members
      const newCoachUser = await prisma.user.create({
        data: {
          email: 'new-coach-test@example.com',
          name: 'New Coach',
          password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
          roleId: (await prisma.userRole.findUnique({ where: { name: 'Coach' } }))
            .id,
        },
      });

      await prisma.coachProfile.create({
        data: {
          userId: newCoachUser.id,
          specialization: 'Nutrition',
          maxMembers: 10,
          isAcceptingMembers: true,
        },
      });

      return request(app.getHttpServer())
        .get(`/members/coach/${newCoachUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBe(0);
        });
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .get(`/members/coach/${testCoachId}`)
        .expect(401);
    });
  });
});
