'use client';

/**
 * NotificationSoundSettings Component
 * Settings for notification sound preferences
 */

import { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getNotificationSoundSettings,
  saveNotificationSoundSettings,
  playNotificationSound,
} from '@/lib/notification-sound';

/**
 * NotificationSoundSettings Component
 */
export function NotificationSoundSettings() {
  const [enabled, setEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = () => {
      const settings = getNotificationSoundSettings();
      setEnabled(settings.enabled);
      setVolume(settings.volume);
    };
    loadSettings();
  }, []);

  /**
   * Handle enabled toggle
   */
  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    saveNotificationSoundSettings({ enabled: checked, volume });
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    saveNotificationSoundSettings({ enabled, volume: newVolume });
  };

  /**
   * Test notification sound
   */
  const handleTestSound = () => {
    playNotificationSound();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Sound</CardTitle>
        <CardDescription>
          Configure sound alerts for new notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/disable sound */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="sound-enabled">Enable notification sound</Label>
            <p className="text-sm text-muted-foreground">
              Play a sound when you receive a new notification
            </p>
          </div>
          <Switch
            id="sound-enabled"
            checked={enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {/* Volume control */}
        {enabled && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-volume">Volume</Label>
              <span className="text-sm text-muted-foreground">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="sound-volume"
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="flex-1"
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Test button */}
        {enabled && (
          <Button
            variant="outline"
            onClick={handleTestSound}
            className="w-full"
          >
            Test Sound
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
