/**
 * LeadStatusActions Component
 *
 * Provides buttons to update the status of a lead.
 * Follows the status workflow: NEW -> CONTACTED -> PAID
 * When marking as PAID, prompts for revenue amount.
 */

'use client';

import { useState } from 'react';
import type { SubmissionStatus } from '@/types/admin';

interface LeadStatusActionsProps {
  leadId: number;
  currentStatus: SubmissionStatus;
  onStatusChange: (newStatus: SubmissionStatus, revenue?: number) => Promise<void>;
  disabled?: boolean;
}

export default function LeadStatusActions({
  leadId,
  currentStatus,
  onStatusChange,
  disabled = false,
}: LeadStatusActionsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [revenue, setRevenue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Handle status change
  const handleStatusChange = async (newStatus: SubmissionStatus) => {
    // If changing to PAID, show revenue modal first
    if (newStatus === 'PAID') {
      setShowRevenueModal(true);
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await onStatusChange(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async () => {
    const revenueAmount = parseFloat(revenue);

    if (isNaN(revenueAmount) || revenueAmount < 0) {
      setError('Please enter a valid revenue amount');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await onStatusChange('PAID', revenueAmount);
      setShowRevenueModal(false);
      setRevenue('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowRevenueModal(false);
    setRevenue('');
    setError(null);
  };

  // Get available next statuses based on current status
  const getNextStatuses = (): SubmissionStatus[] => {
    switch (currentStatus) {
      case 'NEW':
        return ['CONTACTED', 'PAID'];
      case 'CONTACTED':
        return ['PAID'];
      case 'PAID':
        return []; // No further status changes from PAID
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatuses();

  // Button styling based on status
  const getButtonStyle = (status: SubmissionStatus) => {
    switch (status) {
      case 'CONTACTED':
        return 'bg-amber-600 hover:bg-amber-700 text-white';
      case 'PAID':
        return 'bg-green-600 hover:bg-green-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  // Button label based on status
  const getButtonLabel = (status: SubmissionStatus) => {
    switch (status) {
      case 'CONTACTED':
        return 'Mark as Contacted';
      case 'PAID':
        return 'Mark as Paid';
      default:
        return `Set to ${status}`;
    }
  };

  if (nextStatuses.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        This lead has been converted to a customer.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Status action buttons */}
      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <button
            key={status}
            onClick={() => handleStatusChange(status)}
            disabled={disabled || isUpdating}
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${getButtonStyle(status)} ${
              status === 'PAID' ? 'focus:ring-green-500' : 'focus:ring-amber-500'
            }`}
          >
            {isUpdating && !showRevenueModal ? (
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : status === 'CONTACTED' ? (
              <svg
                className="mr-2 h-4 w-4"
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
            ) : (
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
            {getButtonLabel(status)}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && !showRevenueModal && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Revenue Modal */}
      {showRevenueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Enter Payment Amount
            </h3>
            <p className="mb-4 text-sm text-gray-600">
              Please enter the revenue amount for this conversion.
            </p>

            <div className="mb-4">
              <label
                htmlFor={`revenue-${leadId}`}
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Revenue Amount ($)
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  $
                </span>
                <input
                  id={`revenue-${leadId}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  placeholder="0.00"
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-7 pr-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-600">{error}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleModalClose}
                disabled={isUpdating}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePaymentSubmit}
                disabled={isUpdating || !revenue}
                className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating && (
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                Mark as Paid
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
