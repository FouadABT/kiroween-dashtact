'use client';

import { useState, useCallback } from 'react';
import { CalendarViewType, CalendarFilters, CalendarEvent } from '@/types/calendar';
import { CalendarToolbar } from './CalendarToolbar';
import { CalendarFiltersComponent } from './CalendarFilters';
import { MonthView } from './MonthView';
import { WeekView } from './WeekView';
import { DayView } from './DayView';
import { AgendaView } from './AgendaView';
import { EventDetailsPanel } from './EventDetailsPanel';

interface CalendarViewProps {
  initialView?: CalendarViewType;
  initialDate?: Date;
  events?: CalendarEvent[];
  onEventEdit?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
  onEventDrop?: (event: CalendarEvent, newStart: Date, newEnd: Date) => void;
  onCreateDemo?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function CalendarView({
  initialView = 'month',
  initialDate = new Date(),
  events = [],
  onEventEdit,
  onEventDelete,
  onEventDrop,
  onCreateDemo,
  canEdit = true,
  canDelete = true,
}: CalendarViewProps) {
  // State
  const [currentView, setCurrentView] = useState<CalendarViewType>(initialView);
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [filters, setFilters] = useState<CalendarFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDetails, setShowEventDetails] = useState(false);

  // Navigation handlers
  const handlePrevious = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'agenda':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  const handleNext = useCallback(() => {
    const newDate = new Date(currentDate);
    switch (currentView) {
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'agenda':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  }, [currentDate, currentView]);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const handleViewChange = useCallback((view: CalendarViewType) => {
    setCurrentView(view);
  }, []);

  const handleFiltersChange = useCallback((newFilters: CalendarFilters) => {
    setFilters(newFilters);
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  }, []);

  const handleCloseEventDetails = useCallback(() => {
    setShowEventDetails(false);
    setSelectedEvent(null);
  }, []);

  const handleEventEdit = useCallback((event: CalendarEvent) => {
    handleCloseEventDetails();
    if (onEventEdit) {
      onEventEdit(event);
    }
  }, [onEventEdit, handleCloseEventDetails]);

  const handleEventDelete = useCallback((event: CalendarEvent) => {
    handleCloseEventDetails();
    if (onEventDelete) {
      onEventDelete(event);
    }
  }, [onEventDelete, handleCloseEventDetails]);

  // Format date range for display
  const getDateRangeText = useCallback(() => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      year: 'numeric' 
    };
    
    switch (currentView) {
      case 'month':
        return currentDate.toLocaleDateString('en-US', options);
      case 'week': {
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        if (weekStart.getMonth() === weekEnd.getMonth()) {
          return `${weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { day: 'numeric', year: 'numeric' })}`;
        }
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      }
      case 'day':
        return currentDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric', 
          year: 'numeric' 
        });
      case 'agenda':
        return currentDate.toLocaleDateString('en-US', options);
      default:
        return '';
    }
  }, [currentDate, currentView]);

  // Render the appropriate view
  const renderView = () => {
    const commonProps = {
      currentDate,
      events,
      onEventClick: handleEventClick,
      onEventDrop,
    };

    switch (currentView) {
      case 'month':
        return <MonthView {...commonProps} />;
      case 'week':
        return <WeekView {...commonProps} />;
      case 'day':
        return <DayView {...commonProps} />;
      case 'agenda':
        return <AgendaView {...commonProps} />;
      default:
        return <MonthView {...commonProps} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Toolbar */}
      <div className="border-b border-border bg-card/30 backdrop-blur-sm supports-[backdrop-filter]:bg-card/50 shadow-sm">
        <CalendarToolbar
          currentView={currentView}
          dateRangeText={getDateRangeText()}
          onViewChange={handleViewChange}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onToday={handleToday}
          onToggleFilters={toggleFilters}
          showFilters={showFilters}
          onCreateDemo={onCreateDemo}
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="border-b border-border bg-muted/30 p-4 shadow-sm">
          <CalendarFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
      )}

      {/* Calendar View Content */}
      <div className="flex-1 overflow-auto bg-background">
        {renderView()}
      </div>

      {/* Event Details Panel */}
      <EventDetailsPanel
        event={selectedEvent}
        open={showEventDetails}
        onClose={handleCloseEventDetails}
        onEdit={handleEventEdit}
        onDelete={handleEventDelete}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  );
}
