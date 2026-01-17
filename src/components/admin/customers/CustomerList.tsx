/**
 * CustomerList Component
 *
 * Client component that displays a list of paying customers with search and pagination.
 * Customers are submissions where status is "PAID".
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column } from '../shared/DataTable';
import SearchFilter from '../shared/SearchFilter';
import Pagination from '../shared/Pagination';
import StatusBadge from '../shared/StatusBadge';
import RevenueDisplay from './RevenueDisplay';
import type { SubmissionStatus, PaginatedResponse } from '@/types/admin';
import type { Submission } from '@/lib/admin/queries';

interface CustomerListProps {
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

export default function CustomerList({ initialData }: CustomerListProps) {
  const router = useRouter();
  const [data, setData] = useState<PaginatedResponse<Submission> | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  // Fetch customers from API
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');
      params.set('status', 'PAID');

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/submissions?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch customers');
      }

      setData(result.data);

      // Calculate total revenue from current page items
      const pageRevenue = result.data.items.reduce(
        (sum: number, item: Submission) => sum + (item.revenue || 0),
        0
      );
      setTotalRevenue(pageRevenue);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search]);

  // Fetch customers on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Handle row click - navigate to customer detail
  const handleRowClick = (customer: Submission) => {
    router.push(`/admin/customers/${customer.id}`);
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

  // Define table columns
  const columns: Column<Submission>[] = [
    {
      key: 'fullName',
      header: 'Name',
      render: (customer) => (
        <div>
          <p className="font-medium text-gray-900">{customer.fullName}</p>
          <p className="text-xs text-gray-500">{customer.email}</p>
        </div>
      ),
    },
    {
      key: 'businessName',
      header: 'Business',
      render: (customer) => (
        <div>
          <p className="font-medium text-gray-900">{customer.businessName}</p>
          {customer.phone && (
            <p className="text-xs text-gray-500">{customer.phone}</p>
          )}
        </div>
      ),
    },
    {
      key: 'industryType',
      header: 'Industry',
      render: (customer) => (
        <span className="capitalize text-gray-700">{customer.industryType}</span>
      ),
    },
    {
      key: 'revenue',
      header: 'Revenue',
      render: (customer) => (
        <RevenueDisplay amount={customer.revenue} size="sm" />
      ),
    },
    {
      key: 'paidAt',
      header: 'Paid Date',
      render: (customer) => (
        <div>
          {customer.paidAt ? (
            <p className="text-gray-700">{formatDate(customer.paidAt)}</p>
          ) : (
            <p className="text-gray-400">--</p>
          )}
        </div>
      ),
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
      {/* Filters and Summary */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="w-full sm:w-64">
            <SearchFilter
              value={search}
              onChange={handleSearchChange}
              placeholder="Search customers..."
            />
          </div>
        </div>

        {/* Results count and revenue summary */}
        <div className="flex items-center gap-4">
          {data && (
            <>
              <p className="text-sm text-gray-500">
                {data.total} {data.total === 1 ? 'customer' : 'customers'}
              </p>
              {totalRevenue > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5">
                  <span className="text-xs font-medium text-green-600">Page Total:</span>
                  <RevenueDisplay amount={totalRevenue} size="sm" />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchCustomers}
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
        keyExtractor={(customer) => customer.id}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        emptyMessage="No customers found. Customers will appear here when leads are marked as paid."
        rowClassName={() => 'bg-green-50/20'}
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
