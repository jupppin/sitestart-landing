/**
 * Tests for Leads API Routes
 *
 * Tests the lead-specific functionality of the submissions API routes.
 * Focuses on filtering leads (NEW and CONTACTED status) and status transitions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Prisma - using factory with hoisted mock
vi.mock('@/lib/db', () => {
  const mockIntakeSubmission = {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
  };
  return {
    prisma: {
      intakeSubmission: mockIntakeSubmission,
    },
  };
});

// Mock authentication
vi.mock('@/lib/auth/session', () => ({
  isAuthenticated: vi.fn().mockResolvedValue(true),
}));

// Import after mocks are set up
import { prisma } from '@/lib/db';
import { getLeads, getSubmissionById, updateSubmission } from '@/lib/admin/queries';
import type { SubmissionStatus } from '@/types/admin';

// Cast to get access to mock methods
const mockPrismaSubmission = prisma.intakeSubmission as unknown as {
  findMany: ReturnType<typeof vi.fn>;
  findUnique: ReturnType<typeof vi.fn>;
  count: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

describe('Leads API - Query Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLeads', () => {
    const mockSubmissions = [
      {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        businessName: 'Johns Shop',
        status: 'NEW',
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
      },
      {
        id: 2,
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        businessName: 'Janes Store',
        status: 'CONTACTED',
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-16'),
      },
    ];

    it('returns only NEW and CONTACTED submissions', async () => {
      mockPrismaSubmission.count.mockResolvedValue(2);
      mockPrismaSubmission.findMany.mockResolvedValue(mockSubmissions);

      const result = await getLeads(1, 10);

      expect(mockPrismaSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: { in: ['NEW', 'CONTACTED'] },
          },
        })
      );

      expect(result.items).toHaveLength(2);
      expect(result.items[0].status).toBe('NEW');
      expect(result.items[1].status).toBe('CONTACTED');
    });

    it('applies search filter correctly', async () => {
      mockPrismaSubmission.count.mockResolvedValue(1);
      mockPrismaSubmission.findMany.mockResolvedValue([mockSubmissions[0]]);

      await getLeads(1, 10, 'john');

      expect(mockPrismaSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: { in: ['NEW', 'CONTACTED'] },
            OR: [
              { fullName: { contains: 'john' } },
              { email: { contains: 'john' } },
              { businessName: { contains: 'john' } },
            ],
          },
        })
      );
    });

    it('returns correct pagination info', async () => {
      mockPrismaSubmission.count.mockResolvedValue(25);
      mockPrismaSubmission.findMany.mockResolvedValue(mockSubmissions);

      const result = await getLeads(2, 10);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(25);
      expect(result.totalPages).toBe(3);
    });

    it('orders by createdAt descending', async () => {
      mockPrismaSubmission.count.mockResolvedValue(2);
      mockPrismaSubmission.findMany.mockResolvedValue(mockSubmissions);

      await getLeads(1, 10);

      expect(mockPrismaSubmission.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('getSubmissionById', () => {
    it('returns submission when found', async () => {
      const mockSubmission = {
        id: 1,
        fullName: 'John Doe',
        email: 'john@example.com',
        businessName: 'Johns Shop',
        status: 'NEW',
      };

      mockPrismaSubmission.findUnique.mockResolvedValue(mockSubmission);

      const result = await getSubmissionById(1);

      expect(result).toEqual(mockSubmission);
      expect(mockPrismaSubmission.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('returns null when not found', async () => {
      mockPrismaSubmission.findUnique.mockResolvedValue(null);

      const result = await getSubmissionById(999);

      expect(result).toBeNull();
    });
  });

  describe('updateSubmission', () => {
    const mockSubmission = {
      id: 1,
      fullName: 'John Doe',
      email: 'john@example.com',
      businessName: 'Johns Shop',
      status: 'NEW',
      notes: null,
      revenue: null,
      paidAt: null,
    };

    beforeEach(() => {
      mockPrismaSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'CONTACTED',
        contacted: true,
      });
    });

    it('updates status to CONTACTED', async () => {
      await updateSubmission(1, { status: 'CONTACTED' as SubmissionStatus });

      expect(mockPrismaSubmission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'CONTACTED',
          contacted: true,
        }),
      });
    });

    it('sets paidAt when status changes to PAID', async () => {
      mockPrismaSubmission.update.mockResolvedValue({
        ...mockSubmission,
        status: 'PAID',
        paidAt: new Date(),
        revenue: 1500,
      });

      await updateSubmission(1, { status: 'PAID' as SubmissionStatus, revenue: 1500 });

      expect(mockPrismaSubmission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          status: 'PAID',
          paidAt: expect.any(Date),
        }),
      });
    });

    it('updates notes', async () => {
      mockPrismaSubmission.update.mockResolvedValue({
        ...mockSubmission,
        notes: 'Updated notes',
      });

      await updateSubmission(1, { notes: 'Updated notes' });

      expect(mockPrismaSubmission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          notes: 'Updated notes',
        },
      });
    });

    it('updates revenue', async () => {
      mockPrismaSubmission.update.mockResolvedValue({
        ...mockSubmission,
        revenue: 2500,
      });

      await updateSubmission(1, { revenue: 2500 });

      expect(mockPrismaSubmission.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          revenue: 2500,
        },
      });
    });
  });
});

describe('Lead Status Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('follows correct status progression: NEW -> CONTACTED -> PAID', async () => {
    const mockLead = {
      id: 1,
      status: 'NEW',
      contacted: false,
      paidAt: null,
      revenue: null,
    };

    // Update to CONTACTED
    mockPrismaSubmission.update.mockResolvedValue({
      ...mockLead,
      status: 'CONTACTED',
      contacted: true,
    });

    const contactedResult = await updateSubmission(1, { status: 'CONTACTED' as SubmissionStatus });
    expect(contactedResult.status).toBe('CONTACTED');
    expect(contactedResult.contacted).toBe(true);

    // Update to PAID
    mockPrismaSubmission.update.mockResolvedValue({
      ...mockLead,
      status: 'PAID',
      contacted: true,
      paidAt: new Date(),
      revenue: 1000,
    });

    const paidResult = await updateSubmission(1, { status: 'PAID' as SubmissionStatus, revenue: 1000 });
    expect(paidResult.status).toBe('PAID');
    expect(paidResult.paidAt).toBeDefined();
    expect(paidResult.revenue).toBe(1000);
  });

  it('allows direct transition from NEW to PAID', async () => {
    mockPrismaSubmission.update.mockResolvedValue({
      id: 1,
      status: 'PAID',
      contacted: false,
      paidAt: new Date(),
      revenue: 500,
    });

    const result = await updateSubmission(1, { status: 'PAID' as SubmissionStatus, revenue: 500 });

    expect(result.status).toBe('PAID');
    expect(result.revenue).toBe(500);
  });
});

describe('Lead Filtering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('excludes PAID submissions from leads list', async () => {
    // Only NEW and CONTACTED should be included
    mockPrismaSubmission.count.mockResolvedValue(2);
    mockPrismaSubmission.findMany.mockResolvedValue([
      { id: 1, status: 'NEW' },
      { id: 2, status: 'CONTACTED' },
    ]);

    await getLeads(1, 10);

    expect(mockPrismaSubmission.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: { in: ['NEW', 'CONTACTED'] },
        },
      })
    );

    // Should not include PAID status in filter
    const callArgs = mockPrismaSubmission.findMany.mock.calls[0][0];
    expect(callArgs.where.status.in).not.toContain('PAID');
  });
});
