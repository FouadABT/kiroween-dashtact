import { Metadata } from 'next';
import { CalendarSettingsClient } from './CalendarSettingsClient';

export const metadata: Metadata = {
  title: 'Calendar Settings | Dashboard',
  description: 'Manage calendar settings, categories, and permissions',
};

export default function CalendarSettingsPage() {
  return <CalendarSettingsClient />;
}
