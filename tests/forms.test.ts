import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

const TEST_PASSWORD = 'Password123';
let authToken: string;
let userEmail: string;

describe('Form Endpoints', () => {
  beforeEach(async () => {
    userEmail = `test-forms-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

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

  describe('POST /api/forms', () => {
    it('should create a form successfully', async () => {
      const response = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
          description: 'A test form',
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
              required: true,
              gridX: 0,
              gridY: 1,
              gridW: 6,
              gridH: 1,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe('Test Form');
      expect(response.body.fields).toHaveLength(2);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app)
        .post('/api/forms')
        .send({ title: 'Test' });

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Empty title
          fields: [], // No fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/forms', () => {
    it('should list forms with pagination', async () => {
      // Create a form first
      await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
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

      const response = await request(app)
        .get('/api/forms')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/forms/:formId', () => {
    it('should get form by ID', async () => {
      // Create a form
      const createRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
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

      const formId = createRes.body.id;

      const response = await request(app)
        .get(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(formId);
      expect(response.body.fields).toHaveLength(1);
    });

    it('should return 404 for non-existent form', async () => {
      const response = await request(app)
        .get('/api/forms/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/forms/:formId', () => {
    it('should update form', async () => {
      // Create a form
      const createRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Original Title',
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

      const formId = createRes.body.id;

      const response = await request(app)
        .patch(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Title',
        });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });
  });

  describe('PATCH /api/forms/:formId/publish', () => {
    it('should publish form', async () => {
      // Create a form
      const createRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
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

      const formId = createRes.body.id;

      const response = await request(app)
        .patch(`/api/forms/${formId}/publish`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.isPublished).toBe(true);
    });
  });

  describe('Field Endpoints', () => {
    it('should add, update, and delete a field', async () => {
      // Create a form
      const createRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
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

      const formId = createRes.body.id;

      // Add a field
      const addRes = await request(app)
        .post(`/api/forms/${formId}/fields`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label: 'Phone',
          type: 'TEXT',
          required: false,
          gridX: 0,
          gridY: 1,
          gridW: 6,
          gridH: 1,
        });

      expect(addRes.status).toBe(201);
      const fieldId = addRes.body.id;

      // Update the field
      const updateRes = await request(app)
        .patch(`/api/forms/${formId}/fields/${fieldId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          label: 'Updated Phone',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.label).toBe('Updated Phone');

      // Delete the field
      const deleteRes = await request(app)
        .delete(`/api/forms/${formId}/fields/${fieldId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(204);
    });
  });

  describe('GET /api/forms/:formId/stats', () => {
    it('should get form statistics', async () => {
      // Create a form
      const createRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
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

      const formId = createRes.body.id;

      const response = await request(app)
        .get(`/api/forms/${formId}/stats`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalResponses');
      expect(response.body).toHaveProperty('responsesByDay');
    });
  });

  describe('DELETE /api/forms/:formId', () => {
    it('should delete form', async () => {
      // Create a form
      const createRes = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Form',
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

      const formId = createRes.body.id;

      const response = await request(app)
        .delete(`/api/forms/${formId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
