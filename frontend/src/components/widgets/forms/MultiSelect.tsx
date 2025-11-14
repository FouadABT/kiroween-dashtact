'use client';

import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { BaseWidgetProps } from '../types/widget.types';

/**
 * Multi-select option
 */
export interface MultiSelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

/**
 * MultiSelect Props
 */
export interface MultiSelectProps extends BaseWidgetProps {
  /** Available options */
  options: MultiSelectOption[];
  /** Selected values */
  value?: string[];
  /** Change handler */
  onChange?: (values: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Empty state text */
  emptyText?: string;
  /** Show selected count badge */
  showCount?: boolean;
  /** Show select all / clear all */
  showSelectAll?: boolean;
  /** Maximum selections allowed */
  maxSelections?: number;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * MultiSelect Component
 * 
 * Multi-select dropdown with:
 * - Searchable multi-option selection
 * - shadcn/ui Select and Checkbox
 * - Selected count badge
 * - "Select all" / "Clear all" options
 * 
 * Requirements: 1.1, 13.3
 * 
 * @example
 * ```tsx
 * const [selected, setSelected] = useState<string[]>([]);
 * 
 * <MultiSelect
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   showCount
 *   showSelectAll
 * />
 * ```
 */
export function MultiSelect({
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  emptyText = 'No options found',
  showCount = true,
  showSelectAll = true,
  maxSelections,
  disabled = false,
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOptions = options.filter((option) => value.includes(option.value));
  const isMaxReached = maxSelections ? value.length >= maxSelections : false;

  const handleSelect = (optionValue: string) => {
    if (disabled) return;

    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : isMaxReached
      ? value
      : [...value, optionValue];

    onChange?.(newValue);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    const allValues = options.filter((opt) => !opt.disabled).map((opt) => opt.value);
    onChange?.(allValues);
  };

  const handleClearAll = () => {
    if (disabled) return;
    onChange?.([]);
  };

  const handleRemove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(value.filter((v) => v !== optionValue));
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value.length && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <div className="flex gap-1 flex-wrap">
            {value.length === 0 ? (
              <span>{placeholder}</span>
            ) : showCount ? (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                {value.length} selected
              </Badge>
            ) : (
              selectedOptions.slice(0, 2).map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {option.label}
                  <button
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRemove(option.value, e as unknown as React.MouseEvent);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => handleRemove(option.value, e)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))
            )}
            {!showCount && selectedOptions.length > 2 && (
              <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                +{selectedOptions.length - 2} more
              </Badge>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {showSelectAll && (
                <>
                  <CommandItem
                    onSelect={handleSelectAll}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox
                        checked={value.length === options.filter((opt) => !opt.disabled).length}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="font-medium">Select All</span>
                    </div>
                  </CommandItem>
                  <CommandItem
                    onSelect={handleClearAll}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox checked={false} onCheckedChange={handleClearAll} />
                      <span className="font-medium">Clear All</span>
                    </div>
                  </CommandItem>
                  <div className="border-t my-1" />
                </>
              )}
              {filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                const isDisabled = option.disabled || (isMaxReached && !isSelected);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    disabled={isDisabled}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleSelect(option.value)}
                        disabled={isDisabled}
                      />
                      <span className={cn(isDisabled && 'text-muted-foreground')}>
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check className="ml-auto h-4 w-4" />
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
