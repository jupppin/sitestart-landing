/**
 * Admin Customers List Page
 *
 * Displays all paying customers (submissions where status is "PAID").
 * Includes search and pagination functionality.
 */

import { CustomerList } from '@/components/admin/customers';

export default function CustomersPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage paying customers who have completed their payment.
        </p>
      </div>

      {/* Customer list */}
      <CustomerList />
    </div>
  );
}
