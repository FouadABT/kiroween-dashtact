'use client';

import { useState, useEffect } from 'react';
import { CronJob } from '@/types/cron-job';
import { CronJobsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleEditorProps {
  job: CronJob;
  onUpdate: (job: CronJob) => void;
}

export function ScheduleEditor({ job, onUpdate }: ScheduleEditorProps) {
  const [schedule, setSchedule] = useState(job.schedule);
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState<{
    valid: boolean;
    error?: string;
    nextExecutions?: string[];
  } | null>(null);

  // Validate on schedule change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (schedule && schedule !== job.schedule) {
        validateSchedule();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [schedule]);

  const validateSchedule = async () => {
    try {
      setValidating(true);
      const result = await CronJobsApi.validateSchedule(schedule);
      setValidation(result);
    } catch (err) {
      setValidation({
        valid: false,
        error: err instanceof Error ? err.message : 'Validation failed',
      });
    } finally {
      setValidating(false);
    }
  };

  const handleSave = async () => {
    if (!validation?.valid) {
      toast.error('Please enter a valid cron expression');
      return;
    }

    try {
      setSaving(true);
      const updatedJob = await CronJobsApi.updateSchedule(job.id, { schedule });
      onUpdate(updatedJob);
      toast.success('Schedule updated successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update schedule';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const formatNextExecution = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="schedule">Cron Expression</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="schedule"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)}
            placeholder="0 */6 * * *"
            className="font-mono text-sm"
          />
          {validating && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Format: minute hour day month weekday
        </p>
      </div>

      {/* Validation Result */}
      {validation && (
        <Alert variant={validation.valid ? 'default' : 'destructive'}>
          <div className="flex items-start gap-2">
            {validation.valid ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <AlertDescription>
              {validation.valid ? (
                <div>
                  <p className="font-medium mb-2">Valid cron expression</p>
                  {validation.nextExecutions && validation.nextExecutions.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1">Next 5 executions:</p>
                      <ul className="text-xs space-y-1">
                        {validation.nextExecutions.map((exec, index) => (
                          <li key={index}>{formatNextExecution(exec)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p>{validation.error || 'Invalid cron expression'}</p>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Common Examples */}
      <div>
        <p className="text-xs font-semibold mb-2">Common patterns:</p>
        <div className="grid grid-cols-1 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setSchedule('0 */6 * * *')}
            className="text-left hover:bg-accent px-2 py-1 rounded"
          >
            <code className="font-mono">0 */6 * * *</code> - Every 6 hours
          </button>
          <button
            type="button"
            onClick={() => setSchedule('0 0 * * *')}
            className="text-left hover:bg-accent px-2 py-1 rounded"
          >
            <code className="font-mono">0 0 * * *</code> - Daily at midnight
          </button>
          <button
            type="button"
            onClick={() => setSchedule('0 0 * * 0')}
            className="text-left hover:bg-accent px-2 py-1 rounded"
          >
            <code className="font-mono">0 0 * * 0</code> - Weekly on Sunday
          </button>
          <button
            type="button"
            onClick={() => setSchedule('0 0 1 * *')}
            className="text-left hover:bg-accent px-2 py-1 rounded"
          >
            <code className="font-mono">0 0 1 * *</code> - Monthly on 1st
          </button>
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={!validation?.valid || saving || schedule === job.schedule}
        className="w-full"
      >
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Save Schedule
          </>
        )}
      </Button>
    </div>
  );
}
