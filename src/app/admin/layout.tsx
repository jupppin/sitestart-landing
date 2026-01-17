import type { Metadata } from 'next';

/**
 * Admin Root Layout
 *
 * This is a pass-through layout that allows child route groups
 * to define their own layouts. The authenticated pages use a
 * route group with sidebar/header, while login has a clean layout.
 */

export const metadata: Metadata = {
  title: 'Admin | SiteStart',
  description: 'SiteStart Admin Dashboard',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
