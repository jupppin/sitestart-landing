/**
 * File Storage Library
 *
 * Local filesystem storage abstraction for customer file management.
 * Handles file uploads, deletions, and path generation with proper
 * customer isolation and conflict-free naming.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { FileCategory } from '@/types/admin';

// Configuration from environment variables
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10); // 10MB default

// Valid file categories
const VALID_CATEGORIES: FileCategory[] = ['LOGO', 'PHOTO', 'CONTENT', 'DOCUMENT', 'GENERAL'];

// Category to folder mapping (lowercase for filesystem)
const CATEGORY_FOLDERS: Record<FileCategory, string> = {
  LOGO: 'logos',
  PHOTO: 'photos',
  CONTENT: 'content',
  DOCUMENT: 'documents',
  GENERAL: 'general',
};

// Allowed MIME types by category
const ALLOWED_MIME_TYPES: Record<FileCategory, string[]> = {
  LOGO: ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif'],
  PHOTO: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif'],
  CONTENT: ['text/plain', 'text/markdown', 'text/html', 'application/json'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  GENERAL: [
    'image/png', 'image/jpeg', 'image/svg+xml', 'image/webp', 'image/gif', 'image/avif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain', 'text/markdown', 'text/html', 'text/csv',
    'application/json',
    'application/zip',
  ],
};

// File extension to MIME type mapping for validation
const MIME_TYPE_EXTENSIONS: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/avif': ['.avif'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'text/html': ['.html', '.htm'],
  'text/csv': ['.csv'],
  'application/json': ['.json'],
  'application/zip': ['.zip'],
};

/**
 * Storage error class for specific error handling
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_SIZE' | 'INVALID_TYPE' | 'NOT_FOUND' | 'WRITE_ERROR' | 'DELETE_ERROR' | 'INVALID_CATEGORY'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * File upload result interface
 */
export interface UploadResult {
  fileKey: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  category: FileCategory;
}

/**
 * File input interface (from multipart form data)
 */
export interface FileInput {
  name: string;
  type: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

/**
 * Get the base upload directory path (absolute)
 */
function getBaseUploadDir(): string {
  return path.resolve(process.cwd(), UPLOAD_DIR);
}

/**
 * Get the customer directory path
 */
function getCustomerDir(customerId: number): string {
  return path.join(getBaseUploadDir(), 'customers', String(customerId));
}

/**
 * Get the category directory path for a customer
 */
function getCategoryDir(customerId: number, category: FileCategory): string {
  const folder = CATEGORY_FOLDERS[category] || 'general';
  return path.join(getCustomerDir(customerId), folder);
}

/**
 * Generate a unique, collision-free filename
 * Format: {timestamp}-{uuid}-{sanitized-original-name}
 */
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const uuid = randomUUID().split('-')[0]; // Short UUID segment
  const ext = path.extname(originalName).toLowerCase();
  const baseName = path.basename(originalName, ext);

  // Sanitize the base name: remove special chars, limit length
  const sanitizedBase = baseName
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 50);

  return `${timestamp}-${uuid}-${sanitizedBase}${ext}`;
}

/**
 * Validate file size against MAX_FILE_SIZE
 */
function validateFileSize(size: number): void {
  if (size > MAX_FILE_SIZE) {
    const maxSizeMB = Math.round(MAX_FILE_SIZE / 1024 / 1024);
    throw new StorageError(
      `File size (${Math.round(size / 1024 / 1024)}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
      'INVALID_SIZE'
    );
  }
}

/**
 * Validate file type for the given category
 */
function validateFileType(mimeType: string, category: FileCategory): void {
  const allowedTypes = ALLOWED_MIME_TYPES[category];
  if (!allowedTypes.includes(mimeType)) {
    throw new StorageError(
      `File type "${mimeType}" is not allowed for category "${category}"`,
      'INVALID_TYPE'
    );
  }
}

/**
 * Validate category
 */
function validateCategory(category: string): FileCategory {
  if (!VALID_CATEGORIES.includes(category as FileCategory)) {
    throw new StorageError(
      `Invalid category "${category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`,
      'INVALID_CATEGORY'
    );
  }
  return category as FileCategory;
}

/**
 * Ensure customer directory structure exists
 * Creates: uploads/customers/{customerId}/{category folders}
 */
