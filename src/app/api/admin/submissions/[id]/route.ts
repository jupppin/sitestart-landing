/**
 * Admin Submission Detail API Route
 *
 * GET /api/admin/submissions/[id]
 * Retrieves a single submission by ID.
 *
 * PATCH /api/admin/submissions/[id]
 * Updates a submission. Allowed fields:
 * - status: NEW | CONTACTED | PAID
 * - notes: string
 * - revenue: number (required when setting status to PAID)
 *
 * Authentication: Required (handled by middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { getSubmissionById, updateSubmission } from '@/lib/admin/queries';
import type { SubmissionStatus } from '@/types/admin';

const VALID_STATUSES: SubmissionStatus[] = ['NEW', 'CONTACTED', 'PAID'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate ID
    const { id } = await params;
    const submissionId = parseInt(id, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Fetch submission
    const submission = await getSubmissionById(submissionId);

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submission' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate ID
    const { id } = await params;
    const submissionId = parseInt(id, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid submission ID' },
        { status: 400 }
      );
    }

    // Check if submission exists
    const existingSubmission = await getSubmissionById(submissionId);
    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, notes, revenue } = body;

    // Build update data
    const updateData: {
      status?: SubmissionStatus;
      notes?: string;
      revenue?: number | null;
      paidAt?: Date | null;
      contacted?: boolean;
    } = {};

    // Validate and add status
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      // Require revenue when changing to PAID
      if (status === 'PAID' && revenue === undefined && existingSubmission.revenue === null) {
        return NextResponse.json(
          { success: false, error: 'Revenue is required when setting status to PAID' },
          { status: 400 }
        );
      }

      updateData.status = status;
    }

    // Validate and add notes
    if (notes !== undefined) {
      if (typeof notes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Notes must be a string' },
          { status: 400 }
        );
      }
      updateData.notes = notes;
    }

    // Validate and add revenue
    if (revenue !== undefined) {
      if (revenue !== null && (typeof revenue !== 'number' || revenue < 0)) {
        return NextResponse.json(
          { success: false, error: 'Revenue must be a positive number or null' },
          { status: 400 }
        );
      }
      updateData.revenue = revenue;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await updateSubmission(submissionId, updateData);

    return NextResponse.json({
      success: true,
      data: updatedSubmission,
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update submission' },
      { status: 500 }
    );
  }
}
