'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface CustomerSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function CustomerSearch({ value, onChange }: CustomerSearchProps) {
  const [searchValue, setSearchValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(searchValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, onChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search customers by name, email, or phone..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className="pl-10"
      />
    </div>
  );
}
