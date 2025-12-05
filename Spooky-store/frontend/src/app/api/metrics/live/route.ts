import { NextResponse } from 'next/server';

/**
 * GET /api/metrics/live
 * Returns live system metrics for the ApiWidget example
 */
export async function GET() {
  // Mock data for demonstration
  // In production, this would fetch real metrics from your backend
  const metrics = {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
    network: Math.floor(Math.random() * 1000),
  };

  return NextResponse.json(metrics);
}
