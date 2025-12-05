import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import AnalyticsDashboardClient from './AnalyticsDashboardClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/analytics');

export default function AnalyticsDashboardPage() {
  return <AnalyticsDashboardClient />;
}
