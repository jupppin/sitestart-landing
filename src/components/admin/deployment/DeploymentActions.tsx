/**
 * DeploymentActions Component
 *
 * Action buttons for deployment operations:
 * - "Initialize Deployment" button (if not deployed)
 * - "Deploy Now" button (if initialized)
 * - "Configure Domain" button
 * - Loading states for each action
 */

'use client';

import { useState } from 'react';
import type { CustomerDeployment } from '@/types/admin';

interface DeploymentActionsProps {
  customerId: number;
  deployment: CustomerDeployment | null;
  onDeploymentUpdate: (deployment: CustomerDeployment) => void;
  onDeploymentDeleted: () => void;
  onShowDnsConfig: () => void;
}

interface InitializeFormData {
  cfProjectName: string;
  gitRepoUrl: string;
  gitBranch: string;
}

export default function DeploymentActions({
  customerId,
  deployment,
  onDeploymentUpdate,
  onDeploymentDeleted,
  onShowDnsConfig,
}: DeploymentActionsProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showInitForm, setShowInitForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProjectToo, setDeleteProjectToo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<InitializeFormData>({
    cfProjectName: '',
    gitRepoUrl: '',
    gitBranch: 'main',
  });

  // Delete deployment
  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const url = `/api/admin/customers/${customerId}/deployment${deleteProjectToo ? '?deleteProject=true' : ''}`;
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete deployment');
      }

      setShowDeleteConfirm(false);
      onDeploymentDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  // Initialize deployment (create CF Pages project)
  const handleInitialize = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInitializing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/deployment`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cfProjectName: formData.cfProjectName,
            gitRepoUrl: formData.gitRepoUrl || undefined,
            gitBranch: formData.gitBranch || 'main',
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to initialize deployment');
      }

      onDeploymentUpdate(result.data);
      setShowInitForm(false);
      setFormData({ cfProjectName: '', gitRepoUrl: '', gitBranch: 'main' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsInitializing(false);
    }
  };

  // Trigger deployment
  const handleDeploy = async () => {
    setIsDeploying(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/deployment/deploy`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to trigger deployment');
      }

      onDeploymentUpdate(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsDeploying(false);
    }
  };

  // Not initialized - show initialize form
  if (!deployment?.cfProjectId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Deployment Actions
        </h3>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3">
            <div className="flex">
              <svg
                className="h-5 w-5 text-red-400"
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
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {!showInitForm ? (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">
              Create a Cloudflare Pages project to deploy this customer&apos;s site.
            </p>
            <button
              onClick={() => setShowInitForm(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
              Initialize Deployment
            </button>
          </div>
        ) : (
          <form onSubmit={handleInitialize} className="space-y-4">
            {/* Project Name */}
            <div>
              <label
                htmlFor="cfProjectName"
                className="block text-sm font-medium text-gray-700"
              >
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="cfProjectName"
                value={formData.cfProjectName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    cfProjectName: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                  }))
                }
                placeholder="customer-site-name"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Lowercase letters, numbers, and hyphens only. This will be your
                *.pages.dev subdomain.
              </p>
            </div>

            {/* Git Repository URL (optional) */}
            <div>
              <label
                htmlFor="gitRepoUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Git Repository URL <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="url"
                id="gitRepoUrl"
                value={formData.gitRepoUrl}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gitRepoUrl: e.target.value }))
                }
                placeholder="https://github.com/owner/repo"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Connect to GitHub for automatic deployments on push.
              </p>
            </div>

            {/* Git Branch */}
            <div>
              <label
                htmlFor="gitBranch"
                className="block text-sm font-medium text-gray-700"
              >
                Production Branch
              </label>
              <input
                type="text"
                id="gitBranch"
                value={formData.gitBranch}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, gitBranch: e.target.value }))
                }
                placeholder="main"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isInitializing || !formData.cfProjectName}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isInitializing ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
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
                    Creating...
                  </>
                ) : (
                  <>
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
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Create Project
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInitForm(false);
                  setError(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // Deployment initialized - show deploy and domain actions
  const isDeployingState = deployment.deploymentStatus === 'DEPLOYING' || isDeploying;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Deployment Actions
      </h3>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
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
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {/* Deploy Now Button */}
        <button
          onClick={handleDeploy}
          disabled={isDeployingState}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isDeployingState ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
              Deploying...
            </>
          ) : (
            <>
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
                  d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
                />
              </svg>
              Deploy Now
            </>
          )}
        </button>

        {/* Configure Domain Button */}
        <button
          onClick={onShowDnsConfig}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
          {deployment.customDomain ? 'Manage Domain' : 'Configure Domain'}
        </button>

        {/* View on Cloudflare */}
        {deployment.cfProjectName && (
          <a
            href={`https://dash.cloudflare.com/?to=/:account/pages/view/${deployment.cfProjectName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.5 2.25a.75.75 0 01.75.75v2.25h2.25a.75.75 0 010 1.5h-2.25v2.25a.75.75 0 01-1.5 0V6.75H13.5a.75.75 0 010-1.5h2.25V3a.75.75 0 01.75-.75zM5.25 6a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h11.5a.75.75 0 00.75-.75v-5.25a.75.75 0 011.5 0v5.25a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18.25V6.75A2.25 2.25 0 015.25 4.5h5.25a.75.75 0 010 1.5H5.25z" />
            </svg>
            View on Cloudflare
          </a>
        )}

        {/* Delete Deployment Button */}
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Delete Deployment
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Delete Deployment?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This will remove the deployment configuration for this customer.
            </p>

            <div className="mt-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={deleteProjectToo}
                  onChange={(e) => setDeleteProjectToo(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">
                  Also delete the Cloudflare Pages project
                  {deployment.cfProjectName && (
                    <span className="text-gray-500"> ({deployment.cfProjectName})</span>
                  )}
                </span>
              </label>
              {deleteProjectToo && (
                <p className="mt-1 ml-6 text-xs text-red-600">
                  Warning: This cannot be undone. The site will go offline.
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setError(null);
                }}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400"
              >
                {isDeleting ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helpful info */}
      <div className="mt-4 rounded-md bg-gray-50 p-3">
        <p className="text-xs text-gray-600">
          <strong>Tip:</strong> After deploying, you can configure a custom domain
          to make the site accessible via your customer&apos;s own domain.
        </p>
      </div>
    </div>
  );
}
