/**
 * Individual Customer File API Route
 *
 * DELETE /api/admin/customers/[id]/files/[fileId]
 * Deletes a file from both storage and database.
 *
 * Authentication: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { getFileById, deleteFileRecord } from '@/lib/admin/fileQueries';
import { deleteFile, StorageError } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ id: string; fileId: string }>;
}

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
    const { id, fileId } = await params;
    const customerId = parseInt(id, 10);
    const fileIdNum = parseInt(fileId, 10);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    if (isNaN(fileIdNum)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file ID' },
        { status: 400 }
      );
    }

    // Fetch the file record
    const file = await getFileById(fileIdNum);

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Verify the file belongs to this customer (security check)
    if (file.customerId !== customerId) {
      return NextResponse.json(
        { success: false, error: 'File does not belong to this customer' },
        { status: 403 }
      );
    }

    // Delete from storage first
    try {
      await deleteFile(file.fileKey);
    } catch (error) {
      if (error instanceof StorageError && error.code === 'DELETE_ERROR') {
        console.error('Storage deletion failed:', error);
        // Continue to delete DB record even if storage fails
        // The file might already be gone
      }
    }

    // Delete database record
    await deleteFileRecord(fileIdNum);

    return NextResponse.json({
      success: true,
      data: {
        deletedFileId: fileIdNum,
        fileName: file.fileName,
      },
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
