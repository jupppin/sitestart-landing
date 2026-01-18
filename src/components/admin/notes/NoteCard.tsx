/**
 * NoteCard Component
 *
 * Displays an individual note with content, author, timestamp, and type badge.
 * Includes edit and delete action buttons.
 */

'use client';

import { useState } from 'react';
import type { CustomerNote, NoteType } from '@/types/admin';

interface NoteCardProps {
  note: CustomerNote;
  onEdit: (note: CustomerNote) => void;
  onDelete: (noteId: number) => void;
  isDeleting?: boolean;
}

// Note type configuration with labels, colors, and icons
const noteTypeConfig: Record<NoteType, { label: string; icon: React.ReactNode; badgeClass: string }> = {
  CALL: {
    label: 'Call',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    badgeClass: 'bg-blue-100 text-blue-700',
  },
  MEETING: {
    label: 'Meeting',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  EMAIL: {
    label: 'Email',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    badgeClass: 'bg-green-100 text-green-700',
  },
  GENERAL: {
    label: 'Note',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    badgeClass: 'bg-gray-100 text-gray-700',
  },
};

// Format date for display
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

// Format relative time
function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateTime(date);
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  isDeleting = false,
}: NoteCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const config = noteTypeConfig[note.noteType];

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(note.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className={`rounded-lg border bg-white p-4 transition-colors ${
      showDeleteConfirm ? 'border-red-300 bg-red-50' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeClass}`}>
            {config.icon}
            {config.label}
          </span>

          {/* Timestamp */}
          <span className="text-xs text-gray-500" title={formatDateTime(note.createdAt)}>
            {formatRelativeTime(note.createdAt)}
          </span>

          {/* Edited indicator */}
          {new Date(note.updatedAt).getTime() > new Date(note.createdAt).getTime() + 1000 && (
            <span className="text-xs text-gray-400" title={`Edited ${formatDateTime(note.updatedAt)}`}>
              (edited)
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {showDeleteConfirm ? (
            <>
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="inline-flex items-center rounded px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <svg className="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onEdit(note)}
                className="inline-flex items-center rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Edit note"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                title="Delete note"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="mt-3">
        <p className="whitespace-pre-wrap text-sm text-gray-700">{note.content}</p>
      </div>

      {/* Author */}
      {note.authorName && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{note.authorName}</span>
        </div>
      )}
    </div>
  );
}
