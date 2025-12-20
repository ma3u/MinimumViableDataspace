import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock environment variables - use Object.defineProperty to avoid TypeScript errors
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_MODE: 'mock',
        VITE_MOCK_API_URL: 'http://localhost:3001',
        VITE_EDC_API_URL: 'http://localhost:3002',
      },
    },
  },
  writable: true,
});

// Mock fetch globally
global.fetch = vi.fn();

// Automatic cleanup after each test
afterEach(() => {
  cleanup();
});
