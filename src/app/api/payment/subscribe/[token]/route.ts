/**
 * Subscription Checkout API Route
 *
 * POST /api/payment/subscribe/[token]
 * Initiates a Stripe Checkout session for a $29/month recurring subscription.
 *
 * This endpoint:
 * 1. Validates the token by finding a submission with matching subscriptionToken
 * 2. Creates a Stripe Checkout session for the subscription
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
import { createSubscriptionCheckout } from '@/lib/stripe';

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
      where: { subscriptionToken: token },
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

    // Get the subscription price ID from environment
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;
    if (!subscriptionPriceId) {
      console.error('STRIPE_SUBSCRIPTION_PRICE_ID is not configured');
      return NextResponse.json(
        { success: false, error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    // Build URLs for success and cancel redirects
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/pay/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/pay/cancelled`;

    // Create Stripe Checkout session for subscription
    const session = await createSubscriptionCheckout({
      subscriptionPriceId,
      successUrl,
      cancelUrl,
      customerEmail: submission.email,
      metadata: {
        submissionId: submission.id.toString(),
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
    console.error('Error creating subscription checkout session:', error);

    // Provide more specific error messages for Stripe errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      return NextResponse.json(
        { success: false, error: 'Payment service temporarily unavailable' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to initiate subscription' },
      { status: 500 }
    );
  }
}
