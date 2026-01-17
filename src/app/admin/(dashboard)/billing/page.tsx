/**
 * Admin Billing Status Page
 *
 * Displays all submissions with their billing status.
 * Allows filtering by billing status (PENDING, PAID, OVERDUE, CANCELLED),
 * searching by client name or business name, and generating payment links.
 */

import { BillingList } from '@/components/admin/billing';

export default function BillingPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Billing Status</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track billing and subscription status across all clients. Generate payment and subscription links.
        </p>
      </div>

      {/* Billing list */}
      <BillingList />
    </div>
  );
}
