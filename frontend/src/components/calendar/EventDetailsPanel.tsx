'use client';

import React from 'react';
import { CalendarEvent } from '@/types/calendar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Repeat,
  Bell,
  Edit,
  Trash2,
  X,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Check,
  XCircle,
  HelpCircle,
  Globe,
  Lock,
} from 'lucide-react';

interface EventDetailsPanelProps {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (event: CalendarEvent) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export function EventDetailsPanel({
  event,
  open,
  onClose,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: EventDetailsPanelProps) {
  if (!event) return null;

  const formatTimeRange = () => {
    if (event.allDay) {
      return 'All day';
    }

    const start = new Date(event.startTime);
    const end = new Date(event.endTime);

    return `${start.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
    })} - ${end.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
    })}`;
  };

  const formatDate = () => {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    const startDate = start.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (event.allDay) {
      const endDate = end.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      if (startDate === endDate) {
        return startDate;
      }
      return `${startDate} - ${endDate}`;
    }

    return startDate;
  };

  const formatRecurrence = () => {
    if (!event.recurrenceRule) return null;

    const { frequency, interval, count, until } = event.recurrenceRule;
    let text = `Repeats ${frequency.toLowerCase()}`;
    
    if (interval > 1) {
      text += ` every ${interval} ${frequency.toLowerCase().slice(0, -2)}s`;
    }

    if (count) {
      text += `, ${count} times`;
    } else if (until) {
      text += ` until ${new Date(until).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    }

    return text;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const visibilityIcon = {
    PUBLIC: Eye,
    PRIVATE: EyeOff,
    TEAM_ONLY: Users,
  }[event.visibility];

  const VisibilityIcon = visibilityIcon;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl p-0 flex flex-col">
        {/* Header with gradient background */}
        <div 
          className="relative px-6 pt-8 pb-6 border-b border-border"
          style={{
            background: `linear-gradient(135deg, ${event.category.color}15 0%, ${event.category.color}05 100%)`,
          }}
        >
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </SheetClose>

          <div className="space-y-3">
            {/* Category badge */}
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: event.category.color }}
              />
              <Badge
                variant="secondary"
                className="font-medium"
              >
                {event.category.name}
              </Badge>
              <Badge
                variant={
                  event.status === 'COMPLETED' ? 'default' :
                  event.status === 'CANCELLED' ? 'destructive' :
                  'outline'
                }
                className="ml-auto"
              >
                {event.status}
              </Badge>
            </div>

            {/* Title */}
            <SheetTitle className="text-2xl font-bold leading-tight pr-8">
              {event.title}
            </SheetTitle>

            {/* Date & Time - Prominent display */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">{formatDate()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{formatTimeRange()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {/* Description */}
            {event.description && (
              <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {event.description}
                </p>
              </div>
            )}

            {/* Quick Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Location */}
              {event.location && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                  <div className="p-2 rounded-md bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Location</p>
                    <p className="text-sm font-medium mt-0.5 truncate">
                      {event.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Visibility */}
              <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                <div className="p-2 rounded-md bg-primary/10">
                  <VisibilityIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Visibility</p>
                  <p className="text-sm font-medium mt-0.5 capitalize">
                    {event.visibility === 'PUBLIC' ? 'Public' : 
                     event.visibility === 'PRIVATE' ? 'Private' : 
                     'Team Only'}
                  </p>
                </div>
              </div>
            </div>

            {/* Attendees */}
            {event.attendees.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">
                    Attendees ({event.attendees.length})
                  </h3>
                </div>
                <div className="grid gap-2">
                  {event.attendees.map((attendee) => {
                    const statusIcon = 
                      attendee.responseStatus === 'ACCEPTED' ? Check :
                      attendee.responseStatus === 'DECLINED' ? XCircle :
                      HelpCircle;
                    const StatusIcon = statusIcon;
                    
                    return (
                      <div
                        key={attendee.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                      >
                        <Avatar className="h-10 w-10 border-2 border-background">
                          <AvatarImage src={attendee.user?.avatarUrl} />
                          <AvatarFallback className="text-xs font-semibold">
                            {attendee.user ? getInitials(attendee.user.name) : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">
                              {attendee.user?.name || 'Unknown'}
                            </p>
                            {attendee.isOrganizer && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                Organizer
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {attendee.user?.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <StatusIcon className={cn(
                            "h-4 w-4",
                            attendee.responseStatus === 'ACCEPTED' && "text-green-500",
                            attendee.responseStatus === 'DECLINED' && "text-destructive",
                            attendee.responseStatus === 'PENDING' && "text-muted-foreground"
                          )} />
                          <span className={cn(
                            "text-xs font-medium",
                            attendee.responseStatus === 'ACCEPTED' && "text-green-600 dark:text-green-400",
                            attendee.responseStatus === 'DECLINED' && "text-destructive",
                            attendee.responseStatus === 'PENDING' && "text-muted-foreground"
                          )}>
                            {attendee.responseStatus === 'ACCEPTED' ? 'Going' :
                             attendee.responseStatus === 'DECLINED' ? 'Declined' :
                             'Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Additional Details */}
            {(event.recurrenceRule || event.reminders.length > 0) && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">Additional Details</h3>
                <div className="space-y-2">
                  {/* Recurrence */}
                  {event.recurrenceRule && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                      <div className="p-2 rounded-md bg-blue-500/10">
                        <Repeat className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recurrence</p>
                        <p className="text-sm font-medium mt-0.5">
                          {formatRecurrence()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reminders */}
                  {event.reminders.length > 0 && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border">
                      <div className="p-2 rounded-md bg-amber-500/10">
                        <Bell className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Reminders</p>
                        <div className="space-y-1 mt-0.5">
                          {event.reminders.map((reminder) => (
                            <p key={reminder.id} className="text-sm font-medium">
                              {reminder.minutesBefore < 60
                                ? `${reminder.minutesBefore} minutes before`
                                : reminder.minutesBefore < 1440
                                ? `${Math.floor(reminder.minutesBefore / 60)} hours before`
                                : `${Math.floor(reminder.minutesBefore / 1440)} days before`}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Linked Entities */}
            {event.linkedEntities && event.linkedEntities.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Linked Items</h3>
                </div>
                <div className="space-y-2">
                  {event.linkedEntities.map((link) => (
                    <div key={link.id} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border text-sm">
                      <Badge variant="outline" className="text-xs">
                        {link.entityType}
                      </Badge>
                      <span className="text-muted-foreground">{link.entityId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Creator Info */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={event.creator.avatarUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(event.creator.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs text-muted-foreground">
                  <p>
                    Created by <span className="font-medium text-foreground">{event.creator.name}</span>
                  </p>
                  <p>
                    {new Date(event.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Actions Footer */}
        {(canEdit || canDelete) && (
          <div className="border-t border-border bg-muted/30 px-6 py-4">
            <div className="flex gap-3">
              {canEdit && onEdit && (
                <Button
                  onClick={() => onEdit(event)}
                  className="flex-1"
                  size="lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  onClick={() => onDelete(event)}
                  variant="destructive"
                  size="lg"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
