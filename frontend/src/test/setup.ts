import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock environment variables
globalThis.import = {
  meta: {
    env: {
      VITE_API_MODE: 'mock',
      VITE_MOCK_API_URL: 'http://localhost:3001',
      VITE_EDC_API_URL: 'http://localhost:3002',
    },
  },
} as any;

// Mock fetch globally
global.fetch = vi.fn();

// Automatic cleanup after each test
afterEach(() => {
  cleanup();
});
