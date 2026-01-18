/**
 * DeploymentStatus Component
 *
 * Color-coded status badge for deployment status.
 * Shows appropriate icon and text for each deployment state.
 *
 * Status colors:
 * - NOT_DEPLOYED: gray (circle icon)
 * - DEPLOYING: blue with animation (rocket icon)
 * - DEPLOYED: green (check icon)
 * - FAILED: red (x icon)
 */

import type { DeploymentStatus as DeploymentStatusType } from '@/types/admin';

interface DeploymentStatusProps {
  status: DeploymentStatusType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const statusConfig: Record<
  DeploymentStatusType,
  {
    label: string;
    className: string;
    icon: React.ReactNode;
  }
> = {
  NOT_DEPLOYED: {
    label: 'Not Deployed',
    className: 'bg-gray-100 text-gray-700',
    icon: (
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  DEPLOYING: {
    label: 'Deploying',
    className: 'bg-blue-100 text-blue-700',
    icon: (
      <svg
        className="h-3.5 w-3.5 animate-pulse"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
      </svg>
    ),
  },
  DEPLOYED: {
    label: 'Deployed',
    className: 'bg-green-100 text-green-700',
    icon: (
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700',
    icon: (
      <svg
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
};

export default function DeploymentStatus({
  status,
  size = 'md',
  showIcon = true,
}: DeploymentStatusProps) {
  const config = statusConfig[status] || statusConfig.NOT_DEPLOYED;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium whitespace-nowrap ${sizeClasses[size]} ${config.className}`}
      role="status"
      aria-label={`Deployment status: ${config.label}`}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}
