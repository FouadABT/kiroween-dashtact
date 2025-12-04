'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CoachingNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard/coaching', label: 'Dashboard' },
    { href: '/dashboard/coaching/members', label: 'Members' },
    { href: '/dashboard/coaching/sessions', label: 'Sessions' },
    { href: '/dashboard/coaching/availability', label: 'Availability' },
  ];

  return (
    <nav className="flex gap-2 sm:gap-4 lg:gap-6 overflow-x-auto" aria-label="Coaching navigation">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`
              py-3 sm:py-4 border-b-2 transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm
              ${
                isActive
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }
            `}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
