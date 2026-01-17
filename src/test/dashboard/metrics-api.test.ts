/**
 * Tests for Metrics API Route
 *
 * Tests the GET /api/admin/metrics endpoint.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the session utilities
vi.mock('@/lib/auth/session', () => ({
  isAuthenticated: vi.fn(),
}));

// Mock the database queries
vi.mock('@/lib/admin/queries', () => ({
  getDashboardMetrics: vi.fn(),
  getRecentActivity: vi.fn(),
}));

import { GET } from '@/app/api/admin/metrics/route';
import { isAuthenticated } from '@/lib/auth/session';
import { getDashboardMetrics, getRecentActivity } from '@/lib/admin/queries';

describe('Metrics API Route - GET', () => {
  const mockIsAuthenticated = vi.mocked(isAuthenticated);
  const mockGetDashboardMetrics = vi.mocked(getDashboardMetrics);
  const mockGetRecentActivity = vi.mocked(getRecentActivity);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(false);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return metrics and activity when authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetDashboardMetrics.mockResolvedValue({
      totalLeads: 50,
      newLeads: 20,
      contactedLeads: 15,
      payingCustomers: 10,
      totalRevenue: 25000,
      conversionRate: 20.0,
    });
    mockGetRecentActivity.mockResolvedValue([
      {
        id: 1,
        type: 'submission',
        description: 'New submission from Test Business',
        businessName: 'Test Business',
        timestamp: new Date(),
        status: 'NEW',
      },
      {
        id: 2,
        type: 'payment',
        description: 'Payment received from Another Business - $5,000',
        businessName: 'Another Business',
        timestamp: new Date(),
        status: 'PAID',
      },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metrics).toEqual({
      totalLeads: 50,
      newLeads: 20,
      contactedLeads: 15,
      payingCustomers: 10,
      totalRevenue: 25000,
      conversionRate: 20.0,
    });
    expect(data.data.recentActivity).toHaveLength(2);
    expect(mockGetDashboardMetrics).toHaveBeenCalled();
    expect(mockGetRecentActivity).toHaveBeenCalledWith(10);
  });

  it('should handle empty activity list', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetDashboardMetrics.mockResolvedValue({
      totalLeads: 0,
      newLeads: 0,
      contactedLeads: 0,
      payingCustomers: 0,
      totalRevenue: 0,
      conversionRate: 0,
    });
    mockGetRecentActivity.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.metrics.totalLeads).toBe(0);
    expect(data.data.recentActivity).toEqual([]);
  });

  it('should handle database errors gracefully', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetDashboardMetrics.mockRejectedValue(new Error('Database error'));

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Failed to fetch metrics');
  });

  it('should return correct conversion rate calculation', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetDashboardMetrics.mockResolvedValue({
      totalLeads: 100,
      newLeads: 50,
      contactedLeads: 30,
      payingCustomers: 20,
      totalRevenue: 100000,
      conversionRate: 20.0, // 20/100 * 100
    });
    mockGetRecentActivity.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.metrics.conversionRate).toBe(20.0);
  });

  it('should include all activity types in response', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetDashboardMetrics.mockResolvedValue({
      totalLeads: 10,
      newLeads: 3,
      contactedLeads: 4,
      payingCustomers: 3,
      totalRevenue: 15000,
      conversionRate: 30.0,
    });
    mockGetRecentActivity.mockResolvedValue([
      {
        id: 1,
        type: 'submission',
        description: 'New submission',
        businessName: 'Business 1',
        timestamp: new Date(),
        status: 'NEW',
      },
      {
        id: 2,
        type: 'status_change',
        description: 'Status changed to contacted',
        businessName: 'Business 2',
        timestamp: new Date(),
        status: 'CONTACTED',
      },
      {
        id: 3,
        type: 'payment',
        description: 'Payment received',
        businessName: 'Business 3',
        timestamp: new Date(),
        status: 'PAID',
      },
    ]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.recentActivity).toHaveLength(3);
    expect(data.data.recentActivity.map((a: { type: string }) => a.type)).toEqual([
      'submission',
      'status_change',
      'payment',
    ]);
  });
});
