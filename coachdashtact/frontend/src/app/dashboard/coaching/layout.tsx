import { Metadata } from 'next';
import { CoachingNav } from '@/components/coaching/CoachingNav';

export const metadata: Metadata = {
  title: 'Coaching Dashboard',
  description: 'Manage your coaching sessions and members',
};

export default function CoachingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <div className="border-b border-border" role="navigation" aria-label="Coaching section navigation">
        <div className="px-4 sm:px-6">
          <CoachingNav />
        </div>
      </div>
      <main className="px-4 sm:px-6" id="main-content" role="main">{children}</main>
    </div>
  );
}
