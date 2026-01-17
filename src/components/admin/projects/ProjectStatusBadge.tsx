/**
 * ProjectStatusBadge Component
 *
 * Displays the project status with color-coded styling.
 * Status colors:
 * - NOT_STARTED: gray
 * - JUST_STARTED: blue
 * - IN_PROGRESS: yellow
 * - WAITING_FOR_FEEDBACK: purple
 * - FINISHED_AND_LIVE: green
 * - ON_HOLD: orange
 * - CANCELLED: red
 */

import type { ProjectStatus } from '@/types/admin';

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  NOT_STARTED: {
    label: 'Not Started',
    className: 'bg-gray-100 text-gray-700',
  },
  JUST_STARTED: {
    label: 'Just Started',
    className: 'bg-blue-100 text-blue-700',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    className: 'bg-yellow-100 text-yellow-700',
  },
  WAITING_FOR_FEEDBACK: {
    label: 'Waiting for Feedback',
    className: 'bg-purple-100 text-purple-700',
  },
  FINISHED_AND_LIVE: {
    label: 'Finished & Live',
    className: 'bg-green-100 text-green-700',
  },
  ON_HOLD: {
    label: 'On Hold',
    className: 'bg-orange-100 text-orange-700',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-700',
  },
};

export default function ProjectStatusBadge({ status, size = 'md' }: ProjectStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.NOT_STARTED;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClasses} ${config.className}`}
      role="status"
      aria-label={`Project status: ${config.label}`}
    >
      {config.label}
    </span>
  );
}
