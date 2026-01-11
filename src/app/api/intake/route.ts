import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendNotificationEmail } from '@/lib/email';

/**
 * Interface for the intake form data received from the frontend
 */
interface IntakeFormData {
  fullName: string;
  email: string;
  phone?: string;
  businessName: string;
  industryType: string;
  currentWebsite?: string;
  hasNoWebsite: boolean;
  features: string[];
  otherFeatures?: string;
  budgetRange: string;
  timeline: string;
  additionalInfo?: string;
}

/**
 * Validation error details structure
 */
interface ValidationErrors {
  [field: string]: string;
}

/**
 * Validates an email address format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates the intake form data and returns any validation errors
 */
function validateFormData(data: Partial<IntakeFormData>): ValidationErrors {
  const errors: ValidationErrors = {};

  // fullName: required, non-empty
  if (!data.fullName || typeof data.fullName !== 'string' || data.fullName.trim() === '') {
    errors.fullName = 'Full name is required';
  }

  // email: required, valid email format
  if (!data.email || typeof data.email !== 'string' || data.email.trim() === '') {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email.trim())) {
    errors.email = 'Invalid email format';
  }

  // businessName: required, non-empty
  if (!data.businessName || typeof data.businessName !== 'string' || data.businessName.trim() === '') {
    errors.businessName = 'Business name is required';
  }

  // industryType: required
  if (!data.industryType || typeof data.industryType !== 'string' || data.industryType.trim() === '') {
    errors.industryType = 'Industry type is required';
  }

  // budgetRange: required
  if (!data.budgetRange || typeof data.budgetRange !== 'string' || data.budgetRange.trim() === '') {
    errors.budgetRange = 'Budget range is required';
  }

  // timeline: required
  if (!data.timeline || typeof data.timeline !== 'string' || data.timeline.trim() === '') {
    errors.timeline = 'Timeline is required';
  }

  // features: should be an array (can be empty)
  if (data.features !== undefined && !Array.isArray(data.features)) {
    errors.features = 'Features must be an array';
  }

  // hasNoWebsite: should be a boolean if provided
  if (data.hasNoWebsite !== undefined && typeof data.hasNoWebsite !== 'boolean') {
    errors.hasNoWebsite = 'hasNoWebsite must be a boolean';
  }

  return errors;
}

/**
 * POST /api/intake
 *
 * Handles intake form submissions:
 * - Validates the incoming form data
 * - Saves the submission to the database
 * - Sends an email notification
 * - Returns appropriate success/error responses
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    let data: Partial<IntakeFormData>;
    try {
      data = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate the form data
    const validationErrors = validateFormData(data);
    if (Object.keys(validationErrors).length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validationErrors
        },
        { status: 400 }
      );
    }

    // Prepare the data for database insertion
    const submissionData = {
      fullName: data.fullName!.trim(),
      email: data.email!.trim().toLowerCase(),
      phone: data.phone?.trim() || null,
      businessName: data.businessName!.trim(),
      industryType: data.industryType!.trim(),
      currentWebsite: data.currentWebsite?.trim() || null,
      hasNoWebsite: data.hasNoWebsite ?? false,
      features: JSON.stringify(data.features ?? []),
      otherFeatures: data.otherFeatures?.trim() || null,
      budgetRange: data.budgetRange!.trim(),
      timeline: data.timeline!.trim(),
      additionalInfo: data.additionalInfo?.trim() || null,
    };

    // Save to database
    const submission = await prisma.intakeSubmission.create({
      data: submissionData,
    });

    console.log(`[Intake API] New submission created with ID: ${submission.id}`);

    // Send email notification (don't fail the request if email fails)
    try {
      await sendNotificationEmail({
        submissionId: submission.id,
        fullName: submission.fullName,
        email: submission.email,
        phone: submission.phone,
        businessName: submission.businessName,
        industryType: submission.industryType,
        currentWebsite: submission.currentWebsite,
        hasNoWebsite: submission.hasNoWebsite,
        features: JSON.parse(submission.features) as string[],
        otherFeatures: submission.otherFeatures,
        budgetRange: submission.budgetRange,
        timeline: submission.timeline,
        additionalInfo: submission.additionalInfo,
        createdAt: submission.createdAt,
      });
      console.log(`[Intake API] Email notification sent for submission ID: ${submission.id}`);
    } catch (emailError) {
      // Log the error but don't fail the request
      console.error(`[Intake API] Failed to send email notification for submission ID: ${submission.id}`, emailError);
    }

    // Return success response
    return NextResponse.json(
      { success: true, message: 'Form submitted successfully' },
      { status: 201 }
    );

  } catch (error) {
    // Log the error for debugging
    console.error('[Intake API] Error processing submission:', error);

    // Check for specific Prisma errors
    if (error instanceof Error) {
      // Log additional details for debugging
      console.error('[Intake API] Error name:', error.name);
      console.error('[Intake API] Error message:', error.message);
    }

    // Return generic error response
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
