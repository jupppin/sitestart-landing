/**
 * Admin Section TypeScript Interfaces
 *
 * These types define the data structures used throughout the admin section.
 */

// Submission status workflow: NEW -> CONTACTED -> PAID
export type SubmissionStatus = 'NEW' | 'CONTACTED' | 'PAID';

// Authentication types
export interface LoginCredentials {
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
}

// Admin session payload (extends jose's JWTPayload structure)
export interface AdminSessionPayload {
  role: 'admin';
  iat?: number;
  exp?: number;
}

// Session verification result
export interface SessionResult {
  isValid: boolean;
  payload?: AdminSessionPayload;
}

// API Response types for admin endpoints
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Pagination for list views
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter options for submissions list
export interface SubmissionFilters {
  status?: SubmissionStatus;
  search?: string;
}

// Admin navigation item structure
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
