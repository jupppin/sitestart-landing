import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { verifyWebhookSignature } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// ============================================================================
// Stripe Webhook Handler
// ============================================================================
//
// This endpoint receives webhook events from Stripe and updates the database
// accordingly. All events are verified using the webhook signature to ensure
// they genuinely came from Stripe.
//
// Handled events:
// - checkout.session.completed: Payment successful (setup fee or subscription)
// - invoice.paid: Subscription invoice paid
// - invoice.payment_failed: Payment failed
// - customer.subscription.deleted: Subscription cancelled
// ============================================================================

/**
 * POST /api/webhooks/stripe
 *
 * Receives and processes Stripe webhook events.
 * Always responds quickly with 200 to acknowledge receipt.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let event: Stripe.Event;

  // Get the raw body and signature header
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Validate the signature header exists
  if (!signature) {
    console.error('Stripe webhook: Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  // Verify the webhook signature
  try {
    event = verifyWebhookSignature(payload, signature);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Stripe webhook signature verification failed: ${message}`);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  // Log the event for debugging (in production, use structured logging)
  console.log(`Stripe webhook received: ${event.type} [${event.id}]`);

  // Handle the event based on type
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        // Log unhandled events for monitoring but don't error
        console.log(`Stripe webhook: Unhandled event type ${event.type}`);
    }

    // Always return 200 quickly to acknowledge receipt
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Stripe webhook handler error for ${event.type}: ${message}`);

    // Return 500 so Stripe will retry the webhook
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handles checkout.session.completed event.
 *
 * This event fires when a customer successfully completes checkout.
 * The session metadata should contain `submissionId` to link back to
 * the IntakeSubmission in our database.
 *
 * For setup fee payments (mode: 'payment'):
 * - Updates status to 'PAID'
 * - Records paidAt timestamp
 * - Stores revenue amount
 * - Links stripeCustomerId
 *
 * For subscription payments (mode: 'subscription'):
 * - Links stripeSubscriptionId
 * - Sets subscriptionStatus to 'active'
 * - Updates billingStatus to 'PAID'
 */
async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const submissionId = session.metadata?.submissionId;

  if (!submissionId) {
    console.warn(
      `Stripe webhook: checkout.session.completed without submissionId in metadata [${session.id}]`
    );
    return;
  }

  const submissionIdInt = parseInt(submissionId, 10);
  if (isNaN(submissionIdInt)) {
    console.error(
      `Stripe webhook: Invalid submissionId "${submissionId}" in metadata [${session.id}]`
    );
    return;
  }

  // Verify the submission exists
  const existingSubmission = await prisma.intakeSubmission.findUnique({
    where: { id: submissionIdInt },
  });

  if (!existingSubmission) {
    console.error(
      `Stripe webhook: IntakeSubmission not found for id ${submissionIdInt} [${session.id}]`
    );
    return;
  }

  // Determine the payment type from session mode
  const isSubscription = session.mode === 'subscription';
  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id;

  if (isSubscription) {
    // Handle subscription checkout completion
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : session.subscription?.id;

    await prisma.intakeSubmission.update({
      where: { id: submissionIdInt },
      data: {
        stripeCustomerId: customerId ?? undefined,
        stripeSubscriptionId: subscriptionId ?? undefined,
        subscriptionStatus: 'active',
        billingStatus: 'PAID',
        updatedAt: new Date(),
      },
    });

    console.log(
      `Stripe webhook: Subscription activated for submission ${submissionIdInt} [${session.id}]`
    );
  } else {
    // Handle one-time payment (setup fee) completion
    // Get the amount from the session (amount_total is in cents)
    const amountInDollars = session.amount_total
      ? session.amount_total / 100
      : null;

    await prisma.intakeSubmission.update({
      where: { id: submissionIdInt },
      data: {
        status: 'PAID',
        billingStatus: 'PAID',
        paidAt: new Date(),
        revenue: amountInDollars,
        stripeCustomerId: customerId ?? undefined,
        updatedAt: new Date(),
      },
    });

    console.log(
      `Stripe webhook: Setup fee paid for submission ${submissionIdInt}, amount: $${amountInDollars} [${session.id}]`
    );
  }
}

