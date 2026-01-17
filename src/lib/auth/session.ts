/**
 * JWT Session Utilities
 *
 * Handles JWT creation, verification, and cookie management for admin authentication.
 * Uses the `jose` library for JWT operations with HttpOnly cookies.
 */

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AdminSessionPayload, SessionResult } from '@/types/admin';

// Cookie configuration
const COOKIE_NAME = 'admin_session';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

/**
 * Get the JWT secret as a Uint8Array for jose library
 */
function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
}

/**
 * Create a new JWT token for an authenticated admin session
 */
export async function createSession(): Promise<string> {
  const secret = getJwtSecret();
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(now)
    .setExpirationTime(now + COOKIE_MAX_AGE)
    .sign(secret);

  return token;
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifySession(token: string): Promise<SessionResult> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify(token, secret);

    return {
      isValid: true,
      payload: payload as unknown as AdminSessionPayload,
    };
  } catch {
    return {
      isValid: false,
    };
  }
}

/**
 * Set the session cookie with the JWT token
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * Get the session token from cookies
 */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Clear the session cookie (logout)
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Validate the admin password against the environment variable
 */
export function validatePassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error('ADMIN_PASSWORD environment variable is not set');
    return false;
  }
  return password === adminPassword;
}

/**
 * Check if the current request has a valid admin session
 * This is a convenience function that combines getSessionToken and verifySession
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionToken();
  if (!token) {
    return false;
  }
  const result = await verifySession(token);
  return result.isValid;
}
