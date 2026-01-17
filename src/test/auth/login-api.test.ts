/**
 * Tests for Login API Route
 *
 * Tests the POST /api/admin/auth/login endpoint.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the session utilities
vi.mock('@/lib/auth/session', () => ({
  validatePassword: vi.fn(),
  createSession: vi.fn(),
  setSessionCookie: vi.fn(),
}));

import { POST } from '@/app/api/admin/auth/login/route';
import { validatePassword, createSession, setSessionCookie } from '@/lib/auth/session';

describe('Login API Route', () => {
  const mockValidatePassword = vi.mocked(validatePassword);
  const mockCreateSession = vi.mocked(createSession);
  const mockSetSessionCookie = vi.mocked(setSessionCookie);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 400 when password is not provided', async () => {
    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Password is required');
  });

  it('should return 400 when password is not a string', async () => {
    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 123 }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Password is required');
  });

  it('should return 401 for invalid password', async () => {
    mockValidatePassword.mockReturnValue(false);

    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrong-password' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toBe('Invalid password');
    expect(mockValidatePassword).toHaveBeenCalledWith('wrong-password');
  });

  it('should return 200 and set cookie for valid password', async () => {
    mockValidatePassword.mockReturnValue(true);
    mockCreateSession.mockResolvedValue('mock-jwt-token');
    mockSetSessionCookie.mockResolvedValue(undefined);

    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'correct-password' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login successful');
    expect(mockValidatePassword).toHaveBeenCalledWith('correct-password');
    expect(mockCreateSession).toHaveBeenCalled();
    expect(mockSetSessionCookie).toHaveBeenCalledWith('mock-jwt-token');
  });

  it('should return 500 when an error occurs', async () => {
    mockValidatePassword.mockReturnValue(true);
    mockCreateSession.mockRejectedValue(new Error('Test error'));

    const request = new Request('http://localhost/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'correct-password' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('An error occurred during login');
  });
});
