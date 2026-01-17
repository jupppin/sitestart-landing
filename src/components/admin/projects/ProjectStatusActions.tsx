/**
 * ProjectStatusActions Component
 *
 * Provides a dropdown to update the project status and a modal to add project notes.
 * Supports all project statuses and includes fields for go-live date and live URL.
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ProjectStatus } from '@/types/admin';

interface ProjectStatusActionsProps {
  projectId: number;
  currentStatus: ProjectStatus;
  currentNotes: string | null;
  currentLiveUrl: string | null;
  currentGoLiveDate: Date | string | null;
  onUpdate: (data: {
    projectStatus?: ProjectStatus;
    projectNotes?: string;
    liveUrl?: string;
    goLiveDate?: string | null;
  }) => Promise<void>;
  disabled?: boolean;
}

const PROJECT_STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: 'NOT_STARTED', label: 'Not Started' },
  { value: 'JUST_STARTED', label: 'Just Started' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_FOR_FEEDBACK', label: 'Waiting for Feedback' },
  { value: 'FINISHED_AND_LIVE', label: 'Finished & Live' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ProjectStatusActions({
  projectId,
  currentStatus,
  currentNotes,
  currentLiveUrl,
  currentGoLiveDate,
  onUpdate,
  disabled = false,
}: ProjectStatusActionsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal form state
  const [notes, setNotes] = useState(currentNotes || '');
  const [liveUrl, setLiveUrl] = useState(currentLiveUrl || '');
  const [goLiveDate, setGoLiveDate] = useState(
    currentGoLiveDate ? new Date(currentGoLiveDate).toISOString().split('T')[0] : ''
  );

  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Update dropdown position when opened
  useEffect(() => {
    if (isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    }
  }, [isDropdownOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle status change from dropdown
  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (newStatus === currentStatus) {
      setIsDropdownOpen(false);
      return;
    }

    setIsUpdating(true);
    setError(null);
    setIsDropdownOpen(false);

    try {
      await onUpdate({ projectStatus: newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle modal form submission
  const handleModalSubmit = async () => {
    setIsUpdating(true);
    setError(null);

    try {
      await onUpdate({
        projectNotes: notes,
        liveUrl: liveUrl || undefined,
        goLiveDate: goLiveDate || null,
      });
      setIsModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setIsUpdating(false);
    }
  };

  // Open modal and sync state with current values
  const openModal = () => {
    setNotes(currentNotes || '');
    setLiveUrl(currentLiveUrl || '');
    setGoLiveDate(
      currentGoLiveDate ? new Date(currentGoLiveDate).toISOString().split('T')[0] : ''
    );
    setError(null);
    setIsModalOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Status Dropdown */}
      <div className="relative">
        <button
          ref={buttonRef}
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled || isUpdating}
          className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-haspopup="listbox"
          aria-expanded={isDropdownOpen}
          aria-label="Change project status"
        >
          {isUpdating ? (
            <svg
              className="mr-2 h-4 w-4 animate-spin"
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
          ) : (
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
              />
            </svg>
          )}
          Update Status
          <svg
            className="ml-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </button>

        {/* Dropdown Menu - rendered via portal to avoid clipping */}
        {isDropdownOpen && typeof document !== 'undefined' &&
          createPortal(
            <div
              ref={dropdownRef}
              className="fixed z-[9999] w-56 rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              style={{
                top: dropdownPosition.top,
                left: dropdownPosition.left,
              }}
              role="listbox"
              aria-label="Project status options"
            >
              <div className="py-1">
                {PROJECT_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      status.value === currentStatus
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    role="option"
                    aria-selected={status.value === currentStatus}
                  >
                    {status.label}
                    {status.value === currentStatus && (
                      <svg
                        className="ml-2 inline-block h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>,
            document.body
          )
        }
      </div>

      {/* Notes Button */}
      <button
        type="button"
        onClick={openModal}
        disabled={disabled || isUpdating}
        className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Edit project notes and details"
      >
        <svg
          className="mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
          />
        </svg>
        Notes
      </button>

      {/* Error Display */}
      {error && (
        <span className="text-sm text-red-600">{error}</span>
      )}

      {/* Notes/Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Project Details
            </h3>

            <div className="space-y-4">
              {/* Project Notes */}
              <div>
                <label
                  htmlFor={`notes-${projectId}`}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Project Notes
                </label>
                <textarea
                  id={`notes-${projectId}`}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes about the project progress..."
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Live URL */}
              <div>
                <label
                  htmlFor={`liveUrl-${projectId}`}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Live URL
                </label>
                <input
                  id={`liveUrl-${projectId}`}
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Go-Live Date */}
              <div>
                <label
                  htmlFor={`goLiveDate-${projectId}`}
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Go-Live Date
                </label>
                <input
                  id={`goLiveDate-${projectId}`}
                  type="date"
                  value={goLiveDate}
                  onChange={(e) => setGoLiveDate(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-600">{error}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isUpdating}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleModalSubmit}
                disabled={isUpdating}
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUpdating && (
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
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
                )}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
