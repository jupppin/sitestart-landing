/**
 * Customer Notes API Routes
 *
 * GET /api/admin/customers/[id]/notes
 * List notes for a customer with optional pagination and filtering.
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10)
 * - noteType: CALL | MEETING | EMAIL | GENERAL
 *
 * POST /api/admin/customers/[id]/notes
 * Create a new note for a customer.
 * Body: { content: string, noteType?: NoteType, authorName?: string }
 *
 * Authentication: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import {
  getNotesByCustomerId,
  createNote,
  customerExists,
  isValidNoteType,
} from '@/lib/admin/noteQueries';
import type { NoteType, CreateNoteInput } from '@/types/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET - List notes for a customer
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate customer ID
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const exists = await customerExists(customerId);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get('limit') || '10', 10))
    );
    const noteTypeParam = searchParams.get('noteType');

    // Build filters
    const filters: { noteType?: NoteType } = {};
    if (noteTypeParam && isValidNoteType(noteTypeParam)) {
      filters.noteType = noteTypeParam;
    }

    // Fetch notes
    const result = await getNotesByCustomerId(customerId, filters, page, limit);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching customer notes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new note for a customer
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate customer ID
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Verify customer exists
    const exists = await customerExists(customerId);
    if (!exists) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { content, noteType, authorName } = body;

    // Validate content
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content cannot be empty' },
        { status: 400 }
      );
    }

    // Validate noteType if provided
    if (noteType !== undefined && !isValidNoteType(noteType)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid note type. Must be one of: CALL, MEETING, EMAIL, GENERAL',
        },
        { status: 400 }
      );
    }

    // Validate authorName if provided
    if (authorName !== undefined && typeof authorName !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Author name must be a string' },
        { status: 400 }
      );
    }

    // Build input
    const input: CreateNoteInput = {
      content: content.trim(),
      noteType: noteType || 'GENERAL',
      authorName: authorName?.trim() || undefined,
    };

    // Create note
    const note = await createNote(customerId, input);

    return NextResponse.json(
      {
        success: true,
        data: note,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating customer note:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    );
  }
}