/**
 * Handles invoice.paid event.
 *
 * This event fires when an invoice is successfully paid, typically for
 * subscription renewals. Updates the lastInvoicePaidAt timestamp and
 * confirms the billing status is current.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  // Get the subscription ID from the invoice
  // In newer Stripe API versions, subscription can be string | Subscription | null
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionRef === 'string'
    ? subscriptionRef
    : subscriptionRef?.id ?? null;

  if (!subscriptionId) {
    // This might be a one-time invoice, not subscription-related
    console.log(
      `Stripe webhook: invoice.paid without subscription ID [${invoice.id}]`
    );
    return;
  }

  // Find the submission by subscription ID
  const submission = await prisma.intakeSubmission.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!submission) {
    console.warn(
      `Stripe webhook: No submission found for subscription ${subscriptionId} [${invoice.id}]`
    );
    return;
  }

  // Update the invoice payment tracking
  await prisma.intakeSubmission.update({
    where: { id: submission.id },
    data: {
      lastInvoicePaidAt: new Date(),
      lastInvoiceDate: invoice.created ? new Date(invoice.created * 1000) : new Date(),
      billingStatus: 'PAID',
      subscriptionStatus: 'active', // Confirm subscription is active
      updatedAt: new Date(),
    },
  });

  console.log(
    `Stripe webhook: Invoice paid for submission ${submission.id}, subscription ${subscriptionId} [${invoice.id}]`
  );
}

/**
 * Handles invoice.payment_failed event.
 *
 * This event fires when a payment attempt fails. If the invoice is
 * more than 7 days overdue, we mark the billing status as OVERDUE.
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  // Get the subscription ID from the invoice
  const subscriptionRef = invoice.parent?.subscription_details?.subscription;
  const subscriptionId = typeof subscriptionRef === 'string'
    ? subscriptionRef
    : subscriptionRef?.id ?? null;

  if (!subscriptionId) {
    console.log(
      `Stripe webhook: invoice.payment_failed without subscription ID [${invoice.id}]`
    );
    return;
  }

  // Find the submission by subscription ID
  const submission = await prisma.intakeSubmission.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!submission) {
    console.warn(
      `Stripe webhook: No submission found for subscription ${subscriptionId} [${invoice.id}]`
    );
    return;
  }

  // Calculate if the invoice is 7+ days overdue
  const invoiceDueDate = invoice.due_date
    ? new Date(invoice.due_date * 1000)
    : (invoice.created ? new Date(invoice.created * 1000) : new Date());

  const now = new Date();
  const daysSincedue = Math.floor(
    (now.getTime() - invoiceDueDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Only mark as OVERDUE if 7+ days past due
  const newBillingStatus = daysSincedue >= 7 ? 'OVERDUE' : submission.billingStatus;

  await prisma.intakeSubmission.update({
    where: { id: submission.id },
    data: {
      billingStatus: newBillingStatus,
      subscriptionStatus: 'past_due',
      updatedAt: new Date(),
    },
  });

  console.log(
    `Stripe webhook: Payment failed for submission ${submission.id}, days overdue: ${daysSincedue}, status: ${newBillingStatus} [${invoice.id}]`
  );
}

/**
 * Handles customer.subscription.deleted event.
 *
 * This event fires when a subscription is cancelled, either by the
 * customer, by you, or automatically due to payment failures.
 * Updates the subscription status and records the cancellation timestamp.
 */
async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const subscriptionId = subscription.id;

  // Find the submission by subscription ID
  const submission = await prisma.intakeSubmission.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
  });

  if (!submission) {
    console.warn(
      `Stripe webhook: No submission found for subscription ${subscriptionId}`
    );
    return;
  }

  await prisma.intakeSubmission.update({
    where: { id: submission.id },
    data: {
      subscriptionStatus: 'canceled',
      subscriptionCanceledAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log(
    `Stripe webhook: Subscription cancelled for submission ${submission.id} [${subscriptionId}]`
  );
}
