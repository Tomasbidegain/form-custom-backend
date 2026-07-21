import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import prisma from '../src/config/database';
import path from 'path';
import fs from 'fs';

const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Password123';
let authToken: string;

describe('File Endpoints', () => {
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
