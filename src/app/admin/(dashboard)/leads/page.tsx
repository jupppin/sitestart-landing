/**
 * Admin Leads List Page
 *
 * Displays all leads (submissions where status is NOT "PAID").
 * Includes search, filtering, and pagination functionality.
 */

import { LeadList } from '@/components/admin/leads';

export default function LeadsPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage intake form submissions that haven&apos;t converted to paying customers yet.
        </p>
      </div>

      {/* Lead list */}
      <LeadList />
    </div>
  );
}
