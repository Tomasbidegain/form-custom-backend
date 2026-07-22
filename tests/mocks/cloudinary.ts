import { vi } from 'vitest';

export const mockUploader = {
  upload_stream: vi.fn((options, callback) => {
    return {
      end: (buffer: Buffer) => {
        callback(null, {
          secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/form-custom-uploads/test-image.jpg',
          public_id: 'form-custom-uploads/test-image',
        });
      },
      on: vi.fn(),
    };
  }),
  destroy: vi.fn((publicId, callback) => {
    callback(null, { result: 'ok' });
  }),
};

// Mock the 'cloudinary' package - v2 is what gets imported
vi.mock('cloudinary', () => ({
  v2: {
    config: vi.fn(),
    uploader: mockUploader,
  },
}));
