/**
 * Individual Customer Note API Routes
 *
 * PATCH /api/admin/customers/[id]/notes/[noteId]
 * Updates an existing note.
 *
 * DELETE /api/admin/customers/[id]/notes/[noteId]
 * Deletes a note.
 *
 * Authentication: Required (uses isAuthenticated from session)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import {
  getNoteById,
  updateNote,
  deleteNote,
  isValidNoteType,
} from '@/lib/admin/noteQueries';
import type { UpdateNoteInput } from '@/types/admin';

interface RouteParams {
  params: Promise<{ id: string; noteId: string }>;
}

/**
 * PATCH /api/admin/customers/[id]/notes/[noteId]
 *
 * Request body (all fields optional):
 * - content (string)
 * - noteType (CALL | MEETING | EMAIL | GENERAL)
 * - authorName (string)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate IDs
    const { id, noteId } = await params;
    const customerId = parseInt(id, 10);
    const noteIdNum = parseInt(noteId, 10);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    if (isNaN(noteIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Check if note exists and belongs to this customer
    const existingNote = await getNoteById(noteIdNum);
    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    if (existingNote.customerId !== customerId) {
      return NextResponse.json(
        { success: false, error: 'Note does not belong to this customer' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, noteType, authorName } = body;

    // Build update data
    const updateData: UpdateNoteInput = {};

    // Validate and add content
    if (content !== undefined) {
      if (typeof content !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Content must be a string' },
          { status: 400 }
        );
      }
      if (content.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Content cannot be empty' },
          { status: 400 }
        );
      }
      updateData.content = content.trim();
    }

    // Validate and add noteType
    if (noteType !== undefined) {
      if (!isValidNoteType(noteType)) {
        return NextResponse.json(
          { success: false, error: 'Invalid note type. Must be one of: CALL, MEETING, EMAIL, GENERAL' },
          { status: 400 }
        );
      }
      updateData.noteType = noteType;
    }

    // Validate and add authorName
    if (authorName !== undefined) {
      if (authorName !== null && typeof authorName !== 'string') {
        return NextResponse.json(
          { success: false, error: 'Author name must be a string or null' },
          { status: 400 }
        );
      }
      updateData.authorName = authorName?.trim() || undefined;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the note
    const updatedNote = await updateNote(noteIdNum, updateData);

    return NextResponse.json({
      success: true,
      data: updatedNote,
    });
  } catch (error) {
    console.error('Error updating customer note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update note' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/[id]/notes/[noteId]
 *
 * Deletes the specified note.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate IDs
    const { id, noteId } = await params;
    const customerId = parseInt(id, 10);
    const noteIdNum = parseInt(noteId, 10);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    if (isNaN(noteIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    // Check if note exists and belongs to this customer
    const existingNote = await getNoteById(noteIdNum);
    if (!existingNote) {
      return NextResponse.json(
        { success: false, error: 'Note not found' },
        { status: 404 }
      );
    }

    if (existingNote.customerId !== customerId) {
      return NextResponse.json(
        { success: false, error: 'Note does not belong to this customer' },
        { status: 403 }
      );
    }

    // Delete the note
    await deleteNote(noteIdNum);

    return NextResponse.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting customer note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
