import { vi } from 'vitest';

// Mock Socket.io getIO function
const mockIO = {
  to: vi.fn().mockReturnThis(),
  emit: vi.fn(),
};

vi.mock('../src/config/socket', () => ({
  getIO: vi.fn(() => mockIO),
}));

export { mockIO };
