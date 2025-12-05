'use client';

import { useState, useEffect } from 'react';
import { CronJob } from '@/types/cron-job';
import { CronJobsApi } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { PageHeader } from '@/components/layout/PageHeader';
import { CronJobsList } from './CronJobsList';
import { CronJobDetails } from './CronJobDetails';
import { Loader2 } from 'lucide-react';

export function CronJobsClient() {
  const [jobs, setJobs] = useState<CronJob[]>([]);
  const [selectedJob, setSelectedJob] = useState<CronJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs on mount
  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await CronJobsApi.getAll();
      setJobs(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load cron jobs';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleJobUpdate = (updatedJob: CronJob) => {
    setJobs((prev) => prev.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
    if (selectedJob?.id === updatedJob.id) {
      setSelectedJob(updatedJob);
    }
  };

  const handleSelectJob = (job: CronJob) => {
    setSelectedJob(job);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <PageHeader
          title="Cron Jobs Management"
          description="Monitor and manage scheduled tasks"
          breadcrumbProps={{}}
        />
        <div className="mt-6 p-4 bg-destructive/10 text-destructive rounded-lg">
          <p className="font-semibold">Error loading cron jobs</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PageHeader
        title="Cron Jobs Management"
        description="Monitor and manage scheduled tasks"
        breadcrumbProps={{}}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CronJobsList
            jobs={jobs}
            selectedJob={selectedJob}
            onSelectJob={handleSelectJob}
            onJobUpdate={handleJobUpdate}
          />
        </div>
        <div>
          {selectedJob ? (
            <CronJobDetails job={selectedJob} onUpdate={handleJobUpdate} />
          ) : (
            <div className="bg-card text-card-foreground border border-border rounded-lg p-6 text-center text-muted-foreground">
              Select a job to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
