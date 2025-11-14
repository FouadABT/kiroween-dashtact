/**
 * Landing Page Editor Page
 * 
 * Allows administrators to customize the landing page content through a visual editor.
 * Requires landing:read permission to access.
 */

import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { LandingPageEditor } from '@/components/landing/LandingPageEditor';

export const metadata: Metadata = generatePageMetadata('/dashboard/settings/landing-page');

export default function LandingPageEditorPage() {
  return (
    <PermissionGuard permission="landing:read">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Landing Page Editor</h1>
            <p className="text-muted-foreground mt-2">
              Customize your landing page sections, content, and global settings
            </p>
          </div>
        </div>
        
        <LandingPageEditor />
      </div>
    </PermissionGuard>
  );
}
