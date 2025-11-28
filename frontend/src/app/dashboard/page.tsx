"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { useMetadata } from "@/contexts/MetadataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWidgets } from "@/contexts/WidgetContext";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { WidgetLibrary } from "@/components/admin/WidgetLibrary";
import { DashboardDataProvider } from "@/contexts/DashboardDataContext";
import { DashboardRefreshButton } from "@/components/dashboard/DashboardRefreshButton";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Plus } from "lucide-react";

export default function DashboardPage() {
  const { updateMetadata } = useMetadata();
  const { hasPermission } = useAuth();
  const { isEditMode, toggleEditMode, currentLayout, isLoading } = useWidgets();
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);

  useEffect(() => {
    updateMetadata({
      title: "Dashboard",
      description: "Your personal dashboard overview",
      keywords: ["dashboard", "overview", "analytics"],
    });
  }, [updateMetadata]);

  // Debug logging
  useEffect(() => {
    console.log('🔍 Dashboard Debug:', {
      isEditMode,
      isLoading,
      hasCurrentLayout: !!currentLayout,
      currentLayoutId: currentLayout?.id,
      currentLayoutKeys: currentLayout ? Object.keys(currentLayout) : [],
      currentLayoutFull: currentLayout,
      showWidgetLibrary,
    });
  }, [isEditMode, isLoading, currentLayout, showWidgetLibrary]);

  // Check if user has permission to edit layouts
  const canEditLayout = hasPermission("layouts:write");

  const handleSaveChanges = () => {
    // Changes are auto-saved, just exit edit mode
    toggleEditMode();
  };

  return (
    <DashboardDataProvider>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard Overview"
          description={
            isEditMode
              ? "Edit mode: Add, remove, or rearrange widgets. Drag widgets to reorder them."
              : "Customize your dashboard with widgets. Click Edit Layout to add, remove, or rearrange widgets."
          }
          actions={
            <div className="flex items-center gap-2">
              {/* Dashboard Refresh Button */}
              {!isEditMode && <DashboardRefreshButton />}
              
              {/* Edit Mode Actions */}
              {canEditLayout && (
                <>
                  {isEditMode && (
                    <>
                      <Button
                        onClick={() => {
                          console.log('🎯 Add Widget clicked:', {
                            hasCurrentLayout: !!currentLayout,
                            currentLayoutId: currentLayout?.id,
                            isLoading,
                          });
                          if (currentLayout) {
                            setShowWidgetLibrary(true);
                          } else {
                            console.error('❌ No current layout available!');
                          }
                        }}
                        variant="default"
                        disabled={!currentLayout || isLoading}
                        title={!currentLayout ? "Loading layout..." : "Add widgets to your dashboard"}
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
                </>
              )}
            </div>
          }
        />

      {/* Edit Mode Info Banner */}
      {isEditMode && (
        <div className="rounded-lg border border-primary bg-primary/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-primary mb-1">
                Edit Mode Active
              </h3>
              <p className="text-sm text-muted-foreground">
                • Click "Add Widget" to browse and add new widgets
                <br />
                • Drag widgets by their handle (⋮⋮) to reorder them
                <br />
                • Use the dropdown on each widget to change its size
                <br />
                • Click the delete icon (🗑️) to remove a widget
                <br />• Click "Save Changes" when you're done
              </p>
            </div>
          </div>
        </div>
      )}

      <DashboardGrid pageId="main-dashboard" />

        {/* Widget Library Modal */}
        {currentLayout && (
          <WidgetLibrary
            open={showWidgetLibrary}
            onClose={() => setShowWidgetLibrary(false)}
            layoutId={currentLayout.id}
            pageIdentifier="main-dashboard"
          />
        )}
      </div>
    </DashboardDataProvider>
  );
}
