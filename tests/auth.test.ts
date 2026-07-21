import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

// Unique email to avoid conflicts
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123';

describe('Auth Endpoints', () => {
  // Cleanup after all tests
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test-' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: TEST_EMAIL,
          name: 'Test',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body.message).toBe('USER_REGISTERED_SUCCESSFULLY_CONFIRM_EMAIL');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          name: 'T', // Too short
          lastName: 'U',
          password: 'short', // Too short/weak
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_DATA');
    });

    it('should return 409 if email already exists', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: TEST_EMAIL,
          name: 'Test',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('EMAIL_ALREADY_REGISTERED');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 if email is not verified', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('should return 401 for invalid credentials', async () => {
      // Manually verify the user in DB to test password validation
      await prisma.user.update({
        where: { email: TEST_EMAIL },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationExpires: null,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should login successfully after verification', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(TEST_EMAIL);
    });
  });
});
