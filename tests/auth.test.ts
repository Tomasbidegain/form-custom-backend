import { describe, it, expect, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

const TEST_PASSWORD = 'Password123';

describe('Auth Endpoints', () => {
  // Cleanup after each test to ensure isolation
  afterEach(async () => {
    await prisma.formResponse.deleteMany({
      where: { form: { user: { email: { startsWith: 'test-' } } } },
    });
    await prisma.field.deleteMany({
      where: { form: { user: { email: { startsWith: 'test-' } } } },
    });
    await prisma.form.deleteMany({
      where: { user: { email: { startsWith: 'test-' } } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: 'test-' } },
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const email = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
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
      const email = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

      // Register first time
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          name: 'Test',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      // Try to register again with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          name: 'Test',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('EMAIL_ALREADY_REGISTERED');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid credentials', async () => {
      const email = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

      // Create and verify user
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          name: 'Test',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      await prisma.user.update({
        where: { email },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationExpires: null,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: 'WrongPassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should return 401 if email is not verified', async () => {
      const email = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

      // Create user but don't verify
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          name: 'Unverified',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('EMAIL_NOT_VERIFIED');
    });

    it('should login successfully after verification', async () => {
      const email = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

      // Create and verify user
      await request(app)
        .post('/api/auth/register')
        .send({
          email,
          name: 'Test',
          lastName: 'User',
          password: TEST_PASSWORD,
        });

      await prisma.user.update({
        where: { email },
        data: {
          isVerified: true,
          verificationToken: null,
          verificationExpires: null,
        },
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email,
          password: TEST_PASSWORD,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(email);
    });
  });
});
