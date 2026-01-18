/**
 * FileUploader Component
 *
 * Drag-and-drop file upload with category selection and progress tracking.
 * Validates file size before upload and shows upload progress.
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import type { FileCategory } from '@/types/admin';

interface FileUploaderProps {
  customerId: number;
  onUploadComplete: () => void;
  maxFileSize?: number;
  defaultCategory?: FileCategory;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

const CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: 'GENERAL', label: 'General' },
  { value: 'LOGO', label: 'Logo' },
  { value: 'PHOTO', label: 'Photo' },
  { value: 'CONTENT', label: 'Content' },
  { value: 'DOCUMENT', label: 'Document' },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileUploader({
  customerId,
  onUploadComplete,
  maxFileSize = 10485760, // 10MB default
  defaultCategory = 'GENERAL',
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<FileCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file size
  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size (${formatFileSize(file.size)}) exceeds maximum allowed (${formatFileSize(maxFileSize)})`;
    }
    return null;
  }, [maxFileSize]);

  // Handle drag events
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  // Add files with validation
  const addFiles = useCallback((files: File[]) => {
    setError(null);
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const validationError = validateFile(file);
      if (validationError) {
        errors.push(`${file.name}: ${validationError}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  }, [validateFile]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      addFiles(Array.from(files));
    }
    // Reset input so same file can be selected again
    e.target.value = '';
  }, [addFiles]);

  // Remove file from selection
  const removeFile = useCallback((index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Clear all selected files
  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setUploadProgress([]);
    setError(null);
  }, []);

  // Upload files
  const handleUpload = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError(null);

    // Initialize progress for all files
    setUploadProgress(
      selectedFiles.map(file => ({
        fileName: file.name,
        progress: 0,
        status: 'pending' as const,
      }))
    );

    try {
      const formData = new FormData();
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });
      formData.append('category', category);
      if (description.trim()) {
        formData.append('description', description.trim());
      }

      // Update all to uploading
      setUploadProgress(prev =>
        prev.map(p => ({ ...p, status: 'uploading' as const, progress: 50 }))
      );

      const response = await fetch(`/api/admin/customers/${customerId}/files`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update progress based on results
      setUploadProgress(prev =>
        prev.map(p => {
          const uploadedFile = result.data.uploaded?.find(
            (u: { fileName: string }) => u.fileName === p.fileName
          );
          const errorFile = result.data.errors?.find(
            (e: { fileName: string }) => e.fileName === p.fileName
          );

          if (uploadedFile) {
            return { ...p, status: 'complete' as const, progress: 100 };
          } else if (errorFile) {
            return { ...p, status: 'error' as const, error: errorFile.error };
          }
          return p;
        })
      );

      // Clear after short delay to show success
      setTimeout(() => {
        clearFiles();
        setDescription('');
        onUploadComplete();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(prev =>
        prev.map(p => ({ ...p, status: 'error' as const, error: 'Upload failed' }))
      );
    } finally {
      setIsUploading(false);
    }
  }, [selectedFiles, category, description, customerId, clearFiles, onUploadComplete]);

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        <svg
          className={`mx-auto h-12 w-12 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>

        <p className="mt-4 text-sm font-medium text-gray-900">
          {isDragging ? 'Drop files here' : 'Drag and drop files here'}
        </p>
        <p className="mt-1 text-sm text-gray-500">
          or click to browse
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Maximum file size: {formatFileSize(maxFileSize)}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Selected files list */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({selectedFiles.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={isUploading}
            >
              Clear all
            </button>
          </div>

          <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {selectedFiles.map((file, index) => {
              const progress = uploadProgress[index];
              return (
                <li key={`${file.name}-${index}`} className="flex items-center gap-3 p-3">
                  {/* File icon */}
                  <div className="flex-shrink-0">
                    {file.type.startsWith('image/') ? (
                      <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>

                    {/* Progress bar */}
                    {progress && (
                      <div className="mt-1">
                        {progress.status === 'uploading' && (
                          <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200">
                            <div
                              className="h-full bg-blue-500 transition-all"
                              style={{ width: `${progress.progress}%` }}
                            />
                          </div>
                        )}
                        {progress.status === 'complete' && (
                          <span className="text-xs text-green-600">Uploaded</span>
                        )}
                        {progress.status === 'error' && (
                          <span className="text-xs text-red-600">{progress.error}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  {!isUploading && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(index);
                      }}
                      className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {/* Status icon */}
                  {progress?.status === 'complete' && (
                    <svg className="h-5 w-5 flex-shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Category and description */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as FileCategory)}
                disabled={isUploading}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description (optional)
              </label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
                disabled={isUploading}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={isUploading || selectedFiles.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
