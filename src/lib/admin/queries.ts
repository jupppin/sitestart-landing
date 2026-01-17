/**
 * Admin Database Queries
 *
 * Centralized database query functions for the admin section.
 * All queries use Prisma client for type-safe database access.
 */

import { prisma } from '@/lib/db';
import type { SubmissionStatus, PaginatedResponse, SubmissionFilters } from '@/types/admin';

// Type for IntakeSubmission from Prisma
export type Submission = {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
  email: string;
  phone: string | null;
  businessName: string;
  industryType: string;
  currentWebsite: string | null;
  hasNoWebsite: boolean;
  features: string;
  otherFeatures: string | null;
  budgetRange: string;
  timeline: string;
  additionalInfo: string | null;
  status: string;
  contacted: boolean;
  notes: string | null;
  paidAt: Date | null;
  revenue: number | null;
};

// Dashboard metrics type
export interface DashboardMetrics {
  totalLeads: number;
  newLeads: number;
  contactedLeads: number;
  payingCustomers: number;
  totalRevenue: number;
  conversionRate: number;
}

// Recent activity item type
export interface RecentActivity {
  id: number;
  type: 'submission' | 'status_change' | 'payment';
  description: string;
  businessName: string;
  timestamp: Date;
  status: SubmissionStatus;
}

/**
 * Get paginated list of submissions with optional filters
 */
export async function getSubmissions(
  filters: SubmissionFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<Submission>> {
  const skip = (page - 1) * limit;

  // Build where clause based on filters
  const where: {
    status?: string;
    OR?: Array<{
      fullName?: { contains: string };
      email?: { contains: string };
      businessName?: { contains: string };
    }>;
  } = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search } },
      { email: { contains: filters.search } },
      { businessName: { contains: filters.search } },
    ];
  }

  // Execute count and find in parallel
  const [total, items] = await Promise.all([
    prisma.intakeSubmission.count({ where }),
    prisma.intakeSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get submissions filtered by status (for leads and customers pages)
 */
export async function getSubmissionsByStatus(
  statuses: SubmissionStatus[],
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<Submission>> {
  const skip = (page - 1) * limit;

  const where: {
    status: { in: string[] };
    OR?: Array<{
      fullName?: { contains: string };
      email?: { contains: string };
      businessName?: { contains: string };
    }>;
  } = {
    status: { in: statuses },
  };

  if (search) {
    where.OR = [
      { fullName: { contains: search } },
      { email: { contains: search } },
      { businessName: { contains: search } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.intakeSubmission.count({ where }),
    prisma.intakeSubmission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single submission by ID
 */
export async function getSubmissionById(id: number): Promise<Submission | null> {
  return prisma.intakeSubmission.findUnique({
    where: { id },
  });
}

/**
 * Update a submission
 */
export async function updateSubmission(
  id: number,
  data: {
    status?: SubmissionStatus;
    notes?: string;
    paidAt?: Date | null;
    revenue?: number | null;
    contacted?: boolean;
  }
): Promise<Submission> {
  // If status is changing to PAID, set paidAt if not provided
  if (data.status === 'PAID' && data.paidAt === undefined) {
    data.paidAt = new Date();
  }

  // If status is changing to CONTACTED, set contacted flag
  if (data.status === 'CONTACTED') {
    data.contacted = true;
  }

  return prisma.intakeSubmission.update({
    where: { id },
    data,
  });
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  // Execute all counts in parallel
  const [
    totalLeads,
    newLeads,
    contactedLeads,
    payingCustomers,
    revenueResult,
  ] = await Promise.all([
    prisma.intakeSubmission.count(),
    prisma.intakeSubmission.count({ where: { status: 'NEW' } }),
    prisma.intakeSubmission.count({ where: { status: 'CONTACTED' } }),
    prisma.intakeSubmission.count({ where: { status: 'PAID' } }),
    prisma.intakeSubmission.aggregate({
      _sum: { revenue: true },
      where: { status: 'PAID' },
    }),
  ]);

  const totalRevenue = revenueResult._sum.revenue || 0;
  const conversionRate = totalLeads > 0 ? (payingCustomers / totalLeads) * 100 : 0;

  return {
    totalLeads,
    newLeads,
    contactedLeads,
    payingCustomers,
    totalRevenue,
    conversionRate: Math.round(conversionRate * 10) / 10, // Round to 1 decimal
  };
}

/**
 * Get recent activity for the dashboard
 */
export async function getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
  // Get recent submissions ordered by most recent activity
  const submissions = await prisma.intakeSubmission.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      businessName: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      paidAt: true,
      revenue: true,
    },
  });

  // Transform submissions into activity items
  return submissions.map((submission) => {
    let type: RecentActivity['type'] = 'submission';
    let description = `New submission from ${submission.businessName}`;
    let timestamp = submission.createdAt;

    // Check if this is a payment (has paidAt date)
    if (submission.paidAt) {
      type = 'payment';
      const amount = submission.revenue
        ? ` - $${submission.revenue.toLocaleString()}`
        : '';
      description = `Payment received from ${submission.businessName}${amount}`;
      timestamp = submission.paidAt;
    }
    // Check if status was recently changed (updatedAt differs from createdAt)
    else if (
      submission.updatedAt.getTime() - submission.createdAt.getTime() > 1000 &&
      submission.status !== 'NEW'
    ) {
      type = 'status_change';
      description = `${submission.businessName} marked as ${submission.status.toLowerCase()}`;
      timestamp = submission.updatedAt;
    }

    return {
      id: submission.id,
      type,
      description,
      businessName: submission.businessName,
      timestamp,
      status: submission.status as SubmissionStatus,
    };
  });
}

/**
 * Get leads (NEW and CONTACTED status)
 */
export async function getLeads(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<Submission>> {
  return getSubmissionsByStatus(['NEW', 'CONTACTED'], page, limit, search);
}

/**
 * Get customers (PAID status)
 */
export async function getCustomers(
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<PaginatedResponse<Submission>> {
  return getSubmissionsByStatus(['PAID'], page, limit, search);
}
