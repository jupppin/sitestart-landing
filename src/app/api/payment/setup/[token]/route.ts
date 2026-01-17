/**
 * Payment Setup Fee Checkout API Route
 *
 * POST /api/payment/setup/[token]
 * Initiates a Stripe Checkout session for a one-time $200 setup fee payment.
 *
 * This endpoint:
 * 1. Validates the token by finding a submission with matching setupFeeToken
 * 2. Creates a Stripe Checkout session for the one-time payment
 * 3. Returns the checkout URL for client-side redirect
 *
 * Authentication: None (token-based access)
 *
 * Response:
 * - 200: { success: true, url: string }
 * - 404: Invalid or expired token
 * - 500: Server error (Stripe or database failure)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createCheckoutSession } from '@/lib/stripe';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { token } = await params;

    // Validate the token by finding the submission
    const submission = await prisma.intakeSubmission.findUnique({
      where: { setupFeeToken: token },
      select: {
        id: true,
        email: true,
        fullName: true,
        businessName: true,
      },
    });

    // Return 404 if token is invalid or not found
    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired payment link' },
        { status: 404 }
      );
    }

    // Get the setup fee price ID from environment
    const priceId = process.env.STRIPE_SETUP_FEE_PRICE_ID;
    if (!priceId) {
      console.error('STRIPE_SETUP_FEE_PRICE_ID is not configured');
      return NextResponse.json(
        { success: false, error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Build URLs for success and cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pay/cancelled`;

    // Create Stripe Checkout session for one-time setup fee payment
    const session = await createCheckoutSession({
      priceId,
      mode: 'payment',
      successUrl,
      cancelUrl,
      customerEmail: submission.email,
      metadata: {
        submissionId: submission.id.toString(),
        paymentType: 'setup_fee',
        customerName: submission.fullName,
        businessName: submission.businessName,
      },
    });

    // Verify we have a checkout URL
    if (!session.url) {
      console.error('Stripe session created without URL');
      return NextResponse.json(
        { success: false, error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating setup fee checkout session:', error);

    // Provide more specific error messages for Stripe errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { success: false, error: 'Payment service temporarily unavailable' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
