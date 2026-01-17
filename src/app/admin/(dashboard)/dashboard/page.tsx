/**
 * Admin Dashboard Page
 *
 * Displays key metrics overview and recent activity for the admin section.
 * Uses client-side data fetching for real-time updates.
 */

import { DashboardContent } from '@/components/admin/dashboard';

export default function DashboardPage() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your leads and customers.
        </p>
      </div>

      {/* Dashboard content with metrics and activity */}
      <DashboardContent />
    </div>
  );
}
