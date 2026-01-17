/**
 * LeadList Component
 *
 * Client component that displays a list of leads with search, filtering, and pagination.
 * Leads are submissions where status is NOT "PAID" (i.e., NEW or CONTACTED).
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '../shared/DataTable';
import SearchFilter from '../shared/SearchFilter';
import Pagination from '../shared/Pagination';
import StatusBadge from '../shared/StatusBadge';
import type { SubmissionStatus, PaginatedResponse } from '@/types/admin';
import type { Submission } from '@/lib/admin/queries';

interface LeadListProps {
  initialData?: PaginatedResponse<Submission>;
}

// Format date for display
function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Calculate days since submission
function daysSince(date: Date | string): number {
  const d = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export default function LeadList({ initialData }: LeadListProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Submission> | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<SubmissionStatus | ''>('');

  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');

      // Filter for leads only (NEW or CONTACTED)
      // Note: We'll handle this on the API side with the status filter
      if (statusFilter) {
        params.set('status', statusFilter);
      }

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/submissions?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch leads');
      }

      // Filter out PAID submissions on client side if no status filter is set
      if (!statusFilter) {
        result.data.items = result.data.items.filter(
          (item: Submission) => item.status !== 'PAID'
        );
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  // Fetch leads on mount and when filters change
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Handle row click - navigate to lead detail
  const handleRowClick = (lead: Submission) => {
    router.push(`/admin/leads/${lead.id}`);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as SubmissionStatus | '';
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Define table columns
  const columns: Column<Submission>[] = [
    {
      key: 'fullName',
      header: 'Name',
      render: (lead) => (
        <div>
          <p className="font-medium text-gray-900">{lead.fullName}</p>
          <p className="text-xs text-gray-500">{lead.email}</p>
        </div>
      ),
    },
    {
      key: 'businessName',
      header: 'Business',
      render: (lead) => (
        <div>
          <p className="font-medium text-gray-900">{lead.businessName}</p>
          {lead.phone && (
            <p className="text-xs text-gray-500">{lead.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'industryType',
      header: 'Industry',
      render: (lead) => (
        <span className="capitalize text-gray-700">{lead.industryType}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (lead) => (
        <StatusBadge status={lead.status as SubmissionStatus} size="sm" />
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (lead) => {
        const days = daysSince(lead.createdAt);
        return (
          <div>
            <p className="text-gray-700">{formatDate(lead.createdAt)}</p>
            <p className="text-xs text-gray-500">
              {days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`}
            </p>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      headerClassName: 'w-12',
      render: () => (
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 4.5l7.5 7.5-7.5 7.5"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="w-full sm:w-64">
            <SearchFilter
              value={search}
              onChange={handleSearchChange}
              placeholder="Search leads..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Filter by status"
          >
            <option value="">All Leads</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
          </select>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-sm text-gray-500">
            {data.total} {data.total === 1 ? 'lead' : 'leads'} found
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchLeads}
            className="ml-2 font-medium underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Data table */}
      <DataTable
        columns={columns}
        data={data?.items || []}
        keyExtractor={(lead) => lead.id}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        emptyMessage="No leads found. Leads will appear here when intake forms are submitted."
        rowClassName={(lead) => {
          // Highlight new leads that haven't been contacted
          if (lead.status === 'NEW') {
            return 'bg-blue-50/30';
          }
          return '';
        }}
      />

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
