/**
 * Admin Login API Route
 *
 * POST /api/admin/auth/login
 * Validates the admin password and creates a JWT session cookie.
 */

import { NextResponse } from 'next/server';
import {
  validatePassword,
  createSession,
  setSessionCookie,
} from '@/lib/auth/session';
import type { AuthResponse, LoginCredentials } from '@/types/admin';

export async function POST(request: Request): Promise<NextResponse<AuthResponse>> {
  try {
    const body = await request.json() as LoginCredentials;
    const { password } = body;

    // Validate required fields
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password against environment variable
    if (!validatePassword(password)) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    // Create JWT token and set cookie
    const token = await createSession();
    await setSessionCookie(token);

    return NextResponse.json(
      { success: true, message: 'Login successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
