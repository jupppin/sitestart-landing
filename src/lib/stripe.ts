import Stripe from 'stripe';

// Lazy-initialized Stripe client
// We use a getter function to avoid throwing during build time when env vars aren't available
let _stripe: Stripe | null = null;

/**
 * Get the Stripe client instance.
 * Lazily initializes on first call to avoid build-time errors.
 */
export function getStripeClient(): Stripe {
  if (_stripe) {
    return _stripe;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error(
      'STRIPE_SECRET_KEY is not set. Please add it to your .env.local file.'
    );
  }

  _stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-12-15.clover', // Pin API version for consistent behavior
    typescript: true,
  });

  return _stripe;
}

// Alias for compatibility - but prefer using getStripeClient() directly
export const stripe = {
  get checkout() {
    return getStripeClient().checkout;
  },
  get webhooks() {
    return getStripeClient().webhooks;
  },
  get subscriptions() {
    return getStripeClient().subscriptions;
  },
  get billingPortal() {
    return getStripeClient().billingPortal;
  },
};

// ============================================================================
// Types
// ============================================================================

/**
 * Metadata attached to checkout sessions for tracking and fulfillment.
 * Stripe metadata must be a Record<string, string>, so all values are strings.
 */
export interface CheckoutSessionMetadata {
  /** Customer email for identification */
  customerEmail?: string;
  /** Customer name for display */
  customerName?: string;
  /** Internal customer ID from your database */
  customerId?: string;
  /** Type of purchase */
  paymentType: 'one_time' | 'subscription' | 'setup_fee';
  /** Product or service being purchased */
  productName?: string;
  /** Any additional notes or context */
  notes?: string;
  /** Allow additional string keys for flexibility */
  [key: string]: string | undefined;
}

/**
 * Options for creating a checkout session
 */
export interface CreateCheckoutSessionOptions {
  /** Stripe Price ID for the item being purchased */
  priceId: string;
  /** Payment mode: 'payment' for one-time, 'subscription' for recurring */
  mode: 'payment' | 'subscription';
  /** URL to redirect to after successful payment */
  successUrl: string;
  /** URL to redirect to if customer cancels */
  cancelUrl: string;
  /** Optional: Pre-fill customer email */
  customerEmail?: string;
  /** Optional: Existing Stripe Customer ID */
  customerId?: string;
  /** Optional: Metadata to attach to the session */
  metadata?: CheckoutSessionMetadata;
  /** Optional: Quantity of the item (defaults to 1) */
  quantity?: number;
  /** Optional: Allow promotion codes */
  allowPromotionCodes?: boolean;
}

/**
 * Options for creating a subscription checkout
 */
export interface CreateSubscriptionCheckoutOptions {
  /** Stripe Price ID for the subscription */
  subscriptionPriceId: string;
  /** Optional: Stripe Price ID for a one-time setup fee */
  setupFeePriceId?: string;
  /** URL to redirect to after successful payment */
  successUrl: string;
  /** URL to redirect to if customer cancels */
  cancelUrl: string;
  /** Optional: Pre-fill customer email */
  customerEmail?: string;
  /** Optional: Existing Stripe Customer ID */
  customerId?: string;
  /** Optional: Metadata to attach to the session */
  metadata?: Omit<CheckoutSessionMetadata, 'paymentType'>;
  /** Optional: Allow promotion codes */
  allowPromotionCodes?: boolean;
  /** Optional: Number of days for trial period */
  trialPeriodDays?: number;
}

// ============================================================================
// Checkout Session Helpers
// ============================================================================

/**
 * Creates a Stripe Checkout Session for one-time payments or subscriptions.
 *
 * This is the recommended way to accept payments - Stripe Checkout handles
 * all the complexity of payment collection, 3D Secure, and error handling.
 *
 * @example
 * // One-time payment
 * const session = await createCheckoutSession({
 *   priceId: process.env.STRIPE_SETUP_FEE_PRICE_ID!,
 *   mode: 'payment',
 *   successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
 *   cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
 *   customerEmail: 'customer@example.com',
 *   metadata: { paymentType: 'one_time', productName: 'Website Setup' },
 * });
 *
 * @example
 * // Subscription
 * const session = await createCheckoutSession({
 *   priceId: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
 *   mode: 'subscription',
 *   successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
 *   cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
 * });
 */
