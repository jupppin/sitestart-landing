import { AdminSidebar, AdminHeader } from '@/components/admin/layout';

/**
 * Authenticated Admin Layout
 *
 * Provides the shell structure for authenticated admin pages including:
 * - Sidebar navigation
 * - Top header with logout functionality
 * - Main content area
 *
 * Note: Route protection is handled by middleware.ts
 */

export default function AuthenticatedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Header */}
      <AdminHeader />

      {/* Main content area */}
      <main className="ml-64 pt-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
