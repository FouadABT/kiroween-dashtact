'use client';

/**
 * ThemeActions Component
 * Provides save and reset buttons for theme settings
 */

import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { toast } from '@/hooks/use-toast';
import { useScreenReaderAnnouncement } from '@/hooks/useScreenReaderAnnouncement';
import { RotateCcw, Save } from 'lucide-react';

export function ThemeActions() {
  const { resetToDefaults, refreshSettings } = useTheme();
  const { announce } = useScreenReaderAnnouncement();
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Refresh settings to ensure we have the latest
      await refreshSettings();
      toast.success('Theme settings saved successfully');
      announce('Theme settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save theme settings');
      announce('Failed to save theme settings', 'assertive');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all theme settings to defaults? This action cannot be undone.')) {
      return;
    }

    try {
      setIsResetting(true);
      await resetToDefaults();
      toast.success('Theme settings reset to defaults');
      announce('Theme settings reset to default values');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      toast.error('Failed to reset theme settings');
      announce('Failed to reset theme settings', 'assertive');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold mb-1">Save Changes</h3>
        <p className="text-sm text-muted-foreground">
          Apply your customizations or reset to default settings.
        </p>
      </div>
      <div className="flex gap-3" role="group" aria-label="Theme settings actions">
        <button
          onClick={handleReset}
          disabled={isResetting || isSaving}
          className="
            flex items-center gap-2 px-4 py-2 text-sm border border-border rounded-md 
            hover:bg-accent transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Reset theme settings to default values"
          aria-busy={isResetting}
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} aria-hidden="true" />
          {isResetting ? 'Resetting...' : 'Reset to Defaults'}
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || isResetting}
          className="
            flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md 
            hover:opacity-90 transition-opacity
            disabled:opacity-50 disabled:cursor-not-allowed
          "
          aria-label="Save current theme settings"
          aria-busy={isSaving}
        >
          <Save className="w-4 h-4" aria-hidden="true" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
