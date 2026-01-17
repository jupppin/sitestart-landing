/**
 * LeadDetailContent Component
 *
 * Client component that displays all details for a single lead.
 * Includes status actions and notes editor.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StatusBadge from '../shared/StatusBadge';
import LeadStatusActions from './LeadStatusActions';
import NotesEditor from './NotesEditor';
import type { SubmissionStatus } from '@/types/admin';
import type { Submission } from '@/lib/admin/queries';

interface LeadDetailContentProps {
  leadId: number;
}

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

export default function LeadDetailContent({ leadId }: LeadDetailContentProps) {
  const router = useRouter();
  const [lead, setLead] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch lead data
  const fetchLead = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/submissions/${leadId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch lead');
      }

      setLead(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  // Fetch on mount
  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // Handle status change
  const handleStatusChange = async (newStatus: SubmissionStatus, revenue?: number) => {
    const response = await fetch(`/api/admin/submissions/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
        ...(revenue !== undefined && { revenue }),
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update status');
    }

    // Update local state
    setLead(result.data);

    // If marked as PAID, redirect to customers page after a short delay
    if (newStatus === 'PAID') {
      setTimeout(() => {
        router.push('/admin/customers');
      }, 1500);
    }
  };

  // Handle notes save
  const handleNotesSave = async (notes: string) => {
    const response = await fetch(`/api/admin/submissions/${leadId}`, {
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
    setLead(result.data);
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
        <h2 className="text-lg font-semibold text-red-700">Error Loading Lead</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={fetchLead}
            className="text-sm font-medium text-red-700 underline hover:no-underline"
          >
            Retry
          </button>
          <a
            href="/admin/leads"
            className="text-sm font-medium text-red-700 underline hover:no-underline"
          >
            Back to Leads
          </a>
        </div>
      </div>
    );
  }

  // Not found state
  if (!lead) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-700">Lead Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">
          The lead you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <a
          href="/admin/leads"
          className="mt-4 inline-block text-sm font-medium text-blue-600 underline hover:no-underline"
        >
          Back to Leads
        </a>
      </div>
    );
  }

  const features = parseFeatures(lead.features);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/admin/leads"
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
            Back to Leads
          </a>
          <StatusBadge status={lead.status as SubmissionStatus} />
        </div>
        <p className="text-sm text-gray-500">
          Submitted {formatDateTime(lead.createdAt)}
        </p>
      </div>

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact Information */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Full Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{lead.fullName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <a
                    href={`mailto:${lead.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {lead.email}
                  </a>
                </dd>
              </div>
              {lead.phone && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={`tel:${lead.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {lead.phone}
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
                <dd className="mt-1 text-sm text-gray-900">{lead.businessName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Industry</dt>
                <dd className="mt-1 text-sm capitalize text-gray-900">
                  {lead.industryType}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">
                  Current Website
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {lead.hasNoWebsite ? (
                    <span className="text-gray-500">No current website</span>
                  ) : lead.currentWebsite ? (
                    <a
                      href={
                        lead.currentWebsite.startsWith('http')
                          ? lead.currentWebsite
                          : `https://${lead.currentWebsite}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {lead.currentWebsite}
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
              {lead.otherFeatures && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Additional Features
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {lead.otherFeatures}
                  </dd>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget Range</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.budgetRange}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Timeline</dt>
                  <dd className="mt-1 text-sm text-gray-900">{lead.timeline}</dd>
                </div>
              </div>
              {lead.additionalInfo && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Additional Information
                  </dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                    {lead.additionalInfo}
                  </dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        {/* Right column - Actions and Notes */}
        <div className="space-y-6">
          {/* Status Actions */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Status Actions
            </h2>
            <LeadStatusActions
              leadId={leadId}
              currentStatus={lead.status as SubmissionStatus}
              onStatusChange={handleStatusChange}
            />
          </section>

          {/* Notes */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <NotesEditor
              leadId={leadId}
              initialNotes={lead.notes}
              onSave={handleNotesSave}
            />
          </section>

          {/* Timestamps */}
          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Timeline</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-900">{formatDateTime(lead.createdAt)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Last Updated</dt>
                <dd className="text-gray-900">{formatDateTime(lead.updatedAt)}</dd>
              </div>
              {lead.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Converted</dt>
                  <dd className="text-gray-900">{formatDateTime(lead.paidAt)}</dd>
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
                href={`mailto:${lead.email}?subject=Re: Your SiteStart Inquiry - ${lead.businessName}`}
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
              {lead.phone && (
                <a
                  href={`tel:${lead.phone}`}
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
    </div>
  );
}
