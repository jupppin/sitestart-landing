/**
 * FileList Component
 *
 * Main file management component that combines all file-related functionality.
 * Features: grid/list view toggle, category filtering, file upload, delete, and preview.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import FileUploader from './FileUploader';
import FileCard from './FileCard';
import FileCategoryTabs from './FileCategoryTabs';
import FilePreviewModal from './FilePreviewModal';
import type { CustomerFile, FileCategory } from '@/types/admin';

interface FileListProps {
  customerId: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'date' | 'name';

const DEFAULT_CATEGORY_COUNTS: Record<FileCategory | 'ALL', number> = {
  ALL: 0,
  LOGO: 0,
  PHOTO: 0,
  CONTENT: 0,
  DOCUMENT: 0,
  GENERAL: 0,
};

export default function FileList({ customerId }: FileListProps) {
  // State
  const [files, setFiles] = useState<CustomerFile[]>([]);
  const [categoryCounts, setCategoryCounts] = useState(DEFAULT_CATEGORY_COUNTS);
  const [maxFileSize, setMaxFileSize] = useState(10485760);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeCategory, setActiveCategory] = useState<FileCategory | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [showUploader, setShowUploader] = useState(false);

  // Preview modal state
  const [previewFile, setPreviewFile] = useState<CustomerFile | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Delete tracking
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);

  // Fetch files
  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const categoryParam = activeCategory !== 'ALL' ? `?category=${activeCategory}` : '';
      const response = await fetch(`/api/admin/customers/${customerId}/files${categoryParam}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch files');
      }

      setFiles(result.data.files);
      setCategoryCounts(result.data.categoryCounts);
      if (result.data.maxFileSize) {
        setMaxFileSize(result.data.maxFileSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, activeCategory]);

  // Initial fetch and on category change
  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Handle file deletion
  const handleDelete = async (fileId: number) => {
    setDeletingFileId(fileId);

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/files/${fileId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete file');
      }

      // Refresh file list
      await fetchFiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    } finally {
      setDeletingFileId(null);
    }
  };

  // Handle preview
  const handlePreview = (file: CustomerFile) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  // Close preview
  const closePreview = () => {
    setIsPreviewOpen(false);
    // Delay clearing file to allow animation
    setTimeout(() => setPreviewFile(null), 200);
  };

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.fileName.localeCompare(b.fileName);
  });

  // Loading state
  if (isLoading && files.length === 0) {
    return (
      <div className="space-y-4">
        {/* Skeleton tabs */}
        <div className="flex gap-4 border-b border-gray-200 pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 w-16 animate-pulse rounded bg-gray-200" />
          ))}
        </div>

        {/* Skeleton grid */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto flex-shrink-0 rounded p-1 text-red-500 hover:bg-red-100"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Category tabs */}
      <FileCategoryTabs
        activeCategory={activeCategory}
        categoryCounts={categoryCounts}
        onCategoryChange={setActiveCategory}
      />

      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side - View and sort controls */}
        <div className="flex items-center gap-4">
          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-gray-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center justify-center rounded-l-lg p-2 ${
                viewMode === 'grid'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="Grid view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center justify-center rounded-r-lg border-l border-gray-200 p-2 ${
                viewMode === 'list'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              title="List view"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="date">Sort by date</option>
            <option value="name">Sort by name</option>
          </select>
        </div>

        {/* Right side - Upload button */}
        <button
          onClick={() => setShowUploader(!showUploader)}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            showUploader
              ? 'bg-gray-200 text-gray-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          {showUploader ? 'Hide Uploader' : 'Upload Files'}
        </button>
      </div>

      {/* File uploader (collapsible) */}
      {showUploader && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <FileUploader
            customerId={customerId}
            maxFileSize={maxFileSize}
            defaultCategory={activeCategory !== 'ALL' ? activeCategory : 'GENERAL'}
            onUploadComplete={() => {
              fetchFiles();
              setShowUploader(false);
            }}
          />
        </div>
      )}

      {/* File list/grid */}
      {sortedFiles.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white py-16 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
          <h3 className="mt-4 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">
            {activeCategory === 'ALL'
              ? 'Get started by uploading a file.'
              : `No ${activeCategory.toLowerCase()} files found.`}
          </p>
          {!showUploader && (
            <button
              onClick={() => setShowUploader(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Upload Files
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              customerId={customerId}
              viewMode="grid"
              onDelete={handleDelete}
              onPreview={handlePreview}
              isDeleting={deletingFileId === file.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {sortedFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              customerId={customerId}
              viewMode="list"
              onDelete={handleDelete}
              onPreview={handlePreview}
              isDeleting={deletingFileId === file.id}
            />
          ))}
        </div>
      )}

      {/* File count summary */}
      {sortedFiles.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {sortedFiles.length} file{sortedFiles.length !== 1 ? 's' : ''}
          {activeCategory !== 'ALL' && ` in ${activeCategory.toLowerCase()}`}
        </div>
      )}

      {/* Preview modal */}
      <FilePreviewModal
        file={previewFile}
        customerId={customerId}
        isOpen={isPreviewOpen}
        onClose={closePreview}
      />
    </div>
  );
}
