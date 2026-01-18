/**
 * DnsConfigForm Component
 *
 * DNS configuration form for custom domains:
 * - Custom domain input
 * - Instructions for DNS setup
 * - "Configure DNS" button
 * - Shows required DNS records
 * - Status indicator for DNS propagation
 */

'use client';

import { useState, useEffect } from 'react';
import type { CustomerDeployment, DomainStatus } from '@/types/admin';

interface DnsConfigFormProps {
  customerId: number;
  deployment: CustomerDeployment;
  onDeploymentUpdate: (deployment: CustomerDeployment) => void;
  onClose: () => void;
}

interface DnsStatus {
  hasCustomDomain: boolean;
  customDomain: string | null;
  domainStatus: DomainStatus;
  pagesDomain: {
    name: string;
    status: string;
  } | null;
  dnsRecords: Array<{
    id: string;
    type: string;
    name: string;
    content: string;
    proxied: boolean;
  }>;
  requiredRecord: {
    type: string;
    name: string;
    content: string;
    proxied: boolean;
  } | null;
}

// Domain status badge configuration
const domainStatusBadge: Record<
  DomainStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  NONE: {
    label: 'Not Configured',
    className: 'bg-gray-100 text-gray-700',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  DNS_PENDING: {
    label: 'DNS Pending',
    className: 'bg-amber-100 text-amber-700',
    icon: (
      <svg className="h-4 w-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  DNS_CONFIGURED: {
    label: 'DNS Configured',
    className: 'bg-blue-100 text-blue-700',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-700',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  ERROR: {
    label: 'Error',
    className: 'bg-red-100 text-red-700',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

export default function DnsConfigForm({
  customerId,
  deployment,
  onDeploymentUpdate,
  onClose,
}: DnsConfigFormProps) {
  const [customDomain, setCustomDomain] = useState(deployment.customDomain || '');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dnsStatus, setDnsStatus] = useState<DnsStatus | null>(null);

  // Fetch DNS status on mount and when deployment changes
  useEffect(() => {
    if (deployment.customDomain) {
      fetchDnsStatus();
    }
  }, [deployment.customDomain]);

  const fetchDnsStatus = async () => {
    setIsCheckingStatus(true);
    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/deployment/dns`
      );
      const result = await response.json();

      if (result.success) {
        setDnsStatus(result.data);
      }
    } catch (err) {
      console.error('Error fetching DNS status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  // Configure DNS
  const handleConfigureDns = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfiguring(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/deployment/dns`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customDomain }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        // Check if error is "domain already exists" - treat as success
        const errorMsg = result.error || 'Failed to configure DNS';
        if (errorMsg.toLowerCase().includes('already') && errorMsg.toLowerCase().includes('domain')) {
          setSuccess(`Domain "${customDomain}" is already configured and ready to use.`);
          // Refresh DNS status to show current state
          await fetchDnsStatus();
          return;
        }
        throw new Error(errorMsg);
      }

      if (result.data.deployment) {
        onDeploymentUpdate(result.data.deployment);
      }

      // Set success message based on response
      if (result.data.dnsConfigured) {
        setSuccess(`DNS configured successfully! ${customDomain} is now pointing to your site.`);
      } else if (result.data.message) {
        setSuccess(result.data.message);
      } else {
        setSuccess(`Domain "${customDomain}" has been configured successfully.`);
      }

      // Refresh DNS status
      await fetchDnsStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsConfiguring(false);
    }
  };

  const statusBadge = domainStatusBadge[deployment.domainStatus];
  const pagesDevUrl = deployment.cfProjectName
    ? `${deployment.cfProjectName}.pages.dev`
    : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Configure Custom Domain
              </h3>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Success Message */}
            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-3">
                <div className="flex">
                  <svg
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="ml-3 text-sm text-green-700">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
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

            {/* Current Status */}
            {deployment.customDomain && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Current Domain
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge.className}`}
                  >
                    {statusBadge.icon}
                    {statusBadge.label}
                  </span>
                </div>
                <div className="rounded-md bg-gray-50 p-3">
                  <a
                    href={`https://${deployment.customDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {deployment.customDomain}
                  </a>
                </div>
                <button
                  onClick={fetchDnsStatus}
                  disabled={isCheckingStatus}
                  className="mt-2 text-sm text-blue-600 hover:underline disabled:text-gray-400"
                >
                  {isCheckingStatus ? 'Checking...' : 'Refresh Status'}
                </button>
              </div>
            )}

            {/* Domain Input Form */}
            <form onSubmit={handleConfigureDns}>
              <div className="mb-4">
                <label
                  htmlFor="customDomain"
                  className="block text-sm font-medium text-gray-700"
                >
                  {deployment.customDomain ? 'Update Domain' : 'Custom Domain'}
                </label>
                <input
                  type="text"
                  id="customDomain"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                  placeholder="www.example.com"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the full domain (e.g., www.example.com or example.com)
                </p>
              </div>

              {/* DNS Instructions */}
              {pagesDevUrl && (
                <div className="mb-4 rounded-md bg-blue-50 p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    Required DNS Configuration
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    If the domain is not managed by this Cloudflare account, you&apos;ll
                    need to add the following DNS record manually:
                  </p>
                  <div className="rounded-md bg-white p-3 text-sm font-mono">
                    <div className="grid grid-cols-3 gap-2 text-gray-600">
                      <span className="font-semibold">Type</span>
                      <span className="font-semibold">Name</span>
                      <span className="font-semibold">Content</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-1 text-gray-900">
                      <span>CNAME</span>
                      <span>{customDomain || 'your-domain'}</span>
                      <span className="break-all">{pagesDevUrl}</span>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-blue-600">
                    Tip: Enable Cloudflare proxy (orange cloud) for SSL and performance benefits.
                  </p>
                </div>
              )}

              {/* Existing DNS Records */}
              {dnsStatus?.dnsRecords && dnsStatus.dnsRecords.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Current DNS Records
                  </h4>
                  <div className="rounded-md border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">
                            Type
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">
                            Name
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">
                            Content
                          </th>
                          <th className="px-3 py-2 text-left font-medium text-gray-500">
                            Proxied
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {dnsStatus.dnsRecords.map((record) => (
                          <tr key={record.id}>
                            <td className="px-3 py-2 font-mono text-xs">
                              {record.type}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs truncate max-w-[100px]">
                              {record.name}
                            </td>
                            <td className="px-3 py-2 font-mono text-xs truncate max-w-[120px]">
                              {record.content}
                            </td>
                            <td className="px-3 py-2">
                              {record.proxied ? (
                                <span className="text-orange-500">Yes</span>
                              ) : (
                                <span className="text-gray-400">No</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isConfiguring || !customDomain}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isConfiguring ? (
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
                    Configuring...
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
                        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                    {deployment.customDomain ? 'Update Domain' : 'Configure DNS'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
            <p className="text-xs text-gray-500">
              DNS changes may take up to 24 hours to propagate, but typically
              complete within minutes when using Cloudflare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
