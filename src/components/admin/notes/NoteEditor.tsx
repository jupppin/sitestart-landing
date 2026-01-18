/**
 * NoteEditor Component
 *
 * Form for creating or editing a customer note.
 * Includes content textarea, note type select, and optional author name.
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import type { CustomerNote, NoteType, CreateNoteInput, UpdateNoteInput } from '@/types/admin';

interface NoteEditorProps {
  note?: CustomerNote | null;
  onSave: (data: CreateNoteInput | UpdateNoteInput) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

// Note type options
const noteTypeOptions: { value: NoteType; label: string; icon: React.ReactNode }[] = [
  {
    value: 'GENERAL',
    label: 'General Note',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    value: 'CALL',
    label: 'Phone Call',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
  },
  {
    value: 'MEETING',
    label: 'Meeting',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'EMAIL',
    label: 'Email',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

export default function NoteEditor({
  note,
  onSave,
  onCancel,
  isSaving = false,
}: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || '');
  const [noteType, setNoteType] = useState<NoteType>(note?.noteType || 'GENERAL');
  const [authorName, setAuthorName] = useState(note?.authorName || '');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isEditing = !!note;

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate content
    if (!content.trim()) {
      setError('Note content is required');
      return;
    }

    try {
      if (isEditing) {
        // Only include changed fields for update
        const updateData: UpdateNoteInput = {};
        if (content !== note.content) updateData.content = content.trim();
        if (noteType !== note.noteType) updateData.noteType = noteType;
        if (authorName !== (note.authorName || '')) updateData.authorName = authorName.trim() || undefined;

        // If nothing changed, just cancel
        if (Object.keys(updateData).length === 0) {
          onCancel();
          return;
        }

        await onSave(updateData);
      } else {
        await onSave({
          content: content.trim(),
          noteType,
          authorName: authorName.trim() || undefined,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save note');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
    // Escape to cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Content textarea */}
      <div>
        <label htmlFor="note-content" className="sr-only">
          Note content
        </label>
        <textarea
          ref={textareaRef}
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your note..."
          rows={4}
          disabled={isSaving}
          className="block w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
        />
      </div>

      {/* Note type and author row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        {/* Note type select */}
        <div className="flex-1">
          <label htmlFor="note-type" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <div className="relative">
            <select
              id="note-type"
              value={noteType}
              onChange={(e) => setNoteType(e.target.value as NoteType)}
              disabled={isSaving}
              className="block w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
            >
              {noteTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Author name input */}
        <div className="flex-1">
          <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 mb-1">
            Author (optional)
          </label>
          <input
            type="text"
            id="author-name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            disabled={isSaving}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Press Ctrl+Enter to save, Esc to cancel
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !content.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {isEditing ? 'Update Note' : 'Add Note'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
