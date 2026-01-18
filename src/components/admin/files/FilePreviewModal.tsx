/**
 * FilePreviewModal Component
 *
 * Modal for previewing files, especially images.
 * For images: full-size preview with zoom capability.
 * For PDFs: embedded viewer or download prompt.
 * For other files: metadata display with download option.
 */

'use client';

import { useEffect, useCallback } from 'react';
import type { CustomerFile, FileCategory } from '@/types/admin';

interface FilePreviewModalProps {
  file: CustomerFile | null;
  customerId: number;
  isOpen: boolean;
  onClose: () => void;
}

// Category badge styling
const categoryStyles: Record<FileCategory, { bg: string; text: string }> = {
  LOGO: { bg: 'bg-purple-100', text: 'text-purple-700' },
  PHOTO: { bg: 'bg-blue-100', text: 'text-blue-700' },
  CONTENT: { bg: 'bg-green-100', text: 'text-green-700' },
  DOCUMENT: { bg: 'bg-amber-100', text: 'text-amber-700' },
  GENERAL: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

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

export default function FilePreviewModal({
  file,
  customerId,
  isOpen,
  onClose,
}: FilePreviewModalProps) {
  // Handle escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !file) {
    return null;
  }

  const isImage = file.mimeType.startsWith('image/');
  const isPdf = file.mimeType === 'application/pdf';
  const downloadUrl = `/api/admin/customers/${customerId}/files/${file.id}/download`;
  const previewUrl = `${downloadUrl}?inline=true`;
  const categoryStyle = categoryStyles[file.category] || categoryStyles.GENERAL;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col rounded-lg bg-white shadow-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="truncate text-lg font-semibold text-gray-900" title={file.fileName}>
              {file.fileName}
            </h2>
            <span className={`inline-flex flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
              {file.category.charAt(0) + file.category.slice(1).toLowerCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {isImage ? (
            // Image preview
            <div className="flex items-center justify-center min-h-[300px]">
              <img
                src={previewUrl}
                alt={file.fileName}
                className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-lg"
              />
            </div>
          ) : isPdf ? (
            // PDF embed
            <div className="h-[60vh] w-full rounded-lg border border-gray-200 overflow-hidden">
              <iframe
                src={previewUrl}
                title={file.fileName}
                className="h-full w-full"
              />
            </div>
          ) : (
            // Other file types - show metadata
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <p className="mt-4 text-center text-gray-600">
                Preview not available for this file type
              </p>
              <p className="mt-1 text-center text-sm text-gray-500">
                Download the file to view its contents
              </p>
            </div>
          )}
        </div>

        {/* Footer - File metadata and actions */}
        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                <span>{formatFileSize(file.fileSize)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>{file.mimeType}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Uploaded {formatDateTime(file.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a
                href={downloadUrl}
                download={file.fileName}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              {isImage && (
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Open in New Tab
                </a>
              )}
            </div>
          </div>

          {/* Description if present */}
          {file.description && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</p>
              <p className="mt-1 text-sm text-gray-700">{file.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
