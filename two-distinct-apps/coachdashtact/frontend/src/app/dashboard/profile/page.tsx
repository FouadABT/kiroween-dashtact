/**
 * Profile Page
 * 
 * Main profile management page with personal information and avatar
 */

import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { ProfilePageClient } from '@/components/profile/ProfilePageClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/profile');

export default function ProfilePage() {
  return <ProfilePageClient />;
}
