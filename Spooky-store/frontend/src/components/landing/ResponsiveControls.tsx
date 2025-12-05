'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize,
  Eye,
  EyeOff,
  RotateCcw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import {
  type Breakpoint,
  type ResponsiveValue,
  BREAKPOINTS,
  DEVICE_FRAMES,
  getCurrentBreakpoint,
  validateResponsiveContent,
  type ResponsiveValidationIssue,
} from '@/lib/responsive-utils';

interface ResponsiveControlsProps {
  value: ResponsiveValue<any>;
  onChange: (value: ResponsiveValue<any>) => void;
  property: 'fontSize' | 'padding' | 'margin' | 'width' | 'height' | 'visibility';
  unit?: string;
}

export function ResponsiveControls({
  value,
  onChange,
  property,
  unit = 'px',
}: ResponsiveControlsProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<Breakpoint>('desktop');
  const [validationIssues, setValidationIssues] = useState<ResponsiveValidationIssue[]>([]);

  const breakpoints: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];

  const getBreakpointIcon = (bp: Breakpoint) => {
    switch (bp) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      case 'wide':
        return <Maximize className="h-4 w-4" />;
    }
  };

  const handleValueChange = (bp: Breakpoint, newValue: any) => {
    const updated = { ...value, [bp]: newValue };
    onChange(updated);

    // Validate
    if (property === 'fontSize' || property === 'padding' || property === 'width') {
      const issues = validateResponsiveContent({
        [property]: updated as ResponsiveValue<number>,
      });
      setValidationIssues(issues);
    }
  };

  const resetBreakpoint = (bp: Breakpoint) => {
    const updated = { ...value };
    delete updated[bp];
    onChange(updated);
  };

  const hasOverride = (bp: Breakpoint) => {
    return value[bp] !== undefined;
  };

  const renderInput = (bp: Breakpoint) => {
    if (property === 'visibility') {
      return (
        <div className="flex items-center space-x-2">
          <Button
            variant={value[bp] === false ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleValueChange(bp, false)}
          >
            <EyeOff className="h-4 w-4 mr-2" />
            Hidden
          </Button>
          <Button
            variant={value[bp] !== false ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleValueChange(bp, true)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Visible
          </Button>
        </div>
      );
    }

    return (
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={value[bp] ?? value.default ?? ''}
          onChange={(e) => handleValueChange(bp, parseFloat(e.target.value) || 0)}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Breakpoint Selector */}
      <div className="flex items-center space-x-2">
        {breakpoints.map((bp) => (
          <Button
            key={bp}
            variant={activeBreakpoint === bp ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveBreakpoint(bp)}
            className="flex-1"
          >
            {getBreakpointIcon(bp)}
            <span className="ml-2 capitalize">{bp}</span>
            {hasOverride(bp) && bp !== 'mobile' && (
              <Badge variant="secondary" className="ml-2">
                ✓
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Breakpoint Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Min width: {BREAKPOINTS[activeBreakpoint]}px</span>
        {hasOverride(activeBreakpoint) && activeBreakpoint !== 'mobile' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => resetBreakpoint(activeBreakpoint)}
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Value Input */}
      <div className="space-y-2">
        <Label htmlFor={`${property}-${activeBreakpoint}`}>
          {property.charAt(0).toUpperCase() + property.slice(1)} ({activeBreakpoint})
        </Label>
        {renderInput(activeBreakpoint)}
        {hasOverride(activeBreakpoint) && activeBreakpoint !== 'mobile' && (
          <p className="text-xs text-blue-600">
            ✓ Custom value set for {activeBreakpoint}
          </p>
        )}
      </div>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <div className="space-y-2">
          {validationIssues.map((issue, index) => (
            <div
              key={index}
              className={`flex items-start space-x-2 p-2 rounded ${
                issue.type === 'error' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
              }`}
            >
              {issue.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{issue.message}</p>
                <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* All Breakpoints Overview */}
      <Card className="p-4">
        <h4 className="text-sm font-semibold mb-3">All Breakpoints</h4>
        <div className="space-y-2">
          {breakpoints.map((bp) => (
            <div key={bp} className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                {getBreakpointIcon(bp)}
                <span className="capitalize">{bp}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-mono">
                  {value[bp] !== undefined ? `${value[bp]}${unit}` : `${value.default}${unit} (default)`}
                </span>
                {hasOverride(bp) && bp !== 'mobile' && (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

interface DevicePreviewProps {
  children: React.ReactNode;
  device?: string;
  zoom?: number;
}

export function DevicePreview({ children, device = 'Desktop HD', zoom = 1 }: DevicePreviewProps) {
  const [selectedDevice, setSelectedDevice] = useState(device);
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const deviceFrame = DEVICE_FRAMES.find((d) => d.name === selectedDevice) || DEVICE_FRAMES[0];

  return (
    <div className="space-y-4">
      {/* Device Selector */}
      <div className="flex items-center justify-between">
        <Select value={selectedDevice} onValueChange={setSelectedDevice}>
          <SelectTrigger className="w-64">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DEVICE_FRAMES.map((frame) => (
              <SelectItem key={frame.name} value={frame.name}>
                {frame.name} ({frame.width}x{frame.height})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Label>Zoom:</Label>
          <Select value={currentZoom.toString()} onValueChange={(v) => setCurrentZoom(parseFloat(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">50%</SelectItem>
              <SelectItem value="0.75">75%</SelectItem>
              <SelectItem value="1">100%</SelectItem>
              <SelectItem value="1.25">125%</SelectItem>
              <SelectItem value="1.5">150%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Device Frame */}
      <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
        <div
          className="bg-background border-8 border-gray-800 rounded-lg shadow-2xl overflow-hidden"
          style={{
            width: deviceFrame.width * currentZoom,
            height: deviceFrame.height * currentZoom,
            transform: `scale(${currentZoom})`,
            transformOrigin: 'top center',
          }}
        >
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>
      </div>

      {/* Device Info */}
      <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
        <span>{deviceFrame.name}</span>
        <span>•</span>
        <span>{deviceFrame.width}x{deviceFrame.height}px</span>
        <span>•</span>
        <span className="capitalize">{deviceFrame.type}</span>
      </div>
    </div>
  );
}
