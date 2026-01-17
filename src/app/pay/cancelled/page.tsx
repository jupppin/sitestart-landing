/**
 * Payment Cancelled Page
 *
 * Displayed when a user cancels the payment process.
 * Route: /pay/cancelled
 */

import { Metadata } from 'next';
import Link from 'next/link';
import BackButton from './BackButton';

export const metadata: Metadata = {
  title: 'Payment Cancelled - SiteStart',
  description: 'Your payment was cancelled.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentCancelledPage() {
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
          {/* Cancelled Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
            <svg
              className="h-10 w-10 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Cancelled Message */}
          <h1 className="mt-6 text-3xl font-bold text-gray-900">Payment Cancelled</h1>
          <p className="mt-4 text-lg text-gray-600">
            Your payment was not completed. No charges have been made to your account.
          </p>

          {/* Information Box */}
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">What would you like to do?</h2>
            <p className="mt-2 text-sm text-gray-600">
              If you experienced any issues during checkout or have questions about the payment,
              please don&apos;t hesitate to reach out. We&apos;re here to help.
            </p>
            <div className="mt-4 rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <svg
                  className="h-5 w-5 flex-shrink-0 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-700">
                  Your payment link is still valid. You can return to it anytime to complete your payment.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 space-y-3">
            <BackButton />
            <a
              href="mailto:support@sitestart.com"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Contact Support
            </a>
            <Link
              href="/"
              className="block text-sm text-gray-500 hover:text-gray-700"
            >
              Return to Homepage
            </Link>
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
