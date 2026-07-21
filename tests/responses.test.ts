import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

// Import mocks
import './mocks/socket';

const TEST_PASSWORD = 'Password123';
let authToken: string;
let userEmail: string;

describe('Response Endpoints', () => {
  beforeEach(async () => {
    userEmail = `test-responses-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

    // Create and verify user
    await request(app).post('/api/auth/register').send({
      email: userEmail,
      name: 'Test',
      lastName: 'User',
      password: TEST_PASSWORD,
    });

    await prisma.user.update({
      where: { email: userEmail },
      data: { isVerified: true, verificationToken: null, verificationExpires: null },
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: userEmail,
      password: TEST_PASSWORD,
    });

    authToken = loginRes.body.token;
  });

  afterEach(async () => {
    // Clean up in correct order to avoid foreign key constraints
    await prisma.fieldResponse.deleteMany({
      where: { formResponse: { form: { user: { email: { startsWith: 'test-' } } } } },
    });
    await prisma.formResponse.deleteMany({
      where: { form: { user: { email: { startsWith: 'test-' } } } },
    });
    await prisma.field.deleteMany({
      where: { form: { user: { email: { startsWith: 'test-' } } } },
    });
    await prisma.form.deleteMany({
      where: { user: { email: { startsWith: 'test-' } } },
    });
    await prisma.user.deleteMany({ where: { email: { startsWith: 'test-' } } });
  });

  describe('POST /api/forms/:formId/responses', () => {
    it('should submit a response successfully', async () => {
      // Create and publish a form
      const formRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Response Test Form',
          captchaEnabled: false,
          fields: [
            {
              label: 'Name',
              type: 'TEXT',
              required: true,
              gridX: 0,
              gridY: 0,
              gridW: 12,
              gridH: 1,
            },
          ],
        });

      const formId = formRes.body.id;
      const fieldId = formRes.body.fields[0].id;

      // Publish the form
      await request(app)
        .patch(`/api/forms/${formId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      // Submit a response
      const response = await request(app)
        .post(`/api/forms/${formId}/responses`)
        .send({
          email: 'responder@example.com',
          fields: [{ fieldId, value: 'John Doe' }],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.fields).toHaveLength(1);
    });

    it('should return 400 for unpublished form', async () => {
      // Create an unpublished form
      const formRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Unpublished Form',
          captchaEnabled: false,
          fields: [
            {
              label: 'Test',
              type: 'TEXT',
              required: true,
              gridX: 0,
              gridY: 0,
              gridW: 12,
              gridH: 1,
            },
          ],
        });

      const formId = formRes.body.id;
      const fieldId = formRes.body.fields[0].id;

      const response = await request(app)
        .post(`/api/forms/${formId}/responses`)
        .send({
          fields: [{ fieldId, value: 'test' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('FORM_NOT_PUBLISHED');
    });

    it('should return 404 for non-existent form', async () => {
      const response = await request(app)
        .post('/api/forms/non-existent-id/responses')
        .send({
          fields: [{ fieldId: 'test-id', value: 'test' }],
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/forms/:formId/responses', () => {
    it('should list responses with pagination', async () => {
      // Create and publish a form
      const formRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Response Test Form',
          captchaEnabled: false,
          fields: [
            {
              label: 'Name',
              type: 'TEXT',
              required: true,
              gridX: 0,
              gridY: 0,
              gridW: 12,
              gridH: 1,
            },
          ],
        });

      const formId = formRes.body.id;
      const fieldId = formRes.body.fields[0].id;

      // Publish the form
      await request(app)
        .patch(`/api/forms/${formId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      // Submit a response
      await request(app)
        .post(`/api/forms/${formId}/responses`)
        .send({
          email: 'responder@example.com',
          fields: [{ fieldId, value: 'John Doe' }],
        });

      // List responses
      const response = await request(app)
        .get(`/api/forms/${formId}/responses`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .get('/api/forms/non-existent-id/responses');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/forms/:formId/responses/export', () => {
    it('should export responses as CSV', async () => {
      // Create and publish a form
      const formRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Response Test Form',
          captchaEnabled: false,
          fields: [
            {
              label: 'Name',
              type: 'TEXT',
              required: true,
              gridX: 0,
              gridY: 0,
              gridW: 12,
              gridH: 1,
            },
          ],
        });

      const formId = formRes.body.id;

      const response = await request(app)
        .get(`/api/forms/${formId}/responses/export`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });
  });
});
