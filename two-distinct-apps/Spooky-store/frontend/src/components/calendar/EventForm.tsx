'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalendarIcon, Clock, MapPin, Users, Eye, X, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { UserApi } from '@/lib/api';
import type { CalendarEvent, EventCategory, CreateEventDto, UpdateEventDto } from '@/types/calendar';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

interface EventFormProps {
  event?: CalendarEvent;
  categories?: EventCategory[];
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface EventFormData {
  title: string;
  description?: string;
  startDate: Date;
  startTime: string;
  endDate: Date;
  endTime: string;
  allDay: boolean;
  location?: string;
  categoryId: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY';
  color?: string;
  attendeeIds?: string[];
}

export function EventForm({
  event,
  categories = [],
  onSubmit,
  onCancel,
  isLoading = false,
}: EventFormProps) {
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const [attendeeSearchOpen, setAttendeeSearchOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedAttendees, setSelectedAttendees] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Load available users for attendee selection
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setUsersLoading(true);
        console.log('🔄 Loading users for attendee selection...');
        
        const response = await UserApi.getUsers({ limit: 100 });
        console.log('✅ Users API response:', response);
        
        // Handle different response formats
        // Backend returns: { statusCode, message, data: { users, total, page, limit, totalPages } }
        let usersList: any[] = [];
        if (Array.isArray(response)) {
          usersList = response;
        } else if (response.data?.users && Array.isArray(response.data.users)) {
          // Correct path: response.data.users
          usersList = response.data.users;
        } else if (response.users && Array.isArray(response.users)) {
          usersList = response.users;
        } else if (response.data && Array.isArray(response.data)) {
          usersList = response.data;
        }
        
        const users = usersList.map((u: any) => ({
          id: u.id,
          name: u.name || u.email || 'Unknown User',
          email: u.email,
          avatarUrl: u.avatarUrl || u.avatar_url,
        }));
        
        console.log(`✅ Loaded ${users.length} users for attendee selection:`, users);
        setAvailableUsers(users);

        // Pre-select attendees if editing event
        if (event?.attendees) {
          const eventAttendees = event.attendees
            .filter(a => !a.isOrganizer && a.user)
            .map(a => ({
              id: a.user!.id,
              name: a.user!.name,
              email: a.user!.email,
              avatarUrl: a.user!.avatarUrl,
            }));
          console.log(`✅ Pre-selected ${eventAttendees.length} attendees`);
          setSelectedAttendees(eventAttendees);
        }
      } catch (error: any) {
        console.error('❌ Failed to load users for attendee selection:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          response: error.response,
        });
        
