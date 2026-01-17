import { redirect } from 'next/navigation';

/**
 * Admin Root Page
 *
 * Redirects to the dashboard page.
 * This ensures /admin always goes to /admin/dashboard.
 */

export default function AdminPage() {
  redirect('/admin/dashboard');
}
