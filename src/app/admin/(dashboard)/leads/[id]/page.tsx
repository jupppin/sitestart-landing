/**
 * Admin Lead Detail Page
 *
 * Displays all details for a single lead with ability to:
 * - Update status (NEW -> CONTACTED -> PAID)
 * - Edit notes
 * - When marking as PAID, prompt for revenue amount
 */

import { LeadDetailContent } from '@/components/admin/leads';

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const leadId = parseInt(id, 10);

  // Validate ID
  if (isNaN(leadId)) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="text-lg font-semibold text-red-700">Invalid Lead ID</h2>
        <p className="mt-2 text-sm text-red-600">
          The lead ID provided is not valid.
        </p>
        <a
          href="/admin/leads"
          className="mt-4 inline-block text-sm font-medium text-red-700 underline hover:no-underline"
        >
          Back to Leads
        </a>
      </div>
    );
  }

  return (
    <div>
      <LeadDetailContent leadId={leadId} />
    </div>
  );
}
