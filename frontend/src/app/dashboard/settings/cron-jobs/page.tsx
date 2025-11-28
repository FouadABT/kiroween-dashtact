import { Metadata } from 'next';
import { CronJobsClient } from '@/components/admin/cron-jobs/CronJobsClient';

export const metadata: Metadata = {
  title: 'Cron Jobs Management',
  description: 'Monitor and manage scheduled tasks',
};

export default function CronJobsPage() {
  return <CronJobsClient />;
}
