/**
 * Security Settings Page
 * 
 * Page for managing security settings including password change
 */

import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { SecurityPageClient } from '@/components/profile/SecurityPageClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/settings/security');

export default function SecurityPage() {
  return <SecurityPageClient />;
}
