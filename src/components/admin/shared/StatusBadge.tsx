/**
 * StatusBadge Component
 *
 * Displays the submission status with appropriate styling.
 * Follows the status workflow: NEW (gray) -> CONTACTED (amber) -> PAID (green)
 */

import type { SubmissionStatus } from '@/types/admin';

interface StatusBadgeProps {
  status: SubmissionStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<SubmissionStatus, { label: string; className: string }> = {
  NEW: {
    label: 'New',
    className: 'bg-gray-100 text-gray-700',
  },
  CONTACTED: {
    label: 'Contacted',
    className: 'bg-amber-100 text-amber-700',
  },
  PAID: {
    label: 'Paid',
    className: 'bg-green-100 text-green-700',
  },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.NEW;

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
