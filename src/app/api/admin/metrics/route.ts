/**
 * Admin Metrics API Route
 *
 * GET /api/admin/metrics
 * Returns dashboard statistics including:
 * - Total leads count
 * - New leads (status = NEW)
 * - Contacted leads (status = CONTACTED)
 * - Paying customers (status = PAID)
 * - Total revenue
 * - Conversion rate
 * - Recent activity
 *
 * Authentication: Required (handled by middleware)
 */

import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth/session';
import { getDashboardMetrics, getRecentActivity } from '@/lib/admin/queries';

export async function GET() {
  try {
    // Verify authentication (belt-and-suspenders with middleware)
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch metrics and recent activity in parallel
    const [metrics, recentActivity] = await Promise.all([
      getDashboardMetrics(),
      getRecentActivity(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        recentActivity,
      },
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
