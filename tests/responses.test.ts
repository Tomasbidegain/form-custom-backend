import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

const TEST_EMAIL = `test-responses-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;
const TEST_PASSWORD = 'Password123';
let authToken: string;
let testFormId: string;
let testFieldId: string;
let testResponseId: string;

describe('Response Endpoints', () => {
  beforeAll(async () => {
    // Create and verify user
    await request(app).post('/api/auth/register').send({
      email: TEST_EMAIL,
      name: 'Test',
      lastName: 'User',
      password: TEST_PASSWORD,
    });

    await prisma.user.update({
      where: { email: TEST_EMAIL },
      data: { isVerified: true, verificationToken: null, verificationExpires: null },
    });

    const loginRes = await request(app).post('/api/auth/login').send({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });

    authToken = loginRes.body.token;

    // Create and publish a form
    const formRes = await request(app)
      .post('/api/forms')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Response Test Form',
        captchaEnabled: false, // Disable captcha for testing
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
          {
            label: 'Email',
            type: 'EMAIL',
            required: false,
            gridX: 0,
            gridY: 1,
            gridW: 12,
            gridH: 1,
          },
        ],
      });

    testFormId = formRes.body.id;
    testFieldId = formRes.body.fields[0].id;

    // Publish the form
    await request(app)
      .patch(`/api/forms/${testFormId}/publish`)
      .set('Authorization', `Bearer ${authToken}`);
  });

  afterAll(async () => {
    // Delete in order to avoid foreign key constraints
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
    await prisma.$disconnect();
  });

  describe('POST /api/forms/:formId/responses', () => {
    it('should submit a response successfully', async () => {
      const response = await request(app)
        .post(`/api/forms/${testFormId}/responses`)
        .send({
          email: 'responder@example.com',
          fields: [
            { fieldId: testFieldId, value: 'John Doe' },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.fields).toHaveLength(1);
      
      testResponseId = response.body.id;
    });

    it('should return 400 for unpublished form', async () => {
      // Create an unpublished form
      const unpublishedRes = await request(app)
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

      const response = await request(app)
        .post(`/api/forms/${unpublishedRes.body.id}/responses`)
        .send({
          fields: [{ fieldId: unpublishedRes.body.fields[0].id, value: 'test' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('FORM_NOT_PUBLISHED');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post(`/api/forms/${testFormId}/responses`)
        .send({
          fields: [], // Missing required field
        });

      expect(response.status).toBe(400);
      // Could be INVALID_DATA (from Zod validation) or INVALID_FIELD_VALUE (from service validation)
      expect(['INVALID_DATA', 'INVALID_FIELD_VALUE']).toContain(response.body.code);
    });

    it('should return 404 for non-existent form', async () => {
      const response = await request(app)
        .post('/api/forms/non-existent-id/responses')
        .send({
          fields: [{ fieldId: testFieldId, value: 'test' }],
        });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/forms/:formId/responses', () => {
    it('should list responses with pagination', async () => {
      const response = await request(app)
        .get(`/api/forms/${testFormId}/responses`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 without auth', async () => {
      const response = await request(app)
        .get(`/api/forms/${testFormId}/responses`);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/forms/:formId/responses/:responseId', () => {
    it('should get response by ID', async () => {
      const response = await request(app)
        .get(`/api/forms/${testFormId}/responses/${testResponseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(testResponseId);
    });

    it('should return 404 for non-existent response', async () => {
      const response = await request(app)
        .get(`/api/forms/${testFormId}/responses/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/forms/:formId/responses/export', () => {
    it('should export responses as CSV', async () => {
      const response = await request(app)
        .get(`/api/forms/${testFormId}/responses/export`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.text).toContain('Response ID');
    });
  });

  describe('DELETE /api/forms/:formId/responses/:responseId', () => {
    it('should delete a response', async () => {
      const response = await request(app)
        .delete(`/api/forms/${testFormId}/responses/${testResponseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
