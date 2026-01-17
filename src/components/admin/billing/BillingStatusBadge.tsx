/**
 * BillingStatusBadge Component
 *
 * Displays the billing status with appropriate color-coded styling.
 * Status colors:
 * - PENDING: Gray (not yet paid)
 * - PAID: Green (subscription active)
 * - OVERDUE: Red (7+ days without payment)
 * - CANCELLED: Gray (subscription cancelled)
 */

import type { BillingStatus } from '@/types/admin';

interface BillingStatusBadgeProps {
  status: BillingStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<BillingStatus, { label: string; className: string }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-green-100 text-green-700',
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'bg-red-100 text-red-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-600',
  },
};

export default function BillingStatusBadge({ status, size = 'md' }: BillingStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.PENDING;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses} ${config.className}`}
    >
      {config.label}
    </span>
  );
}
