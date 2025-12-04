'use client';

import React from 'react';
import { CalendarViewType } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Filter,
  Grid3x3,
  List,
  Columns,
  Square
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CalendarToolbarProps {
  currentView: CalendarViewType;
  dateRangeText: string;
  onViewChange: (view: CalendarViewType) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onToggleFilters: () => void;
  showFilters: boolean;
  onCreateDemo?: () => void;
}

export function CalendarToolbar({
  currentView,
  dateRangeText,
  onViewChange,
  onPrevious,
  onNext,
  onToday,
  onToggleFilters,
  showFilters,
  onCreateDemo,
}: CalendarToolbarProps) {
  const viewIcons: Record<CalendarViewType, React.ReactNode> = {
    month: <Grid3x3 className="h-4 w-4" />,
    week: <Columns className="h-4 w-4" />,
    day: <Square className="h-4 w-4" />,
    agenda: <List className="h-4 w-4" />,
    timeline: <Columns className="h-4 w-4" />,
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-card/50">
      {/* Left section: Navigation */}
      <div className="flex items-center gap-4 w-full sm:w-auto">
        {/* Today button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="shrink-0 h-9 font-medium shadow-sm hover:shadow transition-shadow"
          aria-label="Go to today"
        >
          <CalendarIcon className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Today</span>
        </Button>

        {/* Navigation buttons */}
        <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-background shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevious}
            aria-label="Previous period"
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNext}
            aria-label="Next period"
            className="h-8 w-8 hover:bg-accent hover:text-accent-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Date range display */}
        <div className="flex-1 sm:flex-none">
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            {dateRangeText}
          </h2>
        </div>
      </div>

      {/* Right section: View switcher and filters */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* View switcher - Desktop */}
        <div className="hidden md:flex items-center gap-1 border border-border rounded-lg p-1 bg-background shadow-sm">
          {(['month', 'week', 'day', 'agenda'] as CalendarViewType[]).map((view) => (
            <Button
              key={view}
              variant={currentView === view ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(view)}
              className={cn(
                "h-9 px-3 gap-2 font-medium transition-all",
                currentView === view && "shadow-sm"
              )}
              aria-label={`${view} view`}
              aria-pressed={currentView === view}
            >
              {viewIcons[view]}
              <span className="capitalize">{view}</span>
            </Button>
          ))}
        </div>

        {/* View switcher - Mobile */}
        <div className="md:hidden flex-1">
          <Select value={currentView} onValueChange={(value) => onViewChange(value as CalendarViewType)}>
            <SelectTrigger className="w-full h-9 shadow-sm" aria-label="Select calendar view">
              <SelectValue>
                <div className="flex items-center gap-2">
                  {viewIcons[currentView]}
                  <span className="capitalize font-medium">{currentView}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {(['month', 'week', 'day', 'agenda'] as CalendarViewType[]).map((view) => (
                <SelectItem key={view} value={view}>
                  <div className="flex items-center gap-2">
                    {viewIcons[view]}
                    <span className="capitalize">{view}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters toggle */}
        <Button
          variant={showFilters ? 'default' : 'outline'}
          size="sm"
          onClick={onToggleFilters}
          aria-label="Toggle filters"
          aria-pressed={showFilters}
          className={cn(
            "shrink-0 h-9 gap-2 font-medium shadow-sm transition-all",
            showFilters && "shadow"
          )}
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>
    </div>
  );
}