export async function ensureCustomerDir(customerId: number): Promise<void> {
  const customerDir = getCustomerDir(customerId);

  // Create all category directories
  for (const category of VALID_CATEGORIES) {
    const categoryDir = getCategoryDir(customerId, category);
    await fs.mkdir(categoryDir, { recursive: true });
  }
}

/**
 * Upload a file to the storage system
 *
 * @param customerId - The customer's ID
 * @param file - The file to upload (from multipart form data)
 * @param category - The file category (LOGO, PHOTO, etc.)
 * @returns Upload result with file metadata
 */
export async function uploadFile(
  customerId: number,
  file: FileInput,
  category: FileCategory | string
): Promise<UploadResult> {
  // Validate category
  const validCategory = validateCategory(category);

  // Validate file size
  validateFileSize(file.size);

  // Validate file type
  validateFileType(file.type, validCategory);

  // Ensure customer directory exists
  await ensureCustomerDir(customerId);

  // Generate unique filename
  const uniqueFilename = generateUniqueFilename(file.name);

  // Build file paths
  const categoryDir = getCategoryDir(customerId, validCategory);
  const filePath = path.join(categoryDir, uniqueFilename);

  // Generate file key (relative path from uploads dir for storage in DB)
  const fileKey = `customers/${customerId}/${CATEGORY_FOLDERS[validCategory]}/${uniqueFilename}`;

  try {
    // Get file buffer and write to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    return {
      fileKey,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      category: validCategory,
    };
  } catch (error) {
    console.error('Error writing file:', error);
    throw new StorageError(
      'Failed to write file to storage',
      'WRITE_ERROR'
    );
  }
}

/**
 * Delete a file from storage
 *
 * @param fileKey - The file key (relative path from uploads dir)
 */
export async function deleteFile(fileKey: string): Promise<void> {
  const filePath = getFilePath(fileKey);

  try {
    // Check if file exists
    await fs.access(filePath);

    // Delete the file
    await fs.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist - consider this a success (idempotent delete)
      console.warn(`File not found for deletion: ${fileKey}`);
      return;
    }

    console.error('Error deleting file:', error);
    throw new StorageError(
      'Failed to delete file from storage',
      'DELETE_ERROR'
    );
  }
}

/**
 * Get the full filesystem path for a file key
 *
 * @param fileKey - The file key (relative path from uploads dir)
 * @returns Absolute filesystem path
 */
export function getFilePath(fileKey: string): string {
  return path.join(getBaseUploadDir(), fileKey);
}

/**
 * Check if a file exists
 *
 * @param fileKey - The file key (relative path from uploads dir)
 * @returns True if file exists
 */
export async function fileExists(fileKey: string): Promise<boolean> {
  try {
    const filePath = getFilePath(fileKey);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a file from storage
 *
 * @param fileKey - The file key (relative path from uploads dir)
 * @returns File buffer
 */
export async function readFile(fileKey: string): Promise<Buffer> {
  const filePath = getFilePath(fileKey);

  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new StorageError(
        `File not found: ${fileKey}`,
        'NOT_FOUND'
      );
    }
    throw error;
  }
}

/**
 * Get file stats
 *
 * @param fileKey - The file key (relative path from uploads dir)
 * @returns File stats or null if not found
 */
export async function getFileStats(fileKey: string): Promise<{
  size: number;
  createdAt: Date;
  modifiedAt: Date;
} | null> {
  try {
    const filePath = getFilePath(fileKey);
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
    };
  } catch {
    return null;
  }
}

/**
 * Get MAX_FILE_SIZE for client-side validation
 */
export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}

/**
 * Get allowed MIME types for a category
 */
export function getAllowedMimeTypes(category: FileCategory): string[] {
  return ALLOWED_MIME_TYPES[category] || ALLOWED_MIME_TYPES.GENERAL;
}

/**
 * Determine suggested category based on MIME type
 */
export function suggestCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith('image/')) {
    if (mimeType === 'image/svg+xml') {
      return 'LOGO'; // SVGs are often logos
    }
    return 'PHOTO';
  }

  if (mimeType === 'application/pdf' ||
      mimeType.includes('word') ||
      mimeType.includes('excel') ||
      mimeType.includes('spreadsheet')) {
    return 'DOCUMENT';
  }

  if (mimeType.startsWith('text/')) {
    return 'CONTENT';
  }

  return 'GENERAL';
}
