import { vi } from 'vitest';

export const mockFileService = {
  uploadFile: vi.fn().mockResolvedValue('https://res.cloudinary.com/test-cloud/image/upload/v1234567890/form-custom-uploads/test-image.jpg'),
  deleteFile: vi.fn().mockResolvedValue(undefined),
};

// Mock the file service module
vi.mock('../src/services/file.services', () => ({
  FileService: vi.fn().mockImplementation(() => mockFileService),
}));
