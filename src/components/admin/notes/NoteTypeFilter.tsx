/**
 * NoteTypeFilter Component
 *
 * Filter component with chip buttons for each note type.
 * Includes an "All" option to show all notes.
 */

'use client';

import type { NoteType } from '@/types/admin';

interface NoteTypeFilterProps {
  selectedType: NoteType | null;
  onTypeChange: (type: NoteType | null) => void;
  counts?: Record<NoteType | 'ALL', number>;
}

// Note type configuration with labels and colors
const noteTypeConfig: Record<NoteType, { label: string; icon: React.ReactNode; activeClass: string }> = {
  CALL: {
    label: 'Calls',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    activeClass: 'bg-blue-100 text-blue-700 border-blue-300',
  },
  MEETING: {
    label: 'Meetings',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    activeClass: 'bg-purple-100 text-purple-700 border-purple-300',
  },
  EMAIL: {
    label: 'Emails',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    activeClass: 'bg-green-100 text-green-700 border-green-300',
  },
  GENERAL: {
    label: 'General',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    activeClass: 'bg-gray-200 text-gray-700 border-gray-400',
  },
};

const noteTypes: NoteType[] = ['CALL', 'MEETING', 'EMAIL', 'GENERAL'];

export default function NoteTypeFilter({
  selectedType,
  onTypeChange,
  counts,
}: NoteTypeFilterProps) {
  const isSelected = (type: NoteType | null) => selectedType === type;

  return (
    <div className="flex flex-wrap gap-2">
      {/* All button */}
      <button
        type="button"
        onClick={() => onTypeChange(null)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
          isSelected(null)
            ? 'bg-gray-900 text-white border-gray-900'
            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        All
        {counts && counts.ALL > 0 && (
          <span className={`ml-1 text-xs ${isSelected(null) ? 'text-gray-300' : 'text-gray-400'}`}>
            ({counts.ALL})
          </span>
        )}
      </button>

      {/* Type buttons */}
      {noteTypes.map((type) => {
        const config = noteTypeConfig[type];
        const count = counts?.[type] || 0;

        return (
          <button
            key={type}
            type="button"
            onClick={() => onTypeChange(type)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isSelected(type)
                ? config.activeClass
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {config.icon}
            {config.label}
            {count > 0 && (
              <span className={`ml-1 text-xs ${isSelected(type) ? 'opacity-70' : 'text-gray-400'}`}>
                ({count})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
