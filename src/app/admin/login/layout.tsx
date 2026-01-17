import type { Metadata } from 'next';

/**
 * Login Page Layout
 *
 * This layout overrides the admin layout for the login page,
 * providing a clean page without the sidebar and header.
 */

export const metadata: Metadata = {
  title: 'Login | SiteStart Admin',
  description: 'Login to SiteStart Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
