'use client';

import { useState } from 'react';
import { CronJob } from '@/types/cron-job';
import { CronJobsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Play, Power, PowerOff, Loader2 } from 'lucide-react';

interface JobControlsProps {
  job: CronJob;
  onUpdate: (job: CronJob) => void;
}

export function JobControls({ job, onUpdate }: JobControlsProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleEnable = async () => {
    try {
      setLoading('enable');
      const updatedJob = await CronJobsApi.enable(job.id);
      onUpdate(updatedJob);
      toast.success('Job enabled successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable job';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading('disable');
      const updatedJob = await CronJobsApi.disable(job.id);
      onUpdate(updatedJob);
      toast.success('Job disabled successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable job';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  const handleTrigger = async () => {
    try {
      setLoading('trigger');
      await CronJobsApi.trigger(job.id);
      toast.success('Job triggered successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to trigger job';
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">Controls</h3>
      <div className="flex flex-wrap gap-2">
        {job.isEnabled ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisable}
            disabled={loading !== null}
          >
            {loading === 'disable' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <PowerOff className="h-4 w-4 mr-2" />
            )}
            Disable
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleEnable}
            disabled={loading !== null}
          >
            {loading === 'enable' ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Power className="h-4 w-4 mr-2" />
            )}
            Enable
          </Button>
        )}

        <Button
          variant="default"
          size="sm"
          onClick={handleTrigger}
          disabled={loading !== null || !job.isEnabled}
        >
          {loading === 'trigger' ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Now
        </Button>
      </div>
      {!job.isEnabled && (
        <p className="text-xs text-muted-foreground mt-2">
          Enable the job to run it manually
        </p>
      )}
    </div>
  );
}
