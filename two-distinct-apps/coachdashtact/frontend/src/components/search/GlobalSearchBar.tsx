'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

export function GlobalSearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { openSearch } = useSearchShortcut();

  // Detect OS for keyboard shortcut display
  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
      setQuery('');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        placeholder={`Search... (${shortcutKey}+K)`}
        className="pl-10 pr-16 bg-background border-border"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={openSearch}
        aria-label="Search dashboard"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">{shortcutKey}</span>K
      </kbd>
    </div>
  );
}
