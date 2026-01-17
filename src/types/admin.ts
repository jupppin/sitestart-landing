/**
 * Admin Section TypeScript Interfaces
 *
 * These types define the data structures used throughout the admin section.
 */

// Submission status workflow: NEW -> CONTACTED -> PAID
export type SubmissionStatus = 'NEW' | 'CONTACTED' | 'PAID';

// Project status tracking
export type ProjectStatus =
  | 'NOT_STARTED'
  | 'JUST_STARTED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_FEEDBACK'
  | 'FINISHED_AND_LIVE'
  | 'ON_HOLD'
  | 'CANCELLED';

// Billing status for subscription tracking
export type BillingStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

// Stripe subscription status (matches Stripe API values)
export type StripeSubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid';

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

// Project filters for projects list
export interface ProjectFilters {
  projectStatus?: ProjectStatus;
  search?: string;
}

// Billing filters for billing list
export interface BillingFilters {
  billingStatus?: BillingStatus;
  search?: string;
}

// Full submission data from database
export interface Submission {
  id: number;
  createdAt: Date;
  updatedAt: Date;

  // Contact Info
  fullName: string;
  email: string;
  phone: string | null;

  // Business Details
  businessName: string;
  industryType: string;
  currentWebsite: string | null;
  hasNoWebsite: boolean;

  // Project Requirements
  features: string;
  otherFeatures: string | null;
  budgetRange: string;
  timeline: string;
  additionalInfo: string | null;

  // Status tracking
  status: SubmissionStatus;
  contacted: boolean;
  notes: string | null;

  // Payment tracking
  paidAt: Date | null;
  revenue: number | null;

  // Project Status Tracking
  projectStatus: ProjectStatus;
  projectNotes: string | null;
  liveUrl: string | null;
  goLiveDate: Date | null;

  // Stripe Integration
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: StripeSubscriptionStatus | null;
  subscriptionCurrentPeriodEnd: Date | null;
  subscriptionCanceledAt: Date | null;

  // Billing Status
  billingStatus: BillingStatus;
  lastInvoiceDate: Date | null;
  lastInvoicePaidAt: Date | null;

  // Payment Link Tokens
  setupFeeToken: string | null;
  subscriptionToken: string | null;
}

// Admin navigation item structure
export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}
