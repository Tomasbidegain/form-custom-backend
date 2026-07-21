import { vi } from 'vitest';

// Mock Cloudinary before it's imported
const mockCloudinary = {
  v2: {
    config: vi.fn(),
    uploader: {
      upload_stream: vi.fn((options, callback) => {
        // Simulate successful upload
        const mockResult = {
          secure_url: 'https://res.cloudinary.com/test-cloud/image/upload/v1234567890/form-custom-uploads/test-image.jpg',
          public_id: 'form-custom-uploads/test-image',
        };
        
        // Call the callback with mock result
        setTimeout(() => callback(null, mockResult), 10);
        
        return {
          end: vi.fn(),
        };
      }),
      destroy: vi.fn((publicId, callback) => {
        // Simulate successful deletion
        setTimeout(() => callback(null, { result: 'ok' }), 10);
        return { result: 'ok' };
      }),
    },
  },
};

vi.mock('cloudinary', () => mockCloudinary);

export { mockCloudinary };
