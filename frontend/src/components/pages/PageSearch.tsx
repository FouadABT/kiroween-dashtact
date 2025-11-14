'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageSearchProps {
  onSearchChange: (search: string) => void;
}

export function PageSearch({ onSearchChange }: PageSearchProps) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, onSearchChange]);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search pages by title or slug..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9 pr-9"
      />
      {search && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
          onClick={() => setSearch('')}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
