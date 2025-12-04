'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CoachAvailabilityApi, BookingsApi } from '@/lib/api/coaching';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { AvailabilityModal } from '@/components/coaching/AvailabilityModal';
import { AvailabilityGrid } from '@/components/coaching/AvailabilityGrid';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { CoachAvailability } from '@/types/coaching';

const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export default function ManageAvailabilityPage() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<CoachAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<CoachAvailability | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [slotToDelete, setSlotToDelete] = useState<CoachAvailability | null>(null);
  const [slotUtilization, setSlotUtilization] = useState<Record<string, { booked: number; max: number }>>({});

  useEffect(() => {
    if (user?.id) {
      loadAvailability();
    }
  }, [user]);

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const data = await CoachAvailabilityApi.getMine();
      setAvailability(data);
      
      // Load utilization data for each slot
      await loadSlotUtilization(data);
    } catch (error) {
      console.error('Failed to load availability:', error);
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  const loadSlotUtilization = async (slots: CoachAvailability[]) => {
    if (!user?.id) return;

    try {
      // Get all bookings for the coach
      const bookings = await BookingsApi.getAll();
      
      // Calculate utilization for each slot
      const utilization: Record<string, { booked: number; max: number }> = {};
      
      slots.forEach(slot => {
        // Count bookings for this slot
        const slotBookings = bookings.filter(booking => {
          const bookingDate = new Date(booking.requestedDate);
          const bookingDay = bookingDate.getDay();
          return (
            booking.coachId === user.id &&
            bookingDay === slot.dayOfWeek &&
            booking.requestedTime >= slot.startTime &&
            booking.requestedTime < slot.endTime &&
            (booking.status === 'confirmed' || booking.status === 'pending')
          );
        });

        utilization[slot.id] = {
          booked: slotBookings.length,
          max: slot.maxSessionsPerSlot,
        };
      });

      setSlotUtilization(utilization);
    } catch (error) {
      console.error('Failed to load slot utilization:', error);
    }
  };

  const handleAddSlot = () => {
    setEditingSlot(null);
    setModalOpen(true);
  };

  const handleEditSlot = (slot: CoachAvailability) => {
    setEditingSlot(slot);
    setModalOpen(true);
  };

  const handleDeleteSlot = (slot: CoachAvailability) => {
    setSlotToDelete(slot);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!slotToDelete) return;

    try {
      await CoachAvailabilityApi.delete(slotToDelete.id);
      toast.success('Availability slot deleted successfully');
      await loadAvailability();
    } catch (error: any) {
      console.error('Failed to delete slot:', error);
      const message = error?.response?.data?.message || 'Failed to delete slot';
      toast.error(message);
    } finally {
      setDeleteDialogOpen(false);
      setSlotToDelete(null);
    }
  };

  const handleModalClose = async (success: boolean) => {
    setModalOpen(false);
    setEditingSlot(null);
    if (success) {
      await loadAvailability();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading availability...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumbs */}
      <PageHeader
        title="Manage Availability"
        description="Set your weekly schedule and capacity for coaching sessions"
        actions={
          <Button onClick={handleAddSlot}>
            <Plus className="h-4 w-4 mr-2" />
            Add Availability
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Slots</p>
              <p className="text-2xl font-bold">{availability.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Slots</p>
              <p className="text-2xl font-bold">
                {availability.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Max Capacity</p>
              <p className="text-2xl font-bold">
                {availability.reduce((sum, s) => sum + s.maxSessionsPerSlot, 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Availability Grid */}
      {availability.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No availability set</h3>
            <p className="text-muted-foreground mb-4">
              Add your first availability slot to start accepting bookings
            </p>
            <Button onClick={handleAddSlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </div>
        </Card>
      ) : (
        <AvailabilityGrid
          availability={availability}
          utilization={slotUtilization}
          onEdit={handleEditSlot}
          onDelete={handleDeleteSlot}
        />
      )}

      {/* Add/Edit Modal */}
      <AvailabilityModal
        open={modalOpen}
        slot={editingSlot}
        coachId={user?.id || ''}
        onClose={handleModalClose}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Availability Slot</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this availability slot?
              {slotToDelete && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="font-medium">
                    {DAYS_OF_WEEK[slotToDelete.dayOfWeek]}
                  </p>
                  <p className="text-sm">
                    {slotToDelete.startTime} - {slotToDelete.endTime}
                  </p>
                  {slotUtilization[slotToDelete.id]?.booked > 0 && (
                    <p className="text-sm text-destructive mt-2">
                      Warning: This slot has {slotUtilization[slotToDelete.id].booked} existing booking(s)
                    </p>
                  )}
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
