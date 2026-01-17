/**
 * ProjectList Component
 *
 * Client component that displays a list of projects with search, filtering, and pagination.
 * Shows all submissions with their project status for tracking project progress.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import DataTable, { Column } from '../shared/DataTable';
import SearchFilter from '../shared/SearchFilter';
import Pagination from '../shared/Pagination';
import ProjectStatusBadge from './ProjectStatusBadge';
import ProjectStatusActions from './ProjectStatusActions';
import type { ProjectStatus, PaginatedResponse } from '@/types/admin';
import type { Submission } from '@/lib/admin/queries';

interface ProjectListProps {
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

export default function ProjectList({ initialData }: ProjectListProps) {
  const [data, setData] = useState<PaginatedResponse<Submission> | null>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | ''>('');

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('page', currentPage.toString());
      params.set('limit', '10');

      if (statusFilter) {
        params.set('projectStatus', statusFilter);
      }

      if (search) {
        params.set('search', search);
      }

      const response = await fetch(`/api/admin/submissions?${params.toString()}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch projects');
      }

      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, statusFilter]);

  // Fetch projects on mount and when filters change
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as ProjectStatus | '';
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle project update
  const handleProjectUpdate = async (
    projectId: number,
    updateData: {
      projectStatus?: ProjectStatus;
      projectNotes?: string;
      liveUrl?: string;
      goLiveDate?: string | null;
    }
  ) => {
    const response = await fetch(`/api/admin/submissions/${projectId}/project-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update project');
    }

    // Refresh the list after update
    await fetchProjects();
  };

  // Define table columns
  const columns: Column<Submission>[] = [
    {
      key: 'client',
      header: 'Client',
      render: (project) => (
        <div>
          <p className="font-medium text-gray-900">{project.fullName}</p>
          <p className="text-xs text-gray-500">{project.email}</p>
        </div>
      ),
    },
    {
      key: 'business',
      header: 'Business',
      render: (project) => (
        <div>
          <p className="font-medium text-gray-900">{project.businessName}</p>
          <p className="text-xs text-gray-500 capitalize">{project.industryType}</p>
        </div>
      ),
    },
    {
      key: 'projectStatus',
      header: 'Project Status',
      render: (project) => (
        <ProjectStatusBadge
          status={project.projectStatus as ProjectStatus}
          size="sm"
        />
      ),
    },
    {
      key: 'goLiveDate',
      header: 'Go-Live Date',
      render: (project) => (
        <span className="text-gray-700">
          {formatDate(project.goLiveDate)}
        </span>
      ),
    },
    {
      key: 'liveUrl',
      header: 'Live URL',
      render: (project) => (
        project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="max-w-[150px] truncate">{project.liveUrl.replace(/^https?:\/\//, '')}</span>
            <svg
              className="ml-1 h-3 w-3 flex-shrink-0"
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
          <span className="text-gray-400">-</span>
        )
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'w-64',
      render: (project) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectStatusActions
            projectId={project.id}
            currentStatus={project.projectStatus as ProjectStatus}
            currentNotes={project.projectNotes}
            currentLiveUrl={project.liveUrl}
            currentGoLiveDate={project.goLiveDate}
            onUpdate={(data) => handleProjectUpdate(project.id, data)}
          />
        </div>
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
              placeholder="Search by name or business..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={handleStatusFilterChange}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            aria-label="Filter by project status"
          >
            <option value="">All Projects</option>
            <option value="NOT_STARTED">Not Started</option>
            <option value="JUST_STARTED">Just Started</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="WAITING_FOR_FEEDBACK">Waiting for Feedback</option>
            <option value="FINISHED_AND_LIVE">Finished & Live</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-sm text-gray-500">
            {data.total} {data.total === 1 ? 'project' : 'projects'} found
          </p>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
          <button
            onClick={fetchProjects}
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
        keyExtractor={(project) => project.id}
        isLoading={isLoading}
        emptyMessage="No projects found. Projects will appear here when submissions are created."
        rowClassName={(project) => {
          // Highlight projects that need attention
          const status = project.projectStatus as ProjectStatus;
          if (status === 'WAITING_FOR_FEEDBACK') {
            return 'bg-purple-50/30';
          }
          if (status === 'ON_HOLD') {
            return 'bg-orange-50/30';
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
