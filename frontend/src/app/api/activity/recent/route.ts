import { NextResponse } from 'next/server';

/**
 * GET /api/activity/recent
 * Returns recent activity items for the ApiWidget example
 */
export async function GET() {
  // Mock data for demonstration
  // In production, this would fetch from your backend API
  const activities = {
    items: [
      { description: 'User John Doe logged in', timestamp: new Date().toISOString() },
      { description: 'New user registered: Jane Smith', timestamp: new Date(Date.now() - 300000).toISOString() },
      { description: 'Settings updated by Admin', timestamp: new Date(Date.now() - 600000).toISOString() },
      { description: 'Report generated: Monthly Analytics', timestamp: new Date(Date.now() - 900000).toISOString() },
      { description: 'Database backup completed', timestamp: new Date(Date.now() - 1200000).toISOString() },
      { description: 'User Bob Johnson updated profile', timestamp: new Date(Date.now() - 1500000).toISOString() },
      { description: 'New comment on Post #123', timestamp: new Date(Date.now() - 1800000).toISOString() },
      { description: 'File uploaded: document.pdf', timestamp: new Date(Date.now() - 2100000).toISOString() },
    ],
  };

  return NextResponse.json(activities);
}
