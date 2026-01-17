/**
 * PaymentLinkGenerator Component
 *
 * Provides buttons to generate and copy payment/subscription links.
 * Calls the existing APIs:
 * - POST /api/admin/submissions/[id]/generate-payment-link (setup fee)
 * - POST /api/admin/submissions/[id]/generate-subscription-link (subscription)
 */

'use client';

import { useState } from 'react';

interface PaymentLinkGeneratorProps {
  submissionId: number;
  hasSetupFeeToken?: boolean;
  hasSubscriptionToken?: boolean;
  onLinkGenerated?: () => void;
}

type LinkType = 'payment' | 'subscription';

export default function PaymentLinkGenerator({
  submissionId,
  hasSetupFeeToken = false,
  hasSubscriptionToken = false,
  onLinkGenerated,
}: PaymentLinkGeneratorProps) {
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<LinkType | null>(null);
  const [isLoading, setIsLoading] = useState<LinkType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLink = async (type: LinkType) => {
    setIsLoading(type);
    setError(null);
    setGeneratedLink(null);
    setCopied(false);

    try {
      const endpoint = type === 'payment'
        ? `/api/admin/submissions/${submissionId}/generate-payment-link`
        : `/api/admin/submissions/${submissionId}/generate-subscription-link`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || `Failed to generate ${type} link`);
      }

      setGeneratedLink(result.url);
      setLinkType(type);
      // Note: We don't call onLinkGenerated here because it would refresh the parent
      // and cause this component to lose its state before the user can copy the link
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(null);
    }
  };

  const copyToClipboard = async () => {
    if (!generatedLink) return;

    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  };

  const closeLink = () => {
    setGeneratedLink(null);
    setLinkType(null);
    setCopied(false);
  };

  return (
    <div className="space-y-3">
      {/* Generate Link Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => generateLink('payment')}
          disabled={isLoading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          title={hasSetupFeeToken ? 'Regenerate setup fee payment link' : 'Generate setup fee payment link'}
        >
          {isLoading === 'payment' ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          )}
          {hasSetupFeeToken ? 'Regenerate' : 'Generate'} Payment Link
        </button>

        <button
          onClick={() => generateLink('subscription')}
          disabled={isLoading !== null}
          className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          title={hasSubscriptionToken ? 'Regenerate subscription link' : 'Generate subscription link'}
        >
          {isLoading === 'subscription' ? (
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          )}
          {hasSubscriptionToken ? 'Regenerate' : 'Generate'} Subscription Link
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Generated Link Display */}
      {generatedLink && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">
              {linkType === 'payment' ? 'Setup Fee Payment Link' : 'Subscription Link'}
            </span>
            <button
              onClick={closeLink}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={generatedLink}
              readOnly
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <button
              onClick={copyToClipboard}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {copied ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
