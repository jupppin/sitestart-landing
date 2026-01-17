/**
 * Tests for Admin Route Protection Middleware
 *
 * Tests that the middleware correctly protects admin routes
 * and allows access to the login page.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock jose
vi.mock('jose', () => ({
  jwtVerify: vi.fn(),
}));

import { middleware } from '@/middleware';
import { jwtVerify } from 'jose';

describe('Admin Middleware', () => {
  const mockJwtVerify = vi.mocked(jwtVerify);

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  function createRequest(path: string, cookie?: string): NextRequest {
    const url = `http://localhost${path}`;
    const request = new NextRequest(url);

    if (cookie) {
      // NextRequest cookies are read-only, so we need to create a new request with cookies
      const headers = new Headers();
      headers.set('cookie', `admin_session=${cookie}`);
      return new NextRequest(url, { headers });
    }

    return request;
  }

  describe('Non-admin routes', () => {
    it('should allow access to non-admin routes', async () => {
      const request = createRequest('/');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should allow access to public API routes', async () => {
      const request = createRequest('/api/intake');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Login page', () => {
    it('should allow access to login page without authentication', async () => {
      const request = createRequest('/admin/login');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should redirect authenticated users from login to dashboard', async () => {
      mockJwtVerify.mockResolvedValue({ payload: { role: 'admin' } } as never);

      const request = createRequest('/admin/login', 'valid-token');
      const response = await middleware(request);

      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toBe(
        'http://localhost/admin/dashboard'
      );
    });

    it('should allow access to login if token is invalid', async () => {
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      const request = createRequest('/admin/login', 'invalid-token');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Protected admin routes', () => {
    it('should redirect to login when no token is present', async () => {
      const request = createRequest('/admin/dashboard');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost/admin/login'
      );
    });

    it('should redirect to login when token is invalid', async () => {
      mockJwtVerify.mockRejectedValue(new Error('Invalid token'));

      const request = createRequest('/admin/dashboard', 'invalid-token');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost/admin/login'
      );
    });

    it('should allow access when token is valid', async () => {
      mockJwtVerify.mockResolvedValue({ payload: { role: 'admin' } } as never);

      const request = createRequest('/admin/dashboard', 'valid-token');
      const response = await middleware(request);

      expect(response.status).toBe(200);
    });

    it('should protect nested admin routes', async () => {
      const request = createRequest('/admin/leads/123');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost/admin/login'
      );
    });

    it('should protect admin API routes', async () => {
      const request = createRequest('/admin/customers');
      const response = await middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toBe(
        'http://localhost/admin/login'
      );
    });
  });
});
