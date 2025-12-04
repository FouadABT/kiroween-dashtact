'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { CoachAvailabilityApi, BookingsApi, SessionsApi } from '@/lib/api/coaching';
import type { AvailableSlot, CreateBookingDto } from '@/types/coaching';
import { io, Socket } from 'socket.io-client';

interface BookSessionFormProps {
  memberId: string;
  coachId: string;
  onBookingComplete: () => void;
}

interface SlotWithStatus extends AvailableSlot {
  status: 'available' | 'full' | 'booked';
}

export function BookSessionForm({
  memberId,
  coachId,
  onBookingComplete,
}: BookSessionFormProps) {
  const [loading, setLoading] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [slots, setSlots] = useState<SlotWithStatus[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<SlotWithStatus | null>(null);
  const [duration, setDuration] = useState<number>(60);
  const [sessionType, setSessionType] = useState<'initial' | 'regular' | 'followup'>('regular');
  const [notes, setNotes] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [myBookings, setMyBookings] = useState<Set<string>>(new Set());

  // Initialize WebSocket connection
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const newSocket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      // Join coach's availability room
      newSocket.emit('join-coach-availability', coachId);
    });

    newSocket.on('slot-availability-updated', (data: { coachId: string; slot: AvailableSlot }) => {
      if (data.coachId === coachId) {
        console.log('Slot availability updated:', data.slot);
        loadAvailableSlots();
      }
    });

    newSocket.on('booking-created', (data: { coachId: string; slot: { date: string; time: string } }) => {
      if (data.coachId === coachId) {
        console.log('Booking created:', data.slot);
        loadAvailableSlots();
      }
    });

    newSocket.on('booking-cancelled', (data: { coachId: string; slot: { date: string; time: string } }) => {
      if (data.coachId === coachId) {
        console.log('Booking cancelled:', data.slot);
        loadAvailableSlots();
      }
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-coach-availability', coachId);
      newSocket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coachId]);

  // Load available slots when week changes
  useEffect(() => {
    loadAvailableSlots();
    loadMyBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeekStart, duration]);

  const loadAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const availableSlots = await CoachAvailabilityApi.getAvailableSlots(coachId, {
        startDate: currentWeekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0],
        duration,
      });

      // Add status to each slot
      const slotsWithStatus: SlotWithStatus[] = availableSlots.map(slot => {
        const slotKey = `${slot.date}_${slot.time}`;
        const isBooked = myBookings.has(slotKey);
        const isFull = slot.availableCapacity === 0;
        
        return {
          ...slot,
          status: isBooked ? 'booked' : isFull ? 'full' : 'available',
        };
      });

      setSlots(slotsWithStatus);
    } catch (error) {
      console.error('Failed to load slots:', error);
      toast.error('Failed to load available slots');
    } finally {
      setLoadingSlots(false);
    }
  };

  const loadMyBookings = async () => {
    try {
      const sessions = await SessionsApi.getUpcoming();
      const bookingKeys = new Set(
        sessions
          .filter(s => s.status === 'scheduled' && s.coachId === coachId)
          .map(s => {
            const date = new Date(s.scheduledAt);
            const dateStr = date.toISOString().split('T')[0];
            const timeStr = date.toTimeString().slice(0, 5);
            return `${dateStr}_${timeStr}`;
          })
      );
      setMyBookings(bookingKeys);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    }
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    
    // Don't allow going to past weeks
    const today = getWeekStart(new Date());
    if (newStart >= today) {
      setCurrentWeekStart(newStart);
    }
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  const handleSlotSelect = (slot: SlotWithStatus) => {
    if (slot.status === 'booked') {
      toast.info('You already have a session booked at this time');
      return;
    }
    if (slot.status === 'full') {
      toast.error('This slot is now full, please choose another');
      return;
    }
    setSelectedSlot(slot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedSlot) {
      toast.error('Please select a time slot');
      return;
    }

    if (notes && notes.length > 500) {
      toast.error('Notes must be less than 500 characters');
      return;
    }

    try {
      setLoading(true);

      const bookingData: CreateBookingDto = {
        memberId,
        coachId,
        requestedDate: selectedSlot.date,
        requestedTime: selectedSlot.time,
        duration,
        memberNotes: notes || undefined,
      };

      console.log('[BookSessionForm] Sending booking data:', bookingData);
      await BookingsApi.create(bookingData);

      toast.success('Session booked successfully!');
      
      // Notify via WebSocket
      if (socket) {
        socket.emit('booking-created', {
          coachId,
          slot: {
            date: selectedSlot.date,
            time: selectedSlot.time,
          },
        });
      }

      onBookingComplete();
    } catch (error) {
      console.error('Failed to book session:', error);
      
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('full')) {
        toast.error('This slot is now full, please choose another time');
        loadAvailableSlots(); // Refresh slots
      } else if (errorMessage.includes('capacity')) {
        toast.error('This slot has reached maximum capacity');
        loadAvailableSlots(); // Refresh slots
      } else {
        toast.error('Failed to book session. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSlotColor = (slot: SlotWithStatus) => {
    switch (slot.status) {
      case 'available':
        return 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white';
      case 'full':
        return 'bg-destructive cursor-not-allowed text-destructive-foreground opacity-60';
      case 'booked':
        return 'bg-muted cursor-not-allowed text-muted-foreground opacity-60';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getSlotBorder = (slot: SlotWithStatus) => {
    if (selectedSlot?.date === slot.date && selectedSlot?.time === slot.time) {
      return 'ring-2 ring-primary ring-offset-2';
    }
    return '';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const groupSlotsByDate = () => {
    const grouped: { [date: string]: SlotWithStatus[] } = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();
  const dates = Object.keys(groupedSlots).sort();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Session Settings */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="duration">Session Duration</Label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger id="duration">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 minutes</SelectItem>
              <SelectItem value="60">60 minutes</SelectItem>
              <SelectItem value="90">90 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Session Type</Label>
          <Select
            value={sessionType}
            onValueChange={(value: 'initial' | 'regular' | 'followup') => setSessionType(value)}
          >
            <SelectTrigger id="type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="initial">Initial Consultation</SelectItem>
              <SelectItem value="regular">Regular Session</SelectItem>
              <SelectItem value="followup">Follow-up Session</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between" role="navigation" aria-label="Week navigation">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePreviousWeek}
          disabled={currentWeekStart <= getWeekStart(new Date())}
          aria-label="Go to previous week"
        >
          <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
          Previous Week
        </Button>
        <span className="text-sm font-medium" aria-live="polite" aria-atomic="true">
          {currentWeekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleNextWeek}
          aria-label="Go to next week"
        >
          Next Week
          <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
        </Button>
      </div>

      {/* Calendar Grid */}
      {loadingSlots ? (
        <div className="flex items-center justify-center py-12" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <span className="sr-only">Loading available time slots</span>
        </div>
      ) : dates.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p className="text-muted-foreground">No available slots for this week</p>
          <p className="text-sm text-muted-foreground mt-2">Try selecting a different week or duration</p>
        </div>
      ) : (
        <div className="space-y-4" role="group" aria-label="Available time slots">
          {dates.map(date => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-medium text-foreground" id={`date-${date}`}>
                {formatDate(date)}
              </h3>
              <div 
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2"
                role="group"
                aria-labelledby={`date-${date}`}
              >
                {groupedSlots[date].map((slot, index) => (
                  <button
                    key={`${slot.date}_${slot.time}_${index}`}
                    type="button"
                    onClick={() => handleSlotSelect(slot)}
                    disabled={slot.status === 'full' || slot.status === 'booked'}
                    aria-label={`${formatTime(slot.time)} on ${formatDate(slot.date)}${
                      slot.status === 'available' 
                        ? `, ${slot.availableCapacity} of ${slot.maxCapacity} spots available` 
                        : slot.status === 'full' 
                        ? ', fully booked' 
                        : ', already booked by you'
                    }`}
                    aria-pressed={selectedSlot?.date === slot.date && selectedSlot?.time === slot.time}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition-all
                      focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                      ${getSlotColor(slot)}
                      ${getSlotBorder(slot)}
                    `}
                  >
                    <div>{formatTime(slot.time)}</div>
                    {slot.status === 'available' && (
                      <div className="text-xs opacity-90" aria-hidden="true">
                        {slot.availableCapacity}/{slot.maxCapacity}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected Slot Info */}
      {selectedSlot && (
        <div 
          className="p-4 rounded-lg bg-primary/10 border border-primary/20" 
          role="status" 
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm font-medium text-foreground">Selected Time Slot</p>
          <p className="text-lg font-semibold text-primary">
            {formatDate(selectedSlot.date)} at {formatTime(selectedSlot.time)}
          </p>
          <p className="text-sm text-muted-foreground">
            Duration: {duration} minutes • Type: {sessionType}
          </p>
        </div>
      )}

      {/* Notes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <span className={`text-xs ${notes.length > 500 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {notes.length}/500
          </span>
        </div>
        <Textarea
          id="notes"
          placeholder="Add any notes or topics you'd like to discuss..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          aria-describedby="notes-hint"
        />
        {notes.length > 450 && (
          <p id="notes-hint" className="text-xs text-muted-foreground">
            {500 - notes.length} characters remaining
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        disabled={!selectedSlot || loading}
        aria-label={loading ? 'Booking session in progress' : 'Book selected session'}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
            Booking Session...
          </>
        ) : (
          'Book Session'
        )}
      </Button>
    </form>
  );
}

// Helper function to get the start of the week (Sunday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
}
