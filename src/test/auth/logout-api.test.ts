/**
 * Tests for Logout API Route
 *
 * Tests the POST /api/admin/auth/logout endpoint.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the session utilities
vi.mock('@/lib/auth/session', () => ({
  clearSessionCookie: vi.fn(),
}));

import { POST } from '@/app/api/admin/auth/logout/route';
import { clearSessionCookie } from '@/lib/auth/session';

describe('Logout API Route', () => {
  const mockClearSessionCookie = vi.mocked(clearSessionCookie);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 200 and clear cookie on successful logout', async () => {
    mockClearSessionCookie.mockResolvedValue(undefined);

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Logout successful');
    expect(mockClearSessionCookie).toHaveBeenCalled();
  });

  it('should return 500 when an error occurs', async () => {
    mockClearSessionCookie.mockRejectedValue(new Error('Test error'));

    const response = await POST();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.message).toBe('An error occurred during logout');
  });
});
