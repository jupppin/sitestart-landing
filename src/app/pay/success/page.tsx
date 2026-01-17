/**
 * Payment Success Page
 *
 * Displayed after successful payment completion.
 * Detects payment type from session_id to show appropriate messaging.
 * Route: /pay/success?session_id=...
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { getStripeClient } from '@/lib/stripe';

export const metadata: Metadata = {
  title: 'Payment Successful - SiteStart',
  description: 'Your payment has been successfully processed.',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  searchParams: Promise<{ session_id?: string }>;
}

async function getPaymentType(sessionId?: string): Promise<'subscription' | 'setup_fee'> {
  if (!sessionId) return 'setup_fee';

  try {
    const stripe = getStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session.mode === 'subscription' ? 'subscription' : 'setup_fee';
  } catch {
    return 'setup_fee';
  }
}

export default async function PaymentSuccessPage({ searchParams }: PageProps) {
  const { session_id } = await searchParams;
  const paymentType = await getPaymentType(session_id);
  const isSubscription = paymentType === 'subscription';

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">SiteStart</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          {/* Success Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            {isSubscription ? 'Subscription Active!' : 'Payment Successful!'}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {isSubscription
              ? "Thank you for subscribing! Your monthly hosting and support plan is now active."
              : "Thank you for your payment. We've received your setup fee and are excited to start working on your website."}
          </p>

          {/* What's Next */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">What happens next?</h2>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                  1
                </div>
                <div>
                  <p className="font-medium text-gray-900">Confirmation Email</p>
                  <p className="text-sm text-gray-500">
                    {isSubscription
                      ? "You'll receive a subscription confirmation and billing details via email."
                      : "You'll receive a receipt and project details via email shortly."}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                  2
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {isSubscription ? 'Your Site Stays Live' : 'Project Kickoff'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isSubscription
                      ? "Your website will remain online with hosting, updates, and support included."
                      : "Our team will review your requirements and begin designing your website."}
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                  3
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {isSubscription ? 'Monthly Billing' : 'Progress Updates'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isSubscription
                      ? "You'll be billed automatically each month. Cancel anytime from your email receipts."
                      : "We'll keep you informed as your website comes to life."}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <Link
              href="/"
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Return to Homepage
            </Link>
            <a
              href="mailto:support@sitestart.com"
              className="block text-sm text-gray-500 hover:text-gray-700"
            >
              Have questions? Contact support
            </a>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} SiteStart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