        // Set error message
        let errorMsg = 'Failed to load users';
        if (error.status === 403) {
          errorMsg = 'You do not have permission to view users';
        } else if (error.status === 401) {
          errorMsg = 'Please log in again';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setUsersError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setUsersLoading(false);
      }
    };

    loadUsers();
  }, [event]);

  const retryLoadUsers = () => {
    setUsersError(null);
    setUsersLoading(true);
    // Trigger reload by updating a dependency
    window.location.reload();
  };

  const form = useForm<EventFormData>({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      startDate: event?.startTime ? new Date(event.startTime) : new Date(),
      startTime: event?.startTime
        ? format(new Date(event.startTime), 'HH:mm')
        : '09:00',
      endDate: event?.endTime ? new Date(event.endTime) : new Date(),
      endTime: event?.endTime
        ? format(new Date(event.endTime), 'HH:mm')
        : '10:00',
      allDay: event?.allDay || false,
      location: event?.location || '',
      categoryId: event?.category?.id || categories[0]?.id || '',
      visibility: event?.visibility || 'PUBLIC',
      color: event?.color || '',
    },
  });

  const allDay = form.watch('allDay');
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');

  // Auto-adjust end date if start date is after end date
  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      form.setValue('endDate', startDate);
    }
  }, [startDate, endDate, form]);

  const handleSubmit = async (data: EventFormData) => {
    try {
      // Validate time range
      const startDateTime = new Date(data.startDate);
      const endDateTime = new Date(data.endDate);

      if (!data.allDay) {
        const [startHour, startMinute] = data.startTime.split(':').map(Number);
        const [endHour, endMinute] = data.endTime.split(':').map(Number);

        startDateTime.setHours(startHour, startMinute, 0, 0);
        endDateTime.setHours(endHour, endMinute, 0, 0);
      } else {
        startDateTime.setHours(0, 0, 0, 0);
        endDateTime.setHours(23, 59, 59, 999);
      }

      if (endDateTime <= startDateTime) {
        toast.error('End time must be after start time');
        return;
      }

      const eventData = {
        title: data.title,
        description: data.description || undefined,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        allDay: data.allDay,
        location: data.location || undefined,
        categoryId: data.categoryId,
        visibility: data.visibility,
        color: data.color || undefined,
        attendeeIds: selectedAttendees.map(a => a.id),
      };

      await onSubmit(eventData);
      toast.success(event ? 'Event updated successfully' : 'Event created successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to save event'
      );
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          rules={{ required: 'Title is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Event title"
                  {...field}
                  className="bg-background"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Event description"
                  rows={3}
                  {...field}
                  className="bg-background resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* All Day Toggle */}
        <FormField
          control={form.control}
          name="allDay"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">All Day Event</FormLabel>
                <FormDescription>
                  Event lasts the entire day
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Start Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            rules={{ required: 'Start date is required' }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date *</FormLabel>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start"
                    sideOffset={4}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setStartDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {!allDay && (
            <FormField
              control={form.control}
              name="startTime"
              rules={{ required: !allDay ? 'Start time is required' : false }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        {...field}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* End Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="endDate"
            rules={{ required: 'End date is required' }}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date *</FormLabel>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-auto p-0" 
                    align="start"
                    sideOffset={4}
                  >
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                        setEndDateOpen(false);
                      }}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {!allDay && (
            <FormField
              control={form.control}
              name="endTime"
              rules={{ required: !allDay ? 'End time is required' : false }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="time"
                        {...field}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Location */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Event location"
                    {...field}
                    className="pl-10 bg-background"
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="categoryId"
          rules={{ required: 'Category is required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Visibility */}
        <FormField
          control={form.control}
          name="visibility"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Visibility</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PUBLIC">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Public - Everyone can see
                    </div>
                  </SelectItem>
                  <SelectItem value="PRIVATE">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Private - Only you and attendees
                    </div>
                  </SelectItem>
                  <SelectItem value="TEAM_ONLY">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Team Only - Only team members
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Attendees */}
        <div className="space-y-3">
          <Label>Attendees (Optional)</Label>
          
          {/* Show loading state */}
          {usersLoading && (
            <div className="p-6 bg-muted/50 rounded-lg border border-border text-center space-y-2">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading users...</p>
            </div>
          )}

          {/* Show error state */}
          {!usersLoading && usersError && (
            <div className="p-6 bg-destructive/10 rounded-lg border border-destructive/20 text-center space-y-3">
              <p className="text-sm text-destructive font-medium">{usersError}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retryLoadUsers}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Show user list */}
          {!usersLoading && !usersError && availableUsers.length > 0 && (
            <div className="space-y-2">
              <div className="max-h-64 overflow-y-auto border border-border rounded-lg">
                {availableUsers
                  .filter(user => !selectedAttendees.some(a => a.id === user.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedAttendees(prev => [...prev, user]);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors border-b border-border last:border-b-0"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-sm">
                          {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                      </div>
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {availableUsers.filter(u => !selectedAttendees.some(a => a.id === u.id)).length} users available
              </p>
            </div>
          )}

          {/* Show no users message */}
          {!usersLoading && !usersError && availableUsers.length === 0 && (
            <div className="p-6 bg-muted/50 rounded-lg border border-border text-center space-y-3">
              <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No users available</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Check console (F12) for error details
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={retryLoadUsers}
              >
                Retry Loading Users
              </Button>
            </div>
          )}

          {/* Selected Attendees */}
          {selectedAttendees.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Attendees</Label>
              <div className="flex flex-wrap gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                {selectedAttendees.map((attendee) => (
                  <Badge
                    key={attendee.id}
                    variant="secondary"
                    className="pl-2 pr-1 py-1.5 flex items-center gap-2"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={attendee.avatarUrl} alt={attendee.name} />
                      <AvatarFallback className="text-[10px]">
                        {attendee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{attendee.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                      onClick={() => {
                        setSelectedAttendees(prev => prev.filter(a => a.id !== attendee.id));
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <FormDescription>
            {selectedAttendees.length > 0 
              ? `${selectedAttendees.length} attendee${selectedAttendees.length !== 1 ? 's' : ''} will be invited`
              : 'Click on users above to add them as attendees'}
          </FormDescription>
        </div>

        {/* Color */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Custom Color (Optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    {...field}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-background"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Override category color for this event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
