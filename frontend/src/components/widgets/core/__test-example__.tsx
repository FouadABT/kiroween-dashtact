/**
 * Test example for WidgetContainer component
 * This file demonstrates various usage patterns and can be deleted after verification
 */

import React from "react";
import { WidgetContainer } from "./WidgetContainer";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";

export function WidgetContainerExamples() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">WidgetContainer Examples</h1>

      {/* Basic Widget */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Basic Widget</h2>
        <WidgetContainer title="Basic Widget" description="A simple widget with title and description">
          <p className="text-sm text-muted-foreground">
            This is the widget content. It can contain any React components.
          </p>
        </WidgetContainer>
      </div>

      {/* Widget with Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Widget with Actions</h2>
        <WidgetContainer
          title="Widget with Actions"
          description="This widget has action buttons in the header"
          actions={
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">
            Widget content with action buttons in the header.
          </p>
        </WidgetContainer>
      </div>

      {/* Loading State */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Loading State</h2>
        <WidgetContainer title="Loading Widget" loading={loading}>
          <p className="text-sm text-muted-foreground">
            This content is hidden when loading is true.
          </p>
        </WidgetContainer>
        <Button onClick={() => setLoading(!loading)} className="mt-2">
          Toggle Loading
        </Button>
      </div>

      {/* Error State */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Error State</h2>
        <WidgetContainer
          title="Error Widget"
          error={error}
          onRetry={() => {
            console.log("Retry clicked");
            setError(undefined);
          }}
        >
          <p className="text-sm text-muted-foreground">
            This content is hidden when error is present.
          </p>
        </WidgetContainer>
        <Button
          onClick={() =>
            setError(error ? undefined : "Failed to load data from the server")
          }
          className="mt-2"
        >
          Toggle Error
        </Button>
      </div>

      {/* Collapsible Widget */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Collapsible Widget</h2>
        <WidgetContainer
          title="Collapsible Widget"
          description="Click the chevron to collapse/expand"
          collapsible={true}
          defaultCollapsed={false}
        >
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              This widget can be collapsed to save space.
            </p>
            <p className="text-sm text-muted-foreground">
              The collapse state is managed internally.
            </p>
          </div>
        </WidgetContainer>
      </div>

      {/* Widget with Permission (will show access denied if no permission) */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Widget with Permission</h2>
        <WidgetContainer
          title="Protected Widget"
          description="Requires 'analytics:read' permission"
          permission="analytics:read"
        >
          <p className="text-sm text-muted-foreground">
            This content is only visible to users with the required permission.
          </p>
        </WidgetContainer>
      </div>

      {/* Minimal Widget (no title) */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Minimal Widget</h2>
        <WidgetContainer>
          <div className="text-center py-8">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              A widget without a title or description.
            </p>
          </div>
        </WidgetContainer>
      </div>
    </div>
  );
}
