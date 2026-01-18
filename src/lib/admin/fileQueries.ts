/**
 * Customer File Database Queries
 *
 * Centralized database query functions for customer file management.
 * All queries use Prisma client for type-safe database access.
 */

import { prisma } from '@/lib/db';
import type { FileCategory, CreateFileInput, CustomerFile } from '@/types/admin';

/**
 * Valid file categories
 */
const VALID_CATEGORIES: FileCategory[] = ['LOGO', 'PHOTO', 'CONTENT', 'DOCUMENT', 'GENERAL'];

/**
 * Get all files for a customer, optionally filtered by category
 *
 * @param customerId - The customer's ID
 * @param category - Optional category filter
 * @returns Array of customer files
 */
export async function getFilesByCustomerId(
  customerId: number,
  category?: FileCategory
): Promise<CustomerFile[]> {
  const where: {
    customerId: number;
    category?: string;
  } = { customerId };

  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  const files = await prisma.customerFile.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return files as CustomerFile[];
}

/**
 * Get a single file by ID
 *
 * @param fileId - The file's ID
 * @returns File record or null if not found
 */
export async function getFileById(fileId: number): Promise<CustomerFile | null> {
  const file = await prisma.customerFile.findUnique({
    where: { id: fileId },
  });

  return file as CustomerFile | null;
}

/**
 * Get a file by its storage key
 *
 * @param fileKey - The file's storage key
 * @returns File record or null if not found
 */
export async function getFileByKey(fileKey: string): Promise<CustomerFile | null> {
  const file = await prisma.customerFile.findUnique({
    where: { fileKey },
  });

  return file as CustomerFile | null;
}

/**
 * Create a new file record in the database
 *
 * @param customerId - The customer's ID
 * @param data - File creation data
 * @returns Created file record
 */
export async function createFileRecord(
  customerId: number,
  data: CreateFileInput
): Promise<CustomerFile> {
  const file = await prisma.customerFile.create({
    data: {
      customerId,
      fileName: data.fileName,
      fileKey: data.fileKey,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      category: data.category || 'GENERAL',
      description: data.description || null,
    },
  });

  return file as CustomerFile;
}

/**
 * Update a file record
 *
 * @param fileId - The file's ID
 * @param data - Update data
 * @returns Updated file record
 */
export async function updateFileRecord(
  fileId: number,
  data: {
    fileName?: string;
    category?: FileCategory;
    description?: string | null;
  }
): Promise<CustomerFile> {
  const file = await prisma.customerFile.update({
    where: { id: fileId },
    data,
  });

  return file as CustomerFile;
}

/**
 * Delete a file record from the database
 *
 * @param fileId - The file's ID
 * @returns Deleted file record
 */
export async function deleteFileRecord(fileId: number): Promise<CustomerFile> {
  const file = await prisma.customerFile.delete({
    where: { id: fileId },
  });

  return file as CustomerFile;
}

/**
 * Get file count for a customer, optionally by category
 *
 * @param customerId - The customer's ID
 * @param category - Optional category filter
 * @returns File count
 */
export async function getFileCount(
  customerId: number,
  category?: FileCategory
): Promise<number> {
  const where: {
    customerId: number;
    category?: string;
  } = { customerId };

  if (category && VALID_CATEGORIES.includes(category)) {
    where.category = category;
  }

  return prisma.customerFile.count({ where });
}

/**
 * Get file counts grouped by category for a customer
 *
 * @param customerId - The customer's ID
 * @returns Object with category counts
 */
export async function getFileCategoryCounts(
  customerId: number
): Promise<Record<FileCategory | 'ALL', number>> {
  const counts = await prisma.customerFile.groupBy({
    by: ['category'],
    where: { customerId },
    _count: { category: true },
  });

  // Initialize all categories with 0
  const result: Record<FileCategory | 'ALL', number> = {
    LOGO: 0,
    PHOTO: 0,
    CONTENT: 0,
    DOCUMENT: 0,
    GENERAL: 0,
    ALL: 0,
  };

  // Fill in actual counts
  let total = 0;
  for (const count of counts) {
    const category = count.category as FileCategory;
    if (category in result) {
      result[category] = count._count.category;
      total += count._count.category;
    }
  }

  result.ALL = total;

  return result;
}

/**
 * Get total storage used by a customer (sum of file sizes)
 *
 * @param customerId - The customer's ID
 * @returns Total bytes used
 */
export async function getCustomerStorageUsed(customerId: number): Promise<number> {
  const result = await prisma.customerFile.aggregate({
    where: { customerId },
    _sum: { fileSize: true },
  });

  return result._sum.fileSize || 0;
}

/**
 * Check if a customer has any files
 *
 * @param customerId - The customer's ID
 * @returns True if customer has files
 */
export async function customerHasFiles(customerId: number): Promise<boolean> {
  const count = await prisma.customerFile.count({
    where: { customerId },
    take: 1,
  });

  return count > 0;
}

/**
 * Batch delete all files for a customer
 * Note: This only deletes DB records - caller must handle storage cleanup
 *
 * @param customerId - The customer's ID
 * @returns Number of deleted records
 */
export async function deleteAllCustomerFiles(customerId: number): Promise<number> {
  const result = await prisma.customerFile.deleteMany({
    where: { customerId },
  });

  return result.count;
}

/**
 * Get files by MIME type for a customer
 *
 * @param customerId - The customer's ID
 * @param mimeTypePrefix - MIME type prefix (e.g., 'image/' for all images)
 * @returns Array of matching files
 */
export async function getFilesByMimeType(
  customerId: number,
  mimeTypePrefix: string
): Promise<CustomerFile[]> {
  const files = await prisma.customerFile.findMany({
    where: {
      customerId,
      mimeType: { startsWith: mimeTypePrefix },
    },
    orderBy: { createdAt: 'desc' },
  });

  return files as CustomerFile[];
}

/**
 * Search files by name for a customer
 *
 * @param customerId - The customer's ID
 * @param searchTerm - Search term for file name
 * @returns Array of matching files
 */
export async function searchFiles(
  customerId: number,
  searchTerm: string
): Promise<CustomerFile[]> {
  const files = await prisma.customerFile.findMany({
    where: {
      customerId,
      fileName: { contains: searchTerm },
    },
    orderBy: { createdAt: 'desc' },
  });

  return files as CustomerFile[];
}
