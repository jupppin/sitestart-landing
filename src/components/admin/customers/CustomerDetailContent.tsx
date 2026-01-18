/**
 * CustomerDetailContent Component
 *
 * Client component that displays all details for a single customer (paid submission).
 * Includes tabbed interface for Overview, Notes, Files, and Deployment.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import StatusBadge from '../shared/StatusBadge';
import NotesEditor from '../leads/NotesEditor';
import RevenueDisplay from './RevenueDisplay';
import { FileList } from '../files';
import { NotesList } from '../notes';
import { DeploymentPanel } from '../deployment';
import type { SubmissionStatus } from '@/types/admin';
import type { Submission } from '@/lib/admin/queries';

// Tab types
type TabId = 'overview' | 'notes' | 'files' | 'deployment';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

interface CustomerDetailContentProps {
  customerId: number;
}

// Tab definitions with icons
const tabs: Tab[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: 'notes',
    label: 'Notes',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    id: 'files',
    label: 'Files',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
      </svg>
    ),
  },
];

// Format date for display
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Format date with time
function formatDateTime(date: Date | string): string {
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

// Parse features from JSON string
function parseFeatures(features: string): string[] {
  try {
    const parsed = JSON.parse(features);
    return Array.isArray(parsed) ? parsed : [features];
  } catch {
    return features.split(',').map((f) => f.trim());
  }
}

export default function CustomerDetailContent({ customerId }: CustomerDetailContentProps) {
  const [customer, setCustomer] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Fetch customer data
  const fetchCustomer = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/submissions/${customerId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customer');
      }

      setCustomer(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [customerId]);

  // Fetch on mount
  useEffect(() => {
    fetchCustomer();
  }, [fetchCustomer]);

  // Handle notes save
  const handleNotesSave = async (notes: string) => {
    const response = await fetch(`/api/admin/submissions/${customerId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ notes }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save notes');
    }

    // Update local state
    setCustomer(result.data);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-24 rounded bg-gray-200"></div>
          <div className="h-6 w-48 rounded bg-gray-200"></div>
        </div>

        {/* Content skeleton */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="h-6 w-32 rounded bg-gray-200 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <div className="h-6 w-24 rounded bg-gray-200 mb-4"></div>
              <div className="h-10 w-full rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-700">Error Loading Customer</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={fetchCustomer}
            className="text-sm font-medium text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
          <a
            href="/admin/customers"
            className="text-sm font-medium text-red-700 underline hover:no-underline"
          >
            Back to Customers
          </a>
        </div>
      </div>
    );
  }

  // Not found state
  if (!customer) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-700">Customer Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">
          The customer you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <a
          href="/admin/customers"
          className="mt-4 inline-block text-sm font-medium text-blue-600 underline hover:no-underline"
        >
          Back to Customers
        </a>
      </div>
    );
  }

  const features = parseFeatures(customer.features);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/admin/customers"
            className="flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg
              className="mr-1 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            Back to Customers
          </a>
          <StatusBadge status={customer.status as SubmissionStatus} />
        </div>
        <p className="text-sm text-gray-500">
          Submitted {formatDateTime(customer.createdAt)}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Revenue Card - Prominent display for customers */}
          <section className="rounded-lg border border-green-200 bg-green-50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium text-green-700">Total Revenue</h2>
                <div className="mt-1">
                  <RevenueDisplay amount={customer.revenue} size="lg" />
                </div>
              </div>
              {customer.paidAt && (
                <div className="text-right">
                  <p className="text-sm font-medium text-green-700">Payment Date</p>
                  <p className="mt-1 text-sm text-green-900">{formatDate(customer.paidAt)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Contact Information */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {customer.email}
                  </a>
                </dd>
              </div>
              {customer.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {customer.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>

          {/* Business Details */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Business Details
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Business Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.businessName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1 text-sm capitalize text-gray-900">
                  {customer.industryType}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Current Website
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.hasNoWebsite ? (
                    <span className="text-gray-500">No current website</span>
                  ) : customer.currentWebsite ? (
                    <a
                      href={
                        customer.currentWebsite.startsWith('http')
                          ? customer.currentWebsite
                          : `https://${customer.currentWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {customer.currentWebsite}
                    </a>
                  ) : (
                    <span className="text-gray-500">Not provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          {/* Project Requirements */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Project Requirements
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">
                  Requested Features
                </dt>
                <dd className="mt-2">
                  <div className="flex flex-wrap gap-2">
                    {features.map((feature, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </dd>
              </div>
              {customer.otherFeatures && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Additional Features
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {customer.otherFeatures}
                  </dd>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget Range</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.budgetRange}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.timeline}</dd>
                </div>
              </div>
              {customer.additionalInfo && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Additional Information
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                    {customer.additionalInfo}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Right column - Notes and Timeline */}
        <div className="space-y-6">
          {/* Notes */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <NotesEditor
              leadId={customerId}
              initialNotes={customer.notes}
              onSave={handleNotesSave}
            />
          </section>

          {/* Timeline */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Timeline</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Submitted</dt>
                <dd className="text-gray-900">{formatDateTime(customer.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">{formatDateTime(customer.updatedAt)}</dd>
              </div>
              {customer.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Converted to Customer</dt>
                  <dd className="text-green-700 font-medium">{formatDateTime(customer.paidAt)}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* Quick Actions */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <a
                href={`mailto:${customer.email}?subject=Re: Your SiteStart Project - ${customer.businessName}`}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Send Email
              </a>
              {customer.phone && (
                <a
                  href={`tel:${customer.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  Call
                </a>
              )}
            </div>
          </section>
        </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <NotesList customerId={customerId} />
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Customer Files</h2>
              <p className="text-sm text-gray-500">Manage logos, photos, and documents</p>
            </div>
            <FileList customerId={customerId} />
          </div>
        )}

        {/* Deployment Tab */}
        {activeTab === 'deployment' && (
          <DeploymentPanel customerId={customerId} />
        )}
      </div>
    </div>
  );
}
