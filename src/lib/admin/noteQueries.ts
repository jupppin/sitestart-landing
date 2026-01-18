/**
 * Customer Notes Database Queries
 *
 * Centralized database query functions for customer notes.
 * All queries use Prisma client for type-safe database access.
 */

import { prisma } from '@/lib/db';
import type {
  CustomerNote,
  CreateNoteInput,
  UpdateNoteInput,
  NoteFilters,
  NoteType,
  PaginatedResponse,
} from '@/types/admin';

// Valid note types for validation
const VALID_NOTE_TYPES: NoteType[] = ['CALL', 'MEETING', 'EMAIL', 'GENERAL'];

/**
 * Validate if a string is a valid NoteType
 */
export function isValidNoteType(type: string): type is NoteType {
  return VALID_NOTE_TYPES.includes(type as NoteType);
}

/**
 * Get paginated list of notes for a customer with optional filters
 */
export async function getNotesByCustomerId(
  customerId: number,
  filters: NoteFilters = {},
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<CustomerNote>> {
  const skip = (page - 1) * limit;

  // Build where clause
  const where: {
    customerId: number;
    noteType?: string;
  } = {
    customerId,
  };

  // Apply note type filter if provided
  if (filters.noteType) {
    where.noteType = filters.noteType;
  }

  // Execute count and find in parallel
  const [total, items] = await Promise.all([
    prisma.customerNote.count({ where }),
    prisma.customerNote.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
  ]);

  // Map Prisma results to CustomerNote type
  const mappedItems: CustomerNote[] = items.map((item) => ({
    id: item.id,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    customerId: item.customerId,
    content: item.content,
    noteType: item.noteType as NoteType,
    authorName: item.authorName,
  }));

  return {
    items: mappedItems,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Get a single note by ID
 */
export async function getNoteById(noteId: number): Promise<CustomerNote | null> {
  const note = await prisma.customerNote.findUnique({
    where: { id: noteId },
  });

  if (!note) {
    return null;
  }

  return {
    id: note.id,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    customerId: note.customerId,
    content: note.content,
    noteType: note.noteType as NoteType,
    authorName: note.authorName,
  };
}

/**
 * Create a new note for a customer
 */
export async function createNote(
  customerId: number,
  data: CreateNoteInput
): Promise<CustomerNote> {
  const note = await prisma.customerNote.create({
    data: {
      customerId,
      content: data.content,
      noteType: data.noteType || 'GENERAL',
      authorName: data.authorName || null,
    },
  });

  return {
    id: note.id,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    customerId: note.customerId,
    content: note.content,
    noteType: note.noteType as NoteType,
    authorName: note.authorName,
  };
}

/**
 * Update an existing note
 */
export async function updateNote(
  noteId: number,
  data: UpdateNoteInput
): Promise<CustomerNote> {
  const updateData: {
    content?: string;
    noteType?: string;
    authorName?: string | null;
  } = {};

  if (data.content !== undefined) {
    updateData.content = data.content;
  }

  if (data.noteType !== undefined) {
    updateData.noteType = data.noteType;
  }

  if (data.authorName !== undefined) {
    updateData.authorName = data.authorName || null;
  }

  const note = await prisma.customerNote.update({
    where: { id: noteId },
    data: updateData,
  });

  return {
    id: note.id,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    customerId: note.customerId,
    content: note.content,
    noteType: note.noteType as NoteType,
    authorName: note.authorName,
  };
}

/**
 * Delete a note by ID
 */
export async function deleteNote(noteId: number): Promise<void> {
  await prisma.customerNote.delete({
    where: { id: noteId },
  });
}

/**
 * Check if a customer exists
 */
export async function customerExists(customerId: number): Promise<boolean> {
  const customer = await prisma.intakeSubmission.findUnique({
    where: { id: customerId },
    select: { id: true },
  });
  return customer !== null;
}

/**
 * Get all notes for a customer (no pagination)
 * Useful for exporting or displaying full history
 */
export async function getAllNotesByCustomerId(
  customerId: number,
  filters: NoteFilters = {}
): Promise<CustomerNote[]> {
  const where: {
    customerId: number;
    noteType?: string;
  } = {
    customerId,
  };

  if (filters.noteType) {
    where.noteType = filters.noteType;
  }

  const notes = await prisma.customerNote.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return notes.map((note) => ({
    id: note.id,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
    customerId: note.customerId,
    content: note.content,
    noteType: note.noteType as NoteType,
    authorName: note.authorName,
  }));
}

/**
 * Get count of notes by type for a customer
 * Useful for displaying note type distribution
 */
export async function getNoteCountsByType(
  customerId: number
): Promise<Record<NoteType, number>> {
  const counts = await prisma.customerNote.groupBy({
    by: ['noteType'],
    where: { customerId },
    _count: { noteType: true },
  });

  // Initialize with zeros
  const result: Record<NoteType, number> = {
    CALL: 0,
    MEETING: 0,
    EMAIL: 0,
    GENERAL: 0,
  };

  // Fill in actual counts
  for (const count of counts) {
    const type = count.noteType as NoteType;
    if (VALID_NOTE_TYPES.includes(type)) {
      result[type] = count._count.noteType;
    }
  }

  return result;
}
