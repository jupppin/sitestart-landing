/**
 * File Download API Route
 *
 * GET /api/admin/customers/[id]/files/[fileId]/download
 * Serves a file for download with proper Content-Disposition header.
 *
 * Authentication: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { getFileById } from '@/lib/admin/fileQueries';
import { readFile, StorageError } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ id: string; fileId: string }>;
}

export async function GET(
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

    // Read file from storage
    let fileBuffer: Buffer;
    try {
      fileBuffer = await readFile(file.fileKey);
    } catch (error) {
      if (error instanceof StorageError && error.code === 'NOT_FOUND') {
        return NextResponse.json(
          { success: false, error: 'File not found on disk' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Determine if this should be inline (preview) or attachment (download)
    const { searchParams } = new URL(request.url);
    const inline = searchParams.get('inline') === 'true';

    // Build content disposition header
    // Sanitize filename for header (remove special chars that might break header)
    const sanitizedFileName = file.fileName.replace(/[^\w\s.-]/g, '_');
    const disposition = inline ? 'inline' : 'attachment';
    const contentDisposition = `${disposition}; filename="${sanitizedFileName}"`;

    // Create response with file content
    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(fileBuffer);
    const response = new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': contentDisposition,
        'Content-Length': String(fileBuffer.length),
        'Cache-Control': 'private, max-age=3600',
      },
    });

    return response;
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