export async function createCheckoutSession(
  options: CreateCheckoutSessionOptions
): Promise<Stripe.Checkout.Session> {
  const {
    priceId,
    mode,
    successUrl,
    cancelUrl,
    customerEmail,
    customerId,
    metadata,
    quantity = 1,
    allowPromotionCodes = false,
  } = options;

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode,
    line_items: [
      {
        price: priceId,
        quantity,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: allowPromotionCodes,
    // Include session ID in success URL for verification
    // {CHECKOUT_SESSION_ID} is replaced by Stripe with the actual session ID
  };

  // Add customer identification
  if (customerId) {
    sessionParams.customer = customerId;
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Add metadata for tracking and fulfillment
  if (metadata) {
    sessionParams.metadata = metadata as Stripe.MetadataParam;
  }

  // For subscriptions, enable automatic tax if configured in Stripe
  if (mode === 'subscription') {
    sessionParams.subscription_data = {
      metadata: metadata as Stripe.MetadataParam,
    };
  }

  return stripe.checkout.sessions.create(sessionParams);
}

/**
 * Creates a Stripe Checkout Session specifically for subscriptions,
 * with optional one-time setup fee.
 *
 * This is a convenience wrapper around createCheckoutSession that handles
 * the common pattern of subscription + setup fee.
 *
 * @example
 * const session = await createSubscriptionCheckout({
 *   subscriptionPriceId: process.env.STRIPE_SUBSCRIPTION_PRICE_ID!,
 *   setupFeePriceId: process.env.STRIPE_SETUP_FEE_PRICE_ID,
 *   successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
 *   cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
 *   customerEmail: 'customer@example.com',
 *   trialPeriodDays: 14,
 * });
 */
export async function createSubscriptionCheckout(
  options: CreateSubscriptionCheckoutOptions
): Promise<Stripe.Checkout.Session> {
  const {
    subscriptionPriceId,
    setupFeePriceId,
    successUrl,
    cancelUrl,
    customerEmail,
    customerId,
    metadata,
    allowPromotionCodes = false,
    trialPeriodDays,
  } = options;

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      price: subscriptionPriceId,
      quantity: 1,
    },
  ];

  // Add one-time setup fee if provided
  if (setupFeePriceId) {
    lineItems.push({
      price: setupFeePriceId,
      quantity: 1,
    });
  }

  const fullMetadata: CheckoutSessionMetadata = {
    ...metadata,
    paymentType: 'subscription',
  };

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: 'subscription',
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: allowPromotionCodes,
    metadata: fullMetadata as Stripe.MetadataParam,
    subscription_data: {
      metadata: fullMetadata as Stripe.MetadataParam,
    },
  };

  // Add customer identification
  if (customerId) {
    sessionParams.customer = customerId;
  } else if (customerEmail) {
    sessionParams.customer_email = customerEmail;
  }

  // Add trial period if specified
  if (trialPeriodDays && trialPeriodDays > 0) {
    sessionParams.subscription_data!.trial_period_days = trialPeriodDays;
  }

  return stripe.checkout.sessions.create(sessionParams);
}

// ============================================================================
// Webhook Helpers
// ============================================================================

/**
 * Verifies a Stripe webhook signature and returns the parsed event.
 *
 * IMPORTANT: Always verify webhook signatures to ensure the request
 * came from Stripe and wasn't tampered with. Never process unverified webhooks.
 *
 * @param payload - The raw request body as a string or Buffer
 * @param signature - The 'stripe-signature' header value
 * @returns The verified Stripe event
 * @throws Error if signature verification fails
 *
 * @example
 * // In your webhook route handler (app/api/webhooks/stripe/route.ts)
 * export async function POST(request: Request) {
 *   const payload = await request.text();
 *   const signature = request.headers.get('stripe-signature');
 *
 *   if (!signature) {
 *     return new Response('Missing signature', { status: 400 });
 *   }
 *
 *   try {
 *     const event = verifyWebhookSignature(payload, signature);
 *
 *     switch (event.type) {
 *       case 'checkout.session.completed':
 *         const session = event.data.object;
 *         // Handle successful checkout...
 *         break;
 *       case 'invoice.payment_succeeded':
 *         // Handle subscription payment...
 *         break;
 *     }
 *
 *     return new Response('OK', { status: 200 });
 *   } catch (err) {
 *     console.error('Webhook signature verification failed:', err);
 *     return new Response('Invalid signature', { status: 400 });
 *   }
 * }
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not set. Please add it to your .env.local file.'
    );
  }

  // Stripe's constructEvent will throw if verification fails
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Type guard to check if a Stripe event is a checkout session completed event
 */
export function isCheckoutSessionCompletedEvent(
  event: Stripe.Event
): event is Stripe.Event & { data: { object: Stripe.Checkout.Session } } {
  return event.type === 'checkout.session.completed';
}

/**
 * Type guard to check if a Stripe event is an invoice payment succeeded event
 */
export function isInvoicePaymentSucceededEvent(
  event: Stripe.Event
): event is Stripe.Event & { data: { object: Stripe.Invoice } } {
  return event.type === 'invoice.payment_succeeded';
}

/**
 * Type guard to check if a Stripe event is a subscription updated event
 */
export function isSubscriptionUpdatedEvent(
  event: Stripe.Event
): event is Stripe.Event & { data: { object: Stripe.Subscription } } {
  return (
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  );
}

// ============================================================================
// Session Retrieval Helpers
// ============================================================================

/**
 * Retrieves a checkout session by ID with expanded line items.
 * Useful for displaying order confirmation or verifying payment.
 *
 * @param sessionId - The checkout session ID (from success URL)
 * @returns The checkout session with line items expanded
 *
 * @example
 * // In your success page
 * const session = await getCheckoutSession(sessionId);
 * if (session.payment_status === 'paid') {
 *   // Show confirmation
 * }
 */
export async function getCheckoutSession(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  return stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['line_items', 'customer', 'subscription'],
  });
}

/**
 * Retrieves a customer's subscriptions.
 * Useful for showing subscription status in customer portal.
 *
 * @param customerId - The Stripe customer ID
 * @returns List of subscriptions for the customer
 */
export async function getCustomerSubscriptions(
  customerId: string
): Promise<Stripe.Subscription[]> {
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: 'all',
    expand: ['data.default_payment_method'],
  });
  return subscriptions.data;
}

/**
 * Creates a billing portal session for customer self-service.
 * Allows customers to manage subscriptions, update payment methods, etc.
 *
 * @param customerId - The Stripe customer ID
 * @param returnUrl - URL to return to after portal session
 * @returns The billing portal session with URL
 *
 * @example
 * const portalSession = await createBillingPortalSession(
 *   customerId,
 *   `${process.env.NEXT_PUBLIC_APP_URL}/account`
 * );
 * // Redirect customer to portalSession.url
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<Stripe.BillingPortal.Session> {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

// ============================================================================
// Re-export Stripe types for convenience
// ============================================================================

export type { Stripe };
