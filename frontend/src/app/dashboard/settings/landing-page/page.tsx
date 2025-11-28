import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { LandingPageSettingsClient } from '@/components/settings/LandingPageSettingsClient';

export const metadata: Metadata = generatePageMetadata(
  '/dashboard/settings/landing-page',
);

export default function LandingPageSettingsPage() {
  return <LandingPageSettingsClient />;
}
