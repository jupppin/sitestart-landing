/**
 * BillingList Component
 *
 * Client component that displays a list of all submissions with their billing status.
 * Includes search, filtering by billing status, and pagination.
 * Shows billing-specific information like subscription status, invoice dates, and payment links.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import DataTable, { Column } from '../shared/DataTable';
import SearchFilter from '../shared/SearchFilter';
import Pagination from '../shared/Pagination';
import BillingStatusBadge from './BillingStatusBadge';
import PaymentLinkGenerator from './PaymentLinkGenerator';
import type { BillingStatus, PaginatedResponse, StripeSubscriptionStatus } from '@/types/admin';
import type { Submission } from '@/lib/admin/queries';

interface BillingListProps {
  initialData?: PaginatedResponse<Submission>;
}

// Format date for display
function formatDate(date: Date | string | null): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get subscription status badge styling
function getSubscriptionStatusStyle(status: StripeSubscriptionStatus | null): { label: string; className: string } {
  switch (status) {
    case 'active':
      return { label: 'Active', className: 'bg-green-100 text-green-700' };
    case 'past_due':
      return { label: 'Past Due', className: 'bg-amber-100 text-amber-700' };
    case 'canceled':
      return { label: 'Canceled', className: 'bg-gray-100 text-gray-600' };
    case 'unpaid':
      return { label: 'Unpaid', className: 'bg-red-100 text-red-700' };
    default:
      return { label: 'None', className: 'bg-gray-100 text-gray-500' };
  }
}

export default function BillingList({ initialData }: BillingListProps) {
  const [data, setData] = useState<PaginatedResponse<Submission> | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [billingStatusFilter, setBillingStatusFilter] = useState<BillingStatus | ''>('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Fetch billing data from API
  const fetchBillingData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');

      if (billingStatusFilter) {
        params.set('billingStatus', billingStatusFilter);
      }

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/submissions?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch billing data');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, billingStatusFilter]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle billing status filter change
  const handleBillingStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as BillingStatus | '';
    setBillingStatusFilter(value);
    setCurrentPage(1);
  };

  // Toggle expanded row for payment link generator
  const toggleExpandedRow = (id: number) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Define table columns
  const columns: Column<Submission>[] = [
    {
      key: 'client',
      header: 'Client',
      render: (item) => (
        <div>
          <p className="font-medium text-gray-900">{item.fullName}</p>
          <p className="text-xs text-gray-500">{item.businessName}</p>
        </div>
      ),
    },
    {
      key: 'billingStatus',
      header: 'Billing Status',
      render: (item) => (
        <BillingStatusBadge status={item.billingStatus as BillingStatus} size="sm" />
      ),
    },
    {
      key: 'subscriptionStatus',
      header: 'Subscription',
      render: (item) => {
        const style = getSubscriptionStatusStyle(item.subscriptionStatus as StripeSubscriptionStatus | null);
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.className}`}>
            {style.label}
          </span>
        );
      },
    },
    {
      key: 'lastInvoiceDate',
      header: 'Last Invoice',
      render: (item) => (
        <div>
          <p className="text-gray-700">{formatDate(item.lastInvoiceDate)}</p>
          {item.lastInvoicePaidAt && (
            <p className="text-xs text-green-600">
              Paid: {formatDate(item.lastInvoicePaidAt)}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'periodEnd',
      header: 'Period End',
      render: (item) => (
        <span className="text-gray-700">
          {formatDate(item.subscriptionCurrentPeriodEnd)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'w-32',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleExpandedRow(item.id);
          }}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
            expandedRow === item.id
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
          </svg>
          {expandedRow === item.id ? 'Hide Links' : 'Payment Links'}
        </button>
      ),
    },
  ];

  // Custom row rendering to include expanded content
  const renderExpandedContent = (item: Submission) => {
    if (expandedRow !== item.id) return null;

    return (
      <tr key={`${item.id}-expanded`} className="bg-gray-50">
        <td colSpan={columns.length} className="px-6 py-4">
          <PaymentLinkGenerator
            submissionId={item.id}
            hasSetupFeeToken={!!item.setupFeeToken}
            hasSubscriptionToken={!!item.subscriptionToken}
            onLinkGenerated={fetchBillingData}
          />
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Pending</p>
          <p className="mt-1 text-2xl font-semibold text-gray-700">
            {data?.items.filter(i => i.billingStatus === 'PENDING').length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Paid</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {data?.items.filter(i => i.billingStatus === 'PAID').length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Overdue</p>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {data?.items.filter(i => i.billingStatus === 'OVERDUE').length || 0}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-500">Cancelled</p>
          <p className="mt-1 text-2xl font-semibold text-gray-500">
            {data?.items.filter(i => i.billingStatus === 'CANCELLED').length || 0}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="w-full sm:w-64">
            <SearchFilter
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by name or business..."
            />
          </div>

          {/* Billing Status Filter */}
          <select
            value={billingStatusFilter}
            onChange={handleBillingStatusFilterChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Filter by billing status"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-sm text-gray-500">
            {data.total} {data.total === 1 ? 'entry' : 'entries'} found
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchBillingData}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data table with custom rendering for expanded rows */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 ${column.headerClassName || ''}`}
                  >
                    {column.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                // Skeleton loading state
                [...Array(5)].map((_, rowIndex) => (
                  <tr key={rowIndex} className="animate-pulse">
                    {columns.map((_, colIndex) => (
                      <td key={colIndex} className="px-6 py-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data && data.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-sm text-gray-500"
                  >
                    No billing entries found. Billing entries will appear here when submissions are created.
                  </td>
                </tr>
              ) : (
                data?.items.flatMap((item) => [
                  <tr
                    key={item.id}
                    className={
                      item.billingStatus === 'OVERDUE'
                        ? 'bg-red-50/30'
                        : item.billingStatus === 'PAID'
                        ? 'bg-green-50/20'
                        : ''
                    }
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`px-6 py-4 text-sm text-gray-900 ${column.className || ''}`}
                      >
                        {column.render ? column.render(item, 0) : null}
                      </td>
                    ))}
                  </tr>,
                  renderExpandedContent(item),
                ].filter(Boolean))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.totalPages}
          totalItems={data.total}
          itemsPerPage={data.limit}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
