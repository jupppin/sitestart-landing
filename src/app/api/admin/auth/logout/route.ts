/**
 * Admin Logout API Route
 *
 * POST /api/admin/auth/logout
 * Clears the session cookie to log out the admin user.
 */

import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/auth/session';
import type { AuthResponse } from '@/types/admin';

export async function POST(): Promise<NextResponse<AuthResponse>> {
  try {
    await clearSessionCookie();

    return NextResponse.json(
      { success: true, message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
