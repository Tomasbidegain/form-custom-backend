import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'path';
import fs from 'fs';

// Mock FileService BEFORE importing app
vi.mock('../src/services/file.services', () => {
  return {
    FileService: class MockFileService {
      uploadFile = async () => 'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/form-custom-uploads/test-image.jpg';
      deleteFile = async () => undefined;
    },
  };
});

// Now import app (mocks are already set up)
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';

const TEST_PASSWORD = 'Password123';
let authToken: string;
let userEmail: string;

describe('File Endpoints', () => {
  beforeEach(async () => {
    userEmail = `test-files-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`;

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

  describe('POST /api/files/upload', () => {
    it('should upload a file successfully', async () => {
      // Create a temporary test file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      // Clean up test file
      fs.unlinkSync(testFilePath);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('url');
      expect(response.body.url).toContain('cloudinary.com');
    });

    it('should return 400 without file', async () => {
      const response = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('FILE_REQUIRED');
    });

    it('should return 401 without auth', async () => {
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const response = await request(app)
        .post('/api/files/upload')
        .attach('file', testFilePath);

      fs.unlinkSync(testFilePath);

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/files', () => {
    it('should delete a file', async () => {
      // First upload a file
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      const uploadRes = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', testFilePath);

      fs.unlinkSync(testFilePath);

      const fileUrl = uploadRes.body.url;

      // Then delete it
      const response = await request(app)
        .delete('/api/files')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ url: fileUrl });

      expect(response.status).toBe(204);
    });
  });
});
