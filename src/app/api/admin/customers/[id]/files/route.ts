/**
 * Customer Files API Route
 *
 * GET /api/admin/customers/[id]/files
 * Lists all files for a customer, optionally filtered by category.
 * Query params: category (LOGO|PHOTO|CONTENT|DOCUMENT|GENERAL)
 *
 * POST /api/admin/customers/[id]/files
 * Uploads one or more files for a customer.
 * Expects multipart/form-data with:
 * - files: File[] (the files to upload)
 * - category: string (optional, defaults to GENERAL)
 * - description: string (optional)
 *
 * Authentication: Required
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { getFilesByCustomerId, createFileRecord, getFileCategoryCounts } from '@/lib/admin/fileQueries';
import { uploadFile, StorageError, getMaxFileSize } from '@/lib/storage';
import type { FileCategory } from '@/types/admin';

const VALID_CATEGORIES: FileCategory[] = ['LOGO', 'PHOTO', 'CONTENT', 'DOCUMENT', 'GENERAL'];

interface RouteParams {
  params: Promise<{ id: string }>;
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

    // Parse and validate customer ID
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Get category filter from query params
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category');
    let category: FileCategory | undefined;

    if (categoryParam) {
      if (!VALID_CATEGORIES.includes(categoryParam as FileCategory)) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
          { status: 400 }
        );
      }
      category = categoryParam as FileCategory;
    }

    // Fetch files and category counts
    const [files, categoryCounts] = await Promise.all([
      getFilesByCustomerId(customerId, category),
      getFileCategoryCounts(customerId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        files,
        categoryCounts,
        maxFileSize: getMaxFileSize(),
      },
    });
  } catch (error) {
    console.error('Error fetching customer files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch files' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Parse and validate customer ID
    const { id } = await params;
    const customerId = parseInt(id, 10);
    if (isNaN(customerId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid customer ID' },
        { status: 400 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const categoryParam = formData.get('category') as string | null;
    const description = formData.get('description') as string | null;

    // Validate we have files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate category
    let category: FileCategory = 'GENERAL';
    if (categoryParam) {
      if (!VALID_CATEGORIES.includes(categoryParam as FileCategory)) {
        return NextResponse.json(
          { success: false, error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` },
          { status: 400 }
        );
      }
      category = categoryParam as FileCategory;
    }

    // Process each file
    const uploadResults = [];
    const errors: { fileName: string; error: string }[] = [];

    for (const file of files) {
      try {
        // Upload file to storage
        const uploadResult = await uploadFile(customerId, file, category);

        // Create database record
        const fileRecord = await createFileRecord(customerId, {
          fileName: uploadResult.fileName,
          fileKey: uploadResult.fileKey,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType,
          category: uploadResult.category,
          description: description || undefined,
        });

        uploadResults.push(fileRecord);
      } catch (error) {
        if (error instanceof StorageError) {
          errors.push({
            fileName: file.name,
            error: error.message,
          });
        } else {
          console.error(`Error uploading file ${file.name}:`, error);
          errors.push({
            fileName: file.name,
            error: 'Failed to upload file',
          });
        }
      }
    }

    // Return results
    if (uploadResults.length === 0 && errors.length > 0) {
      // All files failed
      return NextResponse.json(
        {
          success: false,
          error: 'All files failed to upload',
          errors,
        },
        { status: 400 }
      );
    }

    // Get updated category counts
    const categoryCounts = await getFileCategoryCounts(customerId);

    return NextResponse.json({
      success: true,
      data: {
        uploaded: uploadResults,
        errors: errors.length > 0 ? errors : undefined,
        categoryCounts,
      },
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
