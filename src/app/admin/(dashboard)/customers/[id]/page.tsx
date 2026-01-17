/**
 * Admin Customer Detail Page
 *
 * Displays all details for a single customer including:
 * - Revenue with proper currency formatting
 * - Payment date
 * - Contact and business information
 * - Project requirements
 * - Notes (editable)
 */

import { CustomerDetailContent } from '@/components/admin/customers';

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = await params;
  const customerId = parseInt(id, 10);

  // Validate ID
  if (isNaN(customerId)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-700">Invalid Customer ID</h2>
        <p className="mt-2 text-sm text-red-600">
          The customer ID provided is not valid.
        </p>
        <a
          href="/admin/customers"
          className="mt-4 inline-block text-sm font-medium text-red-700 underline hover:no-underline"
        >
          Back to Customers
        </a>
      </div>
    );
  }

  return (
    <div>
      <CustomerDetailContent customerId={customerId} />
    </div>
  );
}
