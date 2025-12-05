/**
 * Utility Widgets Test Page
 * 
 * Quick visual test page for utility widgets.
 * Navigate to /dashboard/widgets-utility-test to view.
 */

'use client';

import { UtilityWidgetsExamples } from '@/components/widgets/utility/examples';

export default function UtilityWidgetsTestPage() {
  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Utility Widgets Test</h1>
        <p className="text-muted-foreground">
          Visual test page for Badge, Avatar, Tooltip, and Modal components
        </p>
      </div>
      <UtilityWidgetsExamples />
    </div>
  );
}
