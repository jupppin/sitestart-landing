/**
 * Tests for JWT Session Utilities
 *
 * Tests the core authentication functions: token creation, verification,
 * and password validation.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock next/headers before importing session utilities
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

// Import after mocking
import {
  createSession,
  verifySession,
  validatePassword,
} from '@/lib/auth/session';

describe('Session Utilities', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables before each test
    vi.resetModules();
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long',
      ADMIN_PASSWORD: 'test-admin-password',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a valid JWT token', async () => {
      const token = await createSession();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      // JWT tokens have 3 parts separated by dots
      expect(token.split('.')).toHaveLength(3);
    });

    it('should throw error when JWT_SECRET is not set', async () => {
      delete process.env.JWT_SECRET;

      await expect(createSession()).rejects.toThrow(
        'JWT_SECRET environment variable is not set'
      );
    });

    it('should throw error when JWT_SECRET is too short', async () => {
      process.env.JWT_SECRET = 'short';

      await expect(createSession()).rejects.toThrow(
        'JWT_SECRET must be at least 32 characters long'
      );
    });
  });

  describe('verifySession', () => {
    it('should verify a valid token', async () => {
      const token = await createSession();
      const result = await verifySession(token);

      expect(result.isValid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.role).toBe('admin');
    });

    it('should reject an invalid token', async () => {
      const result = await verifySession('invalid-token');

      expect(result.isValid).toBe(false);
      expect(result.payload).toBeUndefined();
    });

    it('should reject a token signed with different secret', async () => {
      const token = await createSession();

      // Change the secret
      process.env.JWT_SECRET = 'different-secret-that-is-at-least-32-characters';

      const result = await verifySession(token);

      expect(result.isValid).toBe(false);
    });

    it('should reject a malformed token', async () => {
      // Test with a token that has invalid structure
      const result = await verifySession('eyJhbGciOiJIUzI1NiJ9.invalid.signature');

      expect(result.isValid).toBe(false);
    });

    it('should reject an empty token', async () => {
      const result = await verifySession('');

      expect(result.isValid).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should return true for correct password', () => {
      const result = validatePassword('test-admin-password');

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', () => {
      const result = validatePassword('wrong-password');

      expect(result).toBe(false);
    });

    it('should return false when ADMIN_PASSWORD is not set', () => {
      delete process.env.ADMIN_PASSWORD;

      const result = validatePassword('any-password');

      expect(result).toBe(false);
    });

    it('should return false for empty password', () => {
      const result = validatePassword('');

      expect(result).toBe(false);
    });
  });
});
