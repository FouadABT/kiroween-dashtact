'use client';

import React, { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { Input } from '@/components/ui/input';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchSuggestion {
  id: string;
  label: string;
  value: string;
  metadata?: Record<string, unknown>;
}

export interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  debounceMs?: number;
  className?: string;
  inputClassName?: string;
}

export function SearchBar({
  placeholder = 'Search...',
  onSearch,
  suggestions = [],
  showSuggestions = false,
  debounceMs = 300,
  className,
  inputClassName,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Debounced search callback
  const debouncedSearch = useDebouncedCallback((value: string) => {
    onSearch(value);
  }, debounceMs);

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
    
    // Show suggestions if enabled and query is not empty
    if (showSuggestions && value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    onSearch(suggestion.value);
    setIsOpen(false);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    onSearch('');
    setIsOpen(false);
  };

  // Filter suggestions based on query
  const filteredSuggestions = suggestions.filter((suggestion) =>
    suggestion.label.toLowerCase().includes(query.toLowerCase())
  );

  // Simple search bar without suggestions
  if (!showSuggestions) {
    return (
      <div className={cn('relative', className)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className={cn('pl-9 pr-9', inputClassName)}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  // Search bar with suggestions dropdown
  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (query.trim() && filteredSuggestions.length > 0) {
                  setIsOpen(true);
                }
              }}
              className={cn('pl-9 pr-9', inputClassName)}
            />
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder={placeholder}
              value={query}
              onValueChange={handleInputChange}
              className="hidden"
            />
            <CommandList>
              {filteredSuggestions.length === 0 ? (
                <CommandEmpty>No results found.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filteredSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.id}
                      value={suggestion.value}
                      onSelect={() => handleSuggestionSelect(suggestion)}
                      className="cursor-pointer"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      <span>{suggestion.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
