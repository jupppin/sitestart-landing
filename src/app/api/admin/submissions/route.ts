/**
 * Admin Submissions API Route
 *
 * GET /api/admin/submissions
 * Lists submissions with optional filters, search, and pagination.
 *
 * Query Parameters:
 * - status: Filter by submission status (NEW, CONTACTED, PAID)
 * - projectStatus: Filter by project status (NOT_STARTED, JUST_STARTED, IN_PROGRESS, etc.)
 * - search: Search in fullName, email, businessName
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10, max: 100)
 *
 * Authentication: Required (handled by middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { getSubmissions } from '@/lib/admin/queries';
import type { SubmissionStatus, ProjectStatus, SubmissionFilters, ProjectFilters } from '@/types/admin';

const VALID_STATUSES: SubmissionStatus[] = ['NEW', 'CONTACTED', 'PAID'];
const VALID_PROJECT_STATUSES: ProjectStatus[] = [
  'NOT_STARTED',
  'JUST_STARTED',
  'IN_PROGRESS',
  'WAITING_FOR_FEEDBACK',
  'FINISHED_AND_LIVE',
  'ON_HOLD',
  'CANCELLED',
];
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

export async function GET(request: NextRequest) {
  try {
    // Verify authentication (belt-and-suspenders with middleware)
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const statusParam = searchParams.get('status');
    const projectStatusParam = searchParams.get('projectStatus');
    const search = searchParams.get('search') || undefined;
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    // Validate status parameter
    const filters: SubmissionFilters & ProjectFilters = {};
    if (statusParam) {
      if (!VALID_STATUSES.includes(statusParam as SubmissionStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      filters.status = statusParam as SubmissionStatus;
    }

    // Validate projectStatus parameter
    if (projectStatusParam) {
      if (!VALID_PROJECT_STATUSES.includes(projectStatusParam as ProjectStatus)) {
        return NextResponse.json(
          { success: false, error: `Invalid project status. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      filters.projectStatus = projectStatusParam as ProjectStatus;
    }

    // Add search filter
    if (search) {
      filters.search = search;
    }

    // Parse and validate pagination
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(limitParam || String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT));

    // Fetch submissions
    const result = await getSubmissions(filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}
