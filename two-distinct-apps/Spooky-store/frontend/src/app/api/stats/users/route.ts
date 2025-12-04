import { NextResponse } from 'next/server';

/**
 * GET /api/stats/users
 * Returns user statistics for the ApiWidget example
 */
export async function GET() {
  // Mock data for demonstration
  // In production, this would fetch from your backend API
  const stats = {
    total: 1234,
    active: 856,
    inactive: 378,
    newThisMonth: 42,
  };

  return NextResponse.json(stats);
}
