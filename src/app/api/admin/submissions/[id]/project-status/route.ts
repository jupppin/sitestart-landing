/**
 * Admin Project Status API Route
 *
 * POST /api/admin/submissions/[id]/project-status
 * Updates project status and related fields for a submission.
 * Allowed fields:
 * - projectStatus: NOT_STARTED | JUST_STARTED | IN_PROGRESS | WAITING_FOR_FEEDBACK | FINISHED_AND_LIVE | ON_HOLD | CANCELLED
 * - projectNotes: string
 * - liveUrl: string
 * - goLiveDate: string (ISO date) | null
 *
 * Authentication: Required (handled by middleware)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import type { ProjectStatus } from '@/types/admin';

const VALID_PROJECT_STATUSES: ProjectStatus[] = [
  'NOT_STARTED',
  'JUST_STARTED',
  'IN_PROGRESS',
  'WAITING_FOR_FEEDBACK',
  'FINISHED_AND_LIVE',
  'ON_HOLD',
  'CANCELLED',
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
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
    const existingSubmission = await prisma.intakeSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!existingSubmission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { projectStatus, projectNotes, liveUrl, goLiveDate } = body;

    // Build update data
    const updateData: {
      projectStatus?: string;
      projectNotes?: string;
      liveUrl?: string | null;
      goLiveDate?: Date | null;
    } = {};

    // Validate and add projectStatus
    if (projectStatus !== undefined) {
      if (!VALID_PROJECT_STATUSES.includes(projectStatus)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid project status. Must be one of: ${VALID_PROJECT_STATUSES.join(', ')}`,
          },
          { status: 400 }
        );
      }
      updateData.projectStatus = projectStatus;
    }

    // Validate and add projectNotes
    if (projectNotes !== undefined) {
      if (typeof projectNotes !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Project notes must be a string' },
          { status: 400 }
        );
      }
      updateData.projectNotes = projectNotes;
    }

    // Validate and add liveUrl
    if (liveUrl !== undefined) {
      if (liveUrl !== null && liveUrl !== '' && typeof liveUrl !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Live URL must be a string' },
          { status: 400 }
        );
      }
      // Basic URL validation if provided
      if (liveUrl && liveUrl !== '') {
        try {
          new URL(liveUrl);
        } catch {
          return NextResponse.json(
            { success: false, error: 'Live URL must be a valid URL' },
            { status: 400 }
          );
        }
      }
      updateData.liveUrl = liveUrl || null;
    }

    // Validate and add goLiveDate
    if (goLiveDate !== undefined) {
      if (goLiveDate === null || goLiveDate === '') {
        updateData.goLiveDate = null;
      } else {
        const parsedDate = new Date(goLiveDate);
        if (isNaN(parsedDate.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Go-live date must be a valid date' },
            { status: 400 }
          );
        }
        updateData.goLiveDate = parsedDate;
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update submission
    const updatedSubmission = await prisma.intakeSubmission.update({
      where: { id: submissionId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      data: updatedSubmission,
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project status' },
      { status: 500 }
    );
  }
}
