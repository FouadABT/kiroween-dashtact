"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMetadata } from "@/contexts/MetadataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWidgets } from "@/contexts/WidgetContext";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { WidgetLibrary } from "@/components/admin/WidgetLibrary";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Plus } from "lucide-react";

export default function AnalyticsDashboardClient() {
  const { updateMetadata } = useMetadata();
  const { hasPermission } = useAuth();
  const { isEditMode, toggleEditMode, currentLayout, isLoading } = useWidgets();
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  useEffect(() => {
    updateMetadata({
      title: "Analytics Dashboard",
      description: "View detailed analytics and performance metrics",
      keywords: ["analytics", "metrics", "performance", "dashboard"],
    });
  }, [updateMetadata]);

  // Check if user has permission to edit layouts
  const canEditLayout = hasPermission("layouts:write");

  const handleSaveChanges = () => {
    // Changes are auto-saved, just exit edit mode
    toggleEditMode();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics Dashboard"
        description={
          isEditMode
            ? "Edit mode: Add, remove, or rearrange widgets. Drag widgets to reorder them."
            : "Customize your analytics dashboard with widgets. Click Edit Layout to add, remove, or rearrange widgets."
        }
        actions={
          canEditLayout && (
            <div className="flex items-center gap-2">
              {isEditMode && (
                <>
                  <Button
                    onClick={() => {
                      if (currentLayout) {
                        setShowWidgetLibrary(true);
                      }
                    }}
                    variant="default"
                    disabled={!currentLayout || isLoading}
                    title={!currentLayout ? "Loading layout..." : "Add widgets to your analytics dashboard"}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {isLoading ? "Loading..." : "Add Widget"}
                  </Button>
                  <Button onClick={handleSaveChanges} variant="default">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              )}
              <Button
                onClick={toggleEditMode}
                variant={isEditMode ? "outline" : "default"}
              >
                {isEditMode ? (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Layout
                  </>
                )}
              </Button>
            </div>
          )
        }
      />
      <DashboardGrid pageId="analytics-dashboard" />
      
      {/* Widget Library Modal */}
      {currentLayout && (
        <WidgetLibrary
          open={showWidgetLibrary}
          onClose={() => setShowWidgetLibrary(false)}
          layoutId={currentLayout.id}
          pageIdentifier="analytics-dashboard"
        />
      )}
    </div>
  );
}
