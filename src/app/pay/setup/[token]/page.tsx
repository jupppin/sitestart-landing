/**
 * Setup Fee Payment Page
 *
 * Public customer-facing page for $200 one-time setup fee payment.
 * Validates the token against the database and displays payment UI.
 *
 * Route: /pay/setup/[token]
 */

import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import SetupFeePaymentClient from './SetupFeePaymentClient';

export const metadata: Metadata = {
  title: 'Pay Setup Fee - SiteStart',
  description: 'Complete your setup fee payment to get started with your new website.',
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ token: string }>;
}

async function getSubmissionByToken(token: string) {
  try {
    const submission = await prisma.intakeSubmission.findUnique({
      where: { setupFeeToken: token },
      select: {
        id: true,
        fullName: true,
        businessName: true,
        email: true,
        status: true,
        billingStatus: true,
      },
    });

    return submission;
  } catch (error) {
    console.error('Error fetching submission by token:', error);
    return null;
  }
}

export default async function SetupFeePaymentPage({ params }: PageProps) {
  const { token } = await params;

  // Validate token exists
  if (!token || token.length < 10) {
    return <InvalidTokenPage />;
  }

  // Fetch submission from database
  const submission = await getSubmissionByToken(token);

  // Token not found or invalid
  if (!submission) {
    return <InvalidTokenPage />;
  }

  // Check if already paid (status PAID or billingStatus not PENDING)
  if (submission.status === 'PAID' || submission.billingStatus !== 'PENDING') {
    return <AlreadyPaidPage businessName={submission.businessName} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-2">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Order Summary - Left side */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>

              <div className="mt-6 space-y-4">
                {/* Customer Info */}
                <div>
                  <p className="text-sm text-gray-500">Customer</p>
                  <p className="mt-1 font-medium text-gray-900">{submission.fullName}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Business</p>
                  <p className="mt-1 font-medium text-gray-900">{submission.businessName}</p>
                </div>

                <hr className="border-gray-200" />

                {/* Line Items */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Website Setup Fee</p>
                      <p className="text-sm text-gray-500">One-time payment</p>
                    </div>
                    <p className="font-medium text-gray-900">$200.00</p>
                  </div>
                </div>

                <hr className="border-gray-200" />

                {/* Total */}
                <div className="flex justify-between">
                  <p className="text-lg font-semibold text-gray-900">Total</p>
                  <p className="text-lg font-semibold text-gray-900">$200.00</p>
                </div>
              </div>

              {/* What's Included */}
              <div className="mt-6 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">What&apos;s included:</p>
                <ul className="mt-2 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
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
                    Custom website design
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
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
                    Mobile-responsive layout
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
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
                    Initial content setup
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
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
                    Domain configuration
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Payment Section - Right side */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h1 className="text-xl font-semibold text-gray-900">Complete Your Payment</h1>
              <p className="mt-2 text-sm text-gray-600">
                Pay your one-time setup fee to get started with your new website.
              </p>

              {/* Payment Client Component */}
              <SetupFeePaymentClient token={token} />

              {/* Security Badges */}
              <div className="mt-6 flex flex-col items-center gap-4 border-t border-gray-200 pt-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span>Secure payment powered by Stripe</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Visa */}
                  <div className="flex h-8 w-12 items-center justify-center rounded border border-gray-200 bg-white px-1">
                    <span className="text-sm font-bold italic text-[#1a1f71]">VISA</span>
                  </div>
                  {/* Mastercard */}
                  <div className="flex h-8 w-12 items-center justify-center rounded border border-gray-200 bg-white">
                    <div className="flex">
                      <div className="h-5 w-5 rounded-full bg-[#eb001b]" />
                      <div className="-ml-2 h-5 w-5 rounded-full bg-[#f79e1b] opacity-80" />
                    </div>
                  </div>
                  {/* Amex */}
                  <div className="flex h-8 w-12 items-center justify-center rounded bg-[#006fcf] px-1">
                    <span className="text-[10px] font-bold text-white">AMEX</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>

            {/* Need Help */}
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Have questions?{' '}
                <a href="mailto:support@sitestart.com" className="text-blue-600 hover:underline">
                  Contact support
                </a>
              </p>
            </div>
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

/**
 * Invalid Token Page Component
 */
function InvalidTokenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
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

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Invalid Payment Link</h1>
        <p className="mt-3 text-gray-600">
          This payment link is invalid or has expired. Please contact us if you believe this is an error.
        </p>

        <div className="mt-8 space-y-3">
          <a
            href="mailto:support@sitestart.com"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
          <a
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}

/**
 * Already Paid Page Component
 */
function AlreadyPaidPage({ businessName }: { businessName: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
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

        <h1 className="mt-6 text-2xl font-bold text-gray-900">Payment Already Complete</h1>
        <p className="mt-3 text-gray-600">
          The setup fee for <span className="font-medium">{businessName}</span> has already been paid.
          We&apos;re working on your website!
        </p>

        <div className="mt-8 space-y-3">
          <a
            href="mailto:support@sitestart.com"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
          <a
            href="/"
            className="block text-sm text-gray-500 hover:text-gray-700"
          >
            Return to Homepage
          </a>
        </div>
      </div>
    </div>
  );
}
