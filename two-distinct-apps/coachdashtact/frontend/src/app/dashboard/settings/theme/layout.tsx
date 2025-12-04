import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';

export const metadata: Metadata = generatePageMetadata('/dashboard/settings/theme');

export default function ThemeSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
