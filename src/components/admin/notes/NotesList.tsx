/**
 * NotesList Component
 *
 * Main container that fetches and displays paginated notes for a customer.
 * Includes note type filtering, loading/error/empty states, and pagination.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import NoteCard from './NoteCard';
import NoteEditor from './NoteEditor';
import NoteTypeFilter from './NoteTypeFilter';
import Pagination from '../shared/Pagination';
import type { CustomerNote, NoteType, CreateNoteInput, UpdateNoteInput, PaginatedResponse } from '@/types/admin';

interface NotesListProps {
  customerId: number;
}

type ViewMode = 'list' | 'create' | 'edit';

export default function NotesList({ customerId }: NotesListProps) {
  // State
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<NoteType | null>(null);
  const [typeCounts, setTypeCounts] = useState<Record<NoteType | 'ALL', number>>({
    ALL: 0,
    CALL: 0,
    MEETING: 0,
    EMAIL: 0,
    GENERAL: 0,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingNote, setEditingNote] = useState<CustomerNote | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      if (selectedType) {
        params.set('noteType', selectedType);
      }

      const response = await fetch(`/api/admin/customers/${customerId}/notes?${params}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch notes');
      }

      const data: PaginatedResponse<CustomerNote> = result.data;
      setNotes(data.items);
      setTotalNotes(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [customerId, currentPage, selectedType]);

  // Fetch type counts for filter badges
  const fetchTypeCounts = useCallback(async () => {
    try {
      // Fetch all notes count
      const allResponse = await fetch(`/api/admin/customers/${customerId}/notes?limit=1`);
      const allResult = await allResponse.json();

      const counts: Record<NoteType | 'ALL', number> = {
        ALL: allResult.success ? allResult.data.total : 0,
        CALL: 0,
        MEETING: 0,
        EMAIL: 0,
        GENERAL: 0,
      };

      // Fetch counts for each type in parallel
      const types: NoteType[] = ['CALL', 'MEETING', 'EMAIL', 'GENERAL'];
      const typePromises = types.map(async (type) => {
        const res = await fetch(`/api/admin/customers/${customerId}/notes?noteType=${type}&limit=1`);
        const data = await res.json();
        return { type, count: data.success ? data.data.total : 0 };
      });

      const typeResults = await Promise.all(typePromises);
      typeResults.forEach(({ type, count }) => {
        counts[type] = count;
      });

      setTypeCounts(counts);
    } catch (err) {
      console.error('Failed to fetch type counts:', err);
    }
  }, [customerId]);

  // Initial fetch
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Fetch counts on mount and after changes
  useEffect(() => {
    fetchTypeCounts();
  }, [fetchTypeCounts]);

  // Handle type filter change
  const handleTypeChange = (type: NoteType | null) => {
    setSelectedType(type);
    setCurrentPage(1); // Reset to first page
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle create note
  const handleCreateNote = async (data: CreateNoteInput | UpdateNoteInput) => {
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to create note');
      }

      // Reset to list view and refresh
      setViewMode('list');
      setCurrentPage(1);
      setSelectedType(null);
      await fetchNotes();
      await fetchTypeCounts();
    } catch (err) {
      throw err; // Re-throw to be handled by NoteEditor
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update note
  const handleUpdateNote = async (data: CreateNoteInput | UpdateNoteInput) => {
    if (!editingNote) return;

    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes/${editingNote.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update note');
      }

      // Reset to list view and refresh
      setViewMode('list');
      setEditingNote(null);
      await fetchNotes();
      await fetchTypeCounts();
    } catch (err) {
      throw err; // Re-throw to be handled by NoteEditor
    } finally {
      setIsSaving(false);
    }
  };

  // Handle edit note
  const handleEditNote = (note: CustomerNote) => {
    setEditingNote(note);
    setViewMode('edit');
  };

  // Handle delete note
  const handleDeleteNote = async (noteId: number) => {
    setDeletingNoteId(noteId);

    try {
      const response = await fetch(`/api/admin/customers/${customerId}/notes/${noteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete note');
      }

      // Refresh notes
      await fetchNotes();
      await fetchTypeCounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Handle cancel edit/create
  const handleCancel = () => {
    setViewMode('list');
    setEditingNote(null);
  };

  // Loading state
  if (isLoading && notes.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-9 w-24 animate-pulse rounded bg-gray-200" />
        </div>
        {/* Filter skeleton */}
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>
        {/* Notes skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="mt-3 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error && notes.length === 0) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <svg className="mx-auto h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="mt-3 text-sm font-medium text-red-800">Error Loading Notes</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button
          onClick={fetchNotes}
          className="mt-4 inline-flex items-center rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200"
        >
          <svg className="mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Customer Notes
          {totalNotes > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({totalNotes} {totalNotes === 1 ? 'note' : 'notes'})
            </span>
          )}
        </h3>
        {viewMode === 'list' && (
          <button
            onClick={() => setViewMode('create')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Note
          </button>
        )}
      </div>

      {/* Create/Edit form */}
      {(viewMode === 'create' || viewMode === 'edit') && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h4 className="mb-3 text-sm font-medium text-blue-900">
            {viewMode === 'create' ? 'New Note' : 'Edit Note'}
          </h4>
          <NoteEditor
            note={editingNote}
            onSave={viewMode === 'create' ? handleCreateNote : handleUpdateNote}
            onCancel={handleCancel}
            isSaving={isSaving}
          />
        </div>
      )}

      {/* Type filter */}
      {viewMode === 'list' && (
        <NoteTypeFilter
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          counts={typeCounts}
        />
      )}

      {/* Error banner (for non-blocking errors) */}
      {error && notes.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Notes list */}
      {viewMode === 'list' && (
        <>
          {notes.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">No notes yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                {selectedType
                  ? `No ${selectedType.toLowerCase()} notes found. Try selecting a different filter.`
                  : 'Get started by adding your first note.'}
              </p>
              {!selectedType && (
                <button
                  onClick={() => setViewMode('create')}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Note
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <svg className="h-5 w-5 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  isDeleting={deletingNoteId === note.id}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalNotes}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
