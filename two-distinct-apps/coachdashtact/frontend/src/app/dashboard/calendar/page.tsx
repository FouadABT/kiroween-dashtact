import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { CalendarPageClient } from './CalendarPageClient';
import { isFeatureEnabled } from '@/config/features.config';

export const metadata: Metadata = generatePageMetadata('/dashboard/calendar');

export default function CalendarPage() {
  // Check if calendar feature is enabled
  if (!isFeatureEnabled('calendar')) {
    notFound();
  }

  return <CalendarPageClient />;
}
