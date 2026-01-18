/**
 * DeploymentCard Component
 *
 * Overview card showing deployment configuration and status.
 * Displays:
 * - Current deployment status
 * - Production URL (if deployed)
 * - Custom domain (if configured)
 * - Last deployment time
 * - Git repo info
 * - Domain status indicator
 */

'use client';

import type { CustomerDeployment, DomainStatus } from '@/types/admin';
import DeploymentStatus from './DeploymentStatus';

interface DeploymentCardProps {
  deployment: CustomerDeployment | null;
  isLoading?: boolean;
}

// Domain status configuration
const domainStatusConfig: Record<
  DomainStatus,
  { label: string; className: string; description: string }
> = {
  NONE: {
    label: 'Not Configured',
    className: 'text-gray-500',
    description: 'No custom domain set up',
  },
  DNS_PENDING: {
    label: 'DNS Pending',
    className: 'text-amber-600',
    description: 'Waiting for DNS propagation',
  },
  DNS_CONFIGURED: {
    label: 'DNS Configured',
    className: 'text-blue-600',
    description: 'DNS records created, verifying...',
  },
  ACTIVE: {
    label: 'Active',
    className: 'text-green-600',
    description: 'Domain is live and working',
  },
  ERROR: {
    label: 'Error',
    className: 'text-red-600',
    description: 'DNS configuration error',
  },
};

// Format date for display
function formatDateTime(date: Date | string | null): string {
  if (!date) return 'Never';
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Extract repo name from git URL
function extractRepoName(gitUrl: string | null): string {
  if (!gitUrl) return 'Not connected';
  const match = gitUrl.match(/github\.com[/:]([^/]+\/[^/.]+)/);
  return match ? match[1] : gitUrl;
}

export default function DeploymentCard({
  deployment,
  isLoading = false,
}: DeploymentCardProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 rounded bg-gray-200"></div>
            <div className="h-6 w-24 rounded-full bg-gray-200"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    );
  }

  // No deployment configured
  if (!deployment) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Deployment</h3>
          <DeploymentStatus status="NOT_DEPLOYED" />
        </div>
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-600">
            No deployment configured yet
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Initialize deployment to create a Cloudflare Pages project
          </p>
        </div>
      </div>
    );
  }

  const domainConfig = domainStatusConfig[deployment.domainStatus];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Deployment</h3>
        <DeploymentStatus status={deployment.deploymentStatus} />
      </div>

      {/* Deployment Info Grid */}
      <dl className="space-y-4">
        {/* Project Name */}
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-gray-500">Project</dt>
          <dd className="text-sm text-gray-900 text-right">
            {deployment.cfProjectName || (
              <span className="text-gray-400">Not created</span>
            )}
          </dd>
        </div>

        {/* Production URL */}
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-gray-500">Production URL</dt>
          <dd className="text-sm text-right">
            {deployment.cfProductionUrl ? (
              <a
                href={deployment.cfProductionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1"
              >
                {deployment.cfProductionUrl.replace('https://', '')}
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
                    d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            ) : (
              <span className="text-gray-400">Not deployed</span>
            )}
          </dd>
        </div>

        {/* Custom Domain */}
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-gray-500">Custom Domain</dt>
          <dd className="text-sm text-right">
            {deployment.customDomain ? (
              <div className="flex flex-col items-end gap-1">
                <a
                  href={`https://${deployment.customDomain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {deployment.customDomain}
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
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
                <span
                  className={`text-xs ${domainConfig.className}`}
                  title={domainConfig.description}
                >
                  {domainConfig.label}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Not configured</span>
            )}
          </dd>
        </div>

        {/* Git Repository */}
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-gray-500">Git Repository</dt>
          <dd className="text-sm text-right">
            {deployment.gitRepoUrl ? (
              <div className="flex flex-col items-end gap-1">
                <a
                  href={deployment.gitRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  {extractRepoName(deployment.gitRepoUrl)}
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
                      d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                    />
                  </svg>
                </a>
                <span className="text-xs text-gray-500">
                  Branch: {deployment.gitBranch}
                </span>
              </div>
            ) : (
              <span className="text-gray-400">Not connected</span>
            )}
          </dd>
        </div>

        {/* Last Deployment */}
        <div className="flex items-start justify-between">
          <dt className="text-sm font-medium text-gray-500">Last Deployment</dt>
          <dd className="text-sm text-gray-900">
            {formatDateTime(deployment.lastDeploymentAt)}
          </dd>
        </div>

        {/* Deployment Error (if any) */}
        {deployment.lastDeploymentError && (
          <div className="mt-4 rounded-md bg-red-50 p-3">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-red-800">
                  Deployment Error
                </h4>
                <p className="mt-1 text-sm text-red-700">
                  {deployment.lastDeploymentError}
                </p>
              </div>
            </div>
          </div>
        )}
      </dl>
    </div>
  );
}
