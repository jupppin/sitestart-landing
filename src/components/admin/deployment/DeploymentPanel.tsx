/**
 * DeploymentPanel Component
 *
 * Main container component that combines all deployment components.
 * Fetches deployment data and orchestrates the deployment UI.
 *
 * Usage:
 * <DeploymentPanel customerId={123} />
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CustomerDeployment } from '@/types/admin';
import DeploymentCard from './DeploymentCard';
import DeploymentActions from './DeploymentActions';
import DnsConfigForm from './DnsConfigForm';

interface DeploymentPanelProps {
  customerId: number;
}

export default function DeploymentPanel({ customerId }: DeploymentPanelProps) {
  const [deployment, setDeployment] = useState<CustomerDeployment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDnsConfig, setShowDnsConfig] = useState(false);

  // Fetch deployment data
  const fetchDeployment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/customers/${customerId}/deployment`
      );
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch deployment');
      }

      setDeployment(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // Fetch on mount
  useEffect(() => {
    fetchDeployment();
  }, [fetchDeployment]);

  // Poll for deployment status when deploying
  useEffect(() => {
    if (deployment?.deploymentStatus !== 'DEPLOYING') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/admin/customers/${customerId}/deployment/deploy`
        );
        const result = await response.json();

        if (result.success && result.data) {
          // Check if deployment status changed
          const cloudflareStatus = result.data.localStatus;
          if (cloudflareStatus && cloudflareStatus !== 'DEPLOYING') {
            // Refresh deployment data
            await fetchDeployment();
          }
        }
      } catch (err) {
        console.error('Error polling deployment status:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [deployment?.deploymentStatus, customerId, fetchDeployment]);

  // Handle deployment update
  const handleDeploymentUpdate = (updatedDeployment: CustomerDeployment) => {
    setDeployment(updatedDeployment);
  };

  // Handle deployment deleted
  const handleDeploymentDeleted = () => {
    setDeployment(null);
  };

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-red-700">
          Error Loading Deployment
        </h3>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchDeployment}
          className="mt-4 text-sm font-medium text-red-700 underline hover:no-underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deployment Overview Card */}
      <DeploymentCard deployment={deployment} isLoading={isLoading} />

      {/* Deployment Actions */}
      {!isLoading && (
        <DeploymentActions
          customerId={customerId}
          deployment={deployment}
          onDeploymentUpdate={handleDeploymentUpdate}
          onDeploymentDeleted={handleDeploymentDeleted}
          onShowDnsConfig={() => setShowDnsConfig(true)}
        />
      )}

      {/* DNS Configuration Modal */}
      {showDnsConfig && deployment && (
        <DnsConfigForm
          customerId={customerId}
          deployment={deployment}
          onDeploymentUpdate={handleDeploymentUpdate}
          onClose={() => setShowDnsConfig(false)}
        />
      )}
    </div>
  );
}
