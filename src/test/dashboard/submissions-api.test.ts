/**
 * Tests for Submissions API Routes
 *
 * Tests the GET /api/admin/submissions endpoint.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the session utilities
vi.mock('@/lib/auth/session', () => ({
  isAuthenticated: vi.fn(),
}));

// Mock the database queries
vi.mock('@/lib/admin/queries', () => ({
  getSubmissions: vi.fn(),
}));

import { GET } from '@/app/api/admin/submissions/route';
import { isAuthenticated } from '@/lib/auth/session';
import { getSubmissions } from '@/lib/admin/queries';

// Helper to create NextRequest with URL
function createRequest(url: string): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'));
}

describe('Submissions API Route - GET', () => {
  const mockIsAuthenticated = vi.mocked(isAuthenticated);
  const mockGetSubmissions = vi.mocked(getSubmissions);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(false);

    const request = createRequest('/api/admin/submissions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return paginated submissions when authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissions.mockResolvedValue({
      items: [
        {
          id: 1,
          fullName: 'Test User',
          email: 'test@example.com',
          businessName: 'Test Business',
          status: 'NEW',
          createdAt: new Date(),
          updatedAt: new Date(),
          phone: null,
          industryType: 'Technology',
          currentWebsite: null,
          hasNoWebsite: false,
          features: '[]',
          otherFeatures: null,
          budgetRange: '$1000-$5000',
          timeline: '1-2 months',
          additionalInfo: null,
          contacted: false,
          notes: null,
          paidAt: null,
          revenue: null,
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    const request = createRequest('/api/admin/submissions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.items).toHaveLength(1);
    expect(data.data.total).toBe(1);
    expect(mockGetSubmissions).toHaveBeenCalledWith({}, 1, 10);
  });

  it('should filter by status when provided', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissions.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const request = createRequest('/api/admin/submissions?status=CONTACTED');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockGetSubmissions).toHaveBeenCalledWith({ status: 'CONTACTED' }, 1, 10);
  });

  it('should return 400 for invalid status', async () => {
    mockIsAuthenticated.mockResolvedValue(true);

    const request = createRequest('/api/admin/submissions?status=INVALID');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid status');
  });

  it('should handle search parameter', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissions.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const request = createRequest('/api/admin/submissions?search=test');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetSubmissions).toHaveBeenCalledWith({ search: 'test' }, 1, 10);
  });

  it('should handle pagination parameters', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissions.mockResolvedValue({
      items: [],
      total: 50,
      page: 2,
      limit: 20,
      totalPages: 3,
    });

    const request = createRequest('/api/admin/submissions?page=2&limit=20');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.page).toBe(2);
    expect(data.data.limit).toBe(20);
    expect(mockGetSubmissions).toHaveBeenCalledWith({}, 2, 20);
  });

  it('should cap limit at maximum (100)', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissions.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 100,
      totalPages: 0,
    });

    const request = createRequest('/api/admin/submissions?limit=500');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(mockGetSubmissions).toHaveBeenCalledWith({}, 1, 100);
  });

  it('should handle database errors gracefully', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissions.mockRejectedValue(new Error('Database error'));

    const request = createRequest('/api/admin/submissions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch submissions');
  });
});
