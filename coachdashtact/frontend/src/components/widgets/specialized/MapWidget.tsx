'use client';

/**
 * MapWidget Component
 * 
 * Displays a map with markers (placeholder implementation).
 * Can be integrated with react-leaflet or other mapping libraries later.
 * 
 * @example
 * ```tsx
 * <MapWidget
 *   center={{ lat: 40.7128, lng: -74.0060 }}
 *   zoom={12}
 *   markers={[
 *     { id: '1', lat: 40.7128, lng: -74.0060, label: 'New York', color: 'red' },
 *     { id: '2', lat: 40.7589, lng: -73.9851, label: 'Times Square', color: 'blue' }
 *   ]}
 *   onMarkerClick={(marker) => console.log('Clicked:', marker)}
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MapPin, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BaseWidgetProps } from '../types/widget.types';

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface MapMarker extends MapCoordinates {
  id: string;
  label?: string;
  color?: string;
  icon?: React.ReactNode;
  data?: Record<string, unknown>;
}

export interface MapWidgetProps extends BaseWidgetProps {
  /** Map center coordinates */
  center: MapCoordinates;
  /** Zoom level (1-20) */
  zoom?: number;
  /** Markers to display */
  markers?: MapMarker[];
  /** Marker click handler */
  onMarkerClick?: (marker: MapMarker) => void;
  /** Map height */
  height?: number | string;
  /** Show zoom controls */
  showControls?: boolean;
}

/**
 * Calculate marker position on the placeholder map
 */
function calculateMarkerPosition(
  marker: MapCoordinates,
  center: MapCoordinates,
  zoom: number
): { x: number; y: number } {
  // Simple projection for placeholder
  const scale = Math.pow(2, zoom - 10);
  const x = 50 + (marker.lng - center.lng) * scale * 100;
  const y = 50 - (marker.lat - center.lat) * scale * 100;
  
  return { x, y };
}

export function MapWidget({
  center,
  zoom = 12,
  markers = [],
  onMarkerClick,
  height = 400,
  showControls = true,
  className = '',
}: MapWidgetProps) {
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleZoomIn = () => {
    setCurrentZoom(prev => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setCurrentZoom(prev => Math.max(prev - 1, 1));
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const containerHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <Card 
      className={`overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50' : ''} ${className}`}
    >
      <div 
        className="relative bg-muted"
        style={{ height: isFullscreen ? 'calc(100vh - 2rem)' : containerHeight }}
      >
        {/* Placeholder Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100 dark:from-blue-950 dark:to-green-950">
          {/* Grid lines for visual effect */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Center indicator */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          </div>

          {/* Markers */}
          {markers.map((marker) => {
            const position = calculateMarkerPosition(marker, center, currentZoom);
            
            // Only show markers that are within bounds
            if (position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) {
              return null;
            }

            return (
              <div
                key={marker.id}
                className="absolute -translate-x-1/2 -translate-y-full cursor-pointer group"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                }}
                onClick={() => onMarkerClick?.(marker)}
              >
                {/* Marker Icon */}
                <div 
                  className="transition-transform group-hover:scale-110"
                  style={{ color: marker.color || '#ef4444' }}
                >
                  {marker.icon || <MapPin className="h-8 w-8 drop-shadow-lg" fill="currentColor" />}
                </div>

                {/* Marker Label */}
                {marker.label && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-background border border-border rounded px-2 py-1 text-xs font-medium shadow-lg">
                      {marker.label}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Map Info Overlay */}
        <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 text-xs">
          <div className="font-medium text-foreground">
            Lat: {center.lat.toFixed(4)}, Lng: {center.lng.toFixed(4)}
          </div>
          <div className="text-muted-foreground">
            Zoom: {currentZoom}
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={handleZoomIn}
              disabled={currentZoom >= 20}
              className="bg-background/90 backdrop-blur-sm"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleZoomOut}
              disabled={currentZoom <= 1}
              className="bg-background/90 backdrop-blur-sm"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              onClick={handleFullscreen}
              className="bg-background/90 backdrop-blur-sm"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Placeholder Notice */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground">
          Placeholder map - integrate react-leaflet for production use
        </div>
      </div>
    </Card>
  );
}

