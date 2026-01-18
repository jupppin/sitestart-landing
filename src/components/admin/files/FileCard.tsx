/**
 * FileCard Component
 *
 * Individual file card displaying thumbnail/icon, metadata, and actions.
 * Supports both grid and list view modes.
 */

'use client';

import { useState } from 'react';
import type { CustomerFile, FileCategory } from '@/types/admin';

interface FileCardProps {
  file: CustomerFile;
  customerId: number;
  viewMode: 'grid' | 'list';
  onDelete: (fileId: number) => void;
  onPreview: (file: CustomerFile) => void;
  isDeleting?: boolean;
}

// Category badge styling
const categoryStyles: Record<FileCategory, { bg: string; text: string }> = {
  LOGO: { bg: 'bg-purple-100', text: 'text-purple-700' },
  PHOTO: { bg: 'bg-blue-100', text: 'text-blue-700' },
  CONTENT: { bg: 'bg-green-100', text: 'text-green-700' },
  DOCUMENT: { bg: 'bg-amber-100', text: 'text-amber-700' },
  GENERAL: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

// File type icons
function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    );
  }
  if (mimeType === 'application/pdf') {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  if (mimeType.includes('word') || mimeType.includes('document')) {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    );
  }
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet') || mimeType === 'text/csv') {
    return (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5" />
      </svg>
    );
  }
  // Default file icon
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function FileCard({
  file,
  customerId,
  viewMode,
  onDelete,
  onPreview,
  isDeleting = false,
}: FileCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isImage = file.mimeType.startsWith('image/');
  const downloadUrl = `/api/admin/customers/${customerId}/files/${file.id}/download`;
  const previewUrl = `${downloadUrl}?inline=true`;
  const categoryStyle = categoryStyles[file.category] || categoryStyles.GENERAL;

  const handleDelete = () => {
    setShowDeleteConfirm(false);
    onDelete(file.id);
  };

  // Grid view
  if (viewMode === 'grid') {
    return (
      <div className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-sm transition-all">
        {/* Thumbnail / Preview */}
        <div
          onClick={() => onPreview(file)}
          className="relative aspect-square cursor-pointer bg-gray-50 overflow-hidden"
        >
          {isImage && !imageError ? (
            <img
              src={previewUrl}
              alt={file.fileName}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              {getFileIcon(file.mimeType)}
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <span className="text-sm font-medium text-white">
              {isImage ? 'Preview' : 'View Details'}
            </span>
          </div>
        </div>

        {/* File info */}
        <div className="p-3">
          <p className="truncate text-sm font-medium text-gray-900" title={file.fileName}>
            {file.fileName}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
              {file.category.charAt(0) + file.category.slice(1).toLowerCase()}
            </span>
            <span className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex border-t border-gray-100">
          <a
            href={downloadUrl}
            download={file.fileName}
            className="flex flex-1 items-center justify-center gap-1 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="flex flex-1 items-center justify-center gap-1 border-l border-gray-100 py-2 text-xs text-red-600 hover:bg-red-50 disabled:text-gray-400"
          >
            {isDeleting ? (
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Delete
          </button>
        </div>

        {/* Delete confirmation */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 p-4">
            <p className="text-center text-sm text-gray-700">Delete this file?</p>
            <p className="mt-1 text-center text-xs text-gray-500 truncate max-w-full">
              {file.fileName}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // List view
  return (
    <div className="group flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Thumbnail / Icon */}
      <div
        onClick={() => onPreview(file)}
        className="relative h-12 w-12 flex-shrink-0 cursor-pointer overflow-hidden rounded bg-gray-100"
      >
        {isImage && !imageError ? (
          <img
            src={previewUrl}
            alt={file.fileName}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400">
            {getFileIcon(file.mimeType)}
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p
            className="truncate text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600"
            onClick={() => onPreview(file)}
            title={file.fileName}
          >
            {file.fileName}
          </p>
          <span className={`inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
            {file.category.charAt(0) + file.category.slice(1).toLowerCase()}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
          <span>{formatFileSize(file.fileSize)}</span>
          <span>{formatDate(file.createdAt)}</span>
          {file.description && (
            <span className="truncate">{file.description}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <a
          href={downloadUrl}
          download={file.fileName}
          className="rounded p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="Download"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </a>
        {showDeleteConfirm ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="rounded p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:text-gray-300"
            title="Delete"
          >
            {isDeleting ? (
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
