/**
 * Tests for Submission Detail API Routes
 *
 * Tests the GET and PATCH /api/admin/submissions/[id] endpoints.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the session utilities
vi.mock('@/lib/auth/session', () => ({
  isAuthenticated: vi.fn(),
}));

// Mock the database queries
vi.mock('@/lib/admin/queries', () => ({
  getSubmissionById: vi.fn(),
  updateSubmission: vi.fn(),
}));

import { GET, PATCH } from '@/app/api/admin/submissions/[id]/route';
import { isAuthenticated } from '@/lib/auth/session';
import { getSubmissionById, updateSubmission } from '@/lib/admin/queries';

// Helper to create NextRequest with URL
function createRequest(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }): NextRequest {
  return new NextRequest(new URL(url, 'http://localhost'), init);
}

// Helper to create mock submission
const createMockSubmission = (overrides = {}) => ({
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
  ...overrides,
});

describe('Submission Detail API Route - GET', () => {
  const mockIsAuthenticated = vi.mocked(isAuthenticated);
  const mockGetSubmissionById = vi.mocked(getSubmissionById);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(false);

    const request = createRequest('/api/admin/submissions/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid submission ID', async () => {
    mockIsAuthenticated.mockResolvedValue(true);

    const request = createRequest('/api/admin/submissions/invalid');
    const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid submission ID');
  });

  it('should return 404 when submission not found', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissionById.mockResolvedValue(null);

    const request = createRequest('/api/admin/submissions/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Submission not found');
  });

  it('should return submission when found', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    const mockSubmission = createMockSubmission();
    mockGetSubmissionById.mockResolvedValue(mockSubmission);

    const request = createRequest('/api/admin/submissions/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.id).toBe(1);
    expect(data.data.fullName).toBe('Test User');
    expect(mockGetSubmissionById).toHaveBeenCalledWith(1);
  });
});

describe('Submission Detail API Route - PATCH', () => {
  const mockIsAuthenticated = vi.mocked(isAuthenticated);
  const mockGetSubmissionById = vi.mocked(getSubmissionById);
  const mockUpdateSubmission = vi.mocked(updateSubmission);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should return 401 when not authenticated', async () => {
    mockIsAuthenticated.mockResolvedValue(false);

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
  });

  it('should return 404 when submission not found', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissionById.mockResolvedValue(null);

    const request = createRequest('/api/admin/submissions/999', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Submission not found');
  });

  it('should return 400 for invalid status', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissionById.mockResolvedValue(createMockSubmission());

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'INVALID' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid status');
  });

  it('should require revenue when setting status to PAID', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissionById.mockResolvedValue(createMockSubmission());

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Revenue is required when setting status to PAID');
  });

  it('should update status successfully', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    const originalSubmission = createMockSubmission();
    const updatedSubmission = createMockSubmission({ status: 'CONTACTED', contacted: true });
    mockGetSubmissionById.mockResolvedValue(originalSubmission);
    mockUpdateSubmission.mockResolvedValue(updatedSubmission);

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CONTACTED' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.status).toBe('CONTACTED');
    expect(mockUpdateSubmission).toHaveBeenCalledWith(1, { status: 'CONTACTED' });
  });

  it('should update notes successfully', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    const originalSubmission = createMockSubmission();
    const updatedSubmission = createMockSubmission({ notes: 'Test note' });
    mockGetSubmissionById.mockResolvedValue(originalSubmission);
    mockUpdateSubmission.mockResolvedValue(updatedSubmission);

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: 'Test note' }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateSubmission).toHaveBeenCalledWith(1, { notes: 'Test note' });
  });

  it('should update to PAID status with revenue', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    const originalSubmission = createMockSubmission();
    const updatedSubmission = createMockSubmission({
      status: 'PAID',
      revenue: 5000,
      paidAt: new Date(),
    });
    mockGetSubmissionById.mockResolvedValue(originalSubmission);
    mockUpdateSubmission.mockResolvedValue(updatedSubmission);

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'PAID', revenue: 5000 }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockUpdateSubmission).toHaveBeenCalledWith(1, { status: 'PAID', revenue: 5000 });
  });

  it('should return 400 for negative revenue', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissionById.mockResolvedValue(createMockSubmission());

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ revenue: -100 }),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Revenue must be a positive number or null');
  });

  it('should return 400 when no valid fields to update', async () => {
    mockIsAuthenticated.mockResolvedValue(true);
    mockGetSubmissionById.mockResolvedValue(createMockSubmission());

    const request = createRequest('/api/admin/submissions/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const response = await PATCH(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('No valid fields to update');
  });
});
