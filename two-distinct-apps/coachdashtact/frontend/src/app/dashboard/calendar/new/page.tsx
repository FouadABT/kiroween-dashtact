import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { CreateEventPageClient } from './CreateEventPageClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/calendar/new');

export default function CreateEventPage() {
  return <CreateEventPageClient />;
}
