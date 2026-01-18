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

// Customer Note types
export type NoteType = 'CALL' | 'MEETING' | 'EMAIL' | 'GENERAL';

export interface CustomerNote {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: number;
  content: string;
  noteType: NoteType;
  authorName: string | null;
}

export interface CreateNoteInput {
  content: string;
  noteType?: NoteType;
  authorName?: string;
}

export interface UpdateNoteInput {
  content?: string;
  noteType?: NoteType;
  authorName?: string;
}

// Customer File types
export type FileCategory = 'LOGO' | 'PHOTO' | 'CONTENT' | 'DOCUMENT' | 'GENERAL';

export interface CustomerFile {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: number;
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  category: FileCategory;
  description: string | null;
}

export interface CreateFileInput {
  fileName: string;
  fileKey: string;
  fileSize: number;
  mimeType: string;
  category?: FileCategory;
  description?: string;
}

// Customer Deployment types
export type DomainStatus = 'NONE' | 'DNS_PENDING' | 'DNS_CONFIGURED' | 'ACTIVE' | 'ERROR';
export type DeploymentStatus = 'NOT_DEPLOYED' | 'DEPLOYING' | 'DEPLOYED' | 'FAILED';

export interface CustomerDeployment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: number;
  cfProjectId: string | null;
  cfProjectName: string | null;
  cfProductionUrl: string | null;
  customDomain: string | null;
  domainStatus: DomainStatus;
  deploymentStatus: DeploymentStatus;
  lastDeploymentAt: Date | null;
  lastDeploymentId: string | null;
  lastDeploymentError: string | null;
  gitRepoUrl: string | null;
  gitBranch: string;
}

export interface InitializeDeploymentInput {
  cfProjectName?: string;
  gitRepoUrl?: string;
  gitBranch?: string;
  customDomain?: string;
}

export interface ConfigureDnsInput {
  customDomain: string;
}

// Customer Note filters
export interface NoteFilters {
  noteType?: NoteType;
}
