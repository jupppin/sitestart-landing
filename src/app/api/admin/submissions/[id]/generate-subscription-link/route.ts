/**
 * Admin Generate Subscription Payment Link API Route
 *
 * POST /api/admin/submissions/[id]/generate-subscription-link
 * Generates a secure payment link for subscription setup.
 *
 * Creates a cryptographically random token using crypto.randomUUID(),
 * stores it in the submission's subscriptionToken field, and returns
 * the subscription URL.
 *
 * Authentication: Required (admin only)
 *
 * Request Body (optional):
 * - sendEmail: boolean (default: false) - If true, sends subscription link email to customer
 *
 * Response:
 * - 200: { success: true, url: string, emailSent?: boolean }
 * - 401: Unauthorized
 * - 404: Submission not found
 * - 500: Server error
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { isAuthenticated } from '@/lib/auth/session';
import { prisma } from '@/lib/db';
import { sendEmail, getSubscriptionLinkEmailTemplate } from '@/lib/email';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify admin authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body for optional sendEmail flag
    let shouldSendEmail = false;
    try {
      const body = await request.json();
      shouldSendEmail = body.sendEmail === true;
    } catch {
      // No body or invalid JSON - default to not sending email
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

    // Check if submission exists and get customer details for email
    const submission = await prisma.intakeSubmission.findUnique({
      where: { id: submissionId },
      select: { id: true, fullName: true, email: true },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Generate cryptographically secure token
    const token = randomUUID();

    // Store token in the submission
    await prisma.intakeSubmission.update({
      where: { id: submissionId },
      data: { subscriptionToken: token },
    });

    // Build the subscription URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const subscriptionUrl = `${baseUrl}/pay/subscribe/${token}`;

    // Optionally send email to customer
    let emailSent = false;
    if (shouldSendEmail && submission.email) {
      const { subject, html } = getSubscriptionLinkEmailTemplate(
        submission.fullName,
        subscriptionUrl
      );
      emailSent = await sendEmail(submission.email, subject, html);
    }

    return NextResponse.json({
      success: true,
      url: subscriptionUrl,
      ...(shouldSendEmail && { emailSent }),
    });
  } catch (error) {
    console.error('Error generating subscription payment link:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate payment link' },
      { status: 500 }
    );
  }
}
