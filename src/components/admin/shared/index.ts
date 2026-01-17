/**
 * Shared Admin Components
 *
 * Export all shared components used across the admin section.
 */

export { default as StatusBadge } from './StatusBadge';
export { default as DataTable } from './DataTable';
export { default as SearchFilter } from './SearchFilter';
export { default as Pagination } from './Pagination';

// Re-export types from DataTable
export type { Column } from './DataTable';
