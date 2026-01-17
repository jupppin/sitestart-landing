/**
 * Next.js Middleware for Admin Route Protection
 *
 * Protects all /admin/* routes except /admin/login.
 * Redirects unauthenticated users to the login page.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'admin_session';

/**
 * Get the JWT secret as a Uint8Array for jose library
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Verify the JWT token from the request cookies
 */
async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = getJwtSecret();
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes (except /admin/login)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  // Allow access to login page without authentication
  if (pathname === '/admin/login') {
    // If already authenticated, redirect to dashboard
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      const isValid = await verifyToken(token);
      if (isValid) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  // Check for valid session cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Verify the token
  const isValid = await verifyToken(token);

  if (!isValid) {
    // Invalid token, clear it and redirect to login
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Valid session, allow access
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
