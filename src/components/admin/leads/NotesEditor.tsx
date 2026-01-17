/**
 * NotesEditor Component
 *
 * A textarea component for editing lead notes with auto-save functionality.
 * Shows save status and handles save confirmation.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface NotesEditorProps {
  leadId: number;
  initialNotes: string | null;
  onSave: (notes: string) => Promise<void>;
  disabled?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function NotesEditor({
  leadId,
  initialNotes,
  onSave,
  disabled = false,
}: NotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes || '');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Track if notes have changed from initial value
  useEffect(() => {
    const currentNotes = notes.trim();
    const initial = (initialNotes || '').trim();
    setHasChanges(currentNotes !== initial);
  }, [notes, initialNotes]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
    };
  }, []);

  // Handle save
  const handleSave = useCallback(async () => {
    if (disabled || saveStatus === 'saving') return;

    setSaveStatus('saving');
    setError(null);

    try {
      await onSave(notes);
      setSaveStatus('saved');
      setHasChanges(false);

      // Reset status after 2 seconds
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }
      statusTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      setSaveStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to save notes');
    }
  }, [notes, onSave, disabled, saveStatus]);

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setSaveStatus('idle');
    setError(null);
  };

  // Handle keyboard shortcut (Ctrl/Cmd + S)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  // Get status indicator content
  const getStatusIndicator = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="flex items-center text-gray-500">
            <svg
              className="mr-1 h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Saving...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center text-green-600">
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            Saved
          </span>
        );
      case 'error':
        return (
          <span className="flex items-center text-red-600">
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Error saving
          </span>
        );
      default:
        if (hasChanges) {
          return <span className="text-amber-600">Unsaved changes</span>;
        }
        return null;
    }
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={`notes-${leadId}`}
          className="text-sm font-medium text-gray-700"
        >
          Notes
        </label>
        <span className="text-xs">
          {getStatusIndicator()}
        </span>
      </div>

      {/* Textarea */}
      <textarea
        id={`notes-${leadId}`}
        value={notes}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || saveStatus === 'saving'}
        placeholder="Add notes about this lead..."
        rows={5}
        className="block w-full resize-y rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500"
      />

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Press Ctrl+S (Cmd+S on Mac) to save
        </p>
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || saveStatus === 'saving' || !hasChanges}
          className="inline-flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saveStatus === 'saving' ? (
            <>
              <svg
                className="mr-1.5 h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <svg
                className="mr-1.5 h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save Notes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
