'use client';

import React, { useState } from 'react';
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { BaseWidgetProps } from '../types/widget.types';

/**
 * Date range preset
 */
export interface DateRangePreset {
  label: string;
  range: DateRange;
}

/**
 * DateRangePicker Props
 */
export interface DateRangePickerProps extends BaseWidgetProps {
  /** Selected date range */
  value?: DateRange;
  /** Change handler */
  onChange?: (range: DateRange | undefined) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show preset ranges */
  showPresets?: boolean;
  /** Custom presets */
  presets?: DateRangePreset[];
  /** Disabled dates */
  disabled?: (date: Date) => boolean;
  /** Minimum date */
  fromDate?: Date;
  /** Maximum date */
  toDate?: Date;
}

/**
 * Default date range presets
 */
const defaultPresets: DateRangePreset[] = [
  {
    label: 'Today',
    range: {
      from: new Date(),
      to: new Date(),
    },
  },
  {
    label: 'Last 7 days',
    range: {
      from: subDays(new Date(), 6),
      to: new Date(),
    },
  },
  {
    label: 'Last 30 days',
    range: {
      from: subDays(new Date(), 29),
      to: new Date(),
    },
  },
  {
    label: 'This month',
    range: {
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    },
  },
  {
    label: 'Last month',
    range: {
      from: startOfMonth(subDays(new Date(), 30)),
      to: endOfMonth(subDays(new Date(), 30)),
    },
  },
  {
    label: 'This year',
    range: {
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    },
  },
];

/**
 * DateRangePicker Component
 * 
 * Date range picker with:
 * - react-day-picker for date selection
 * - Preset ranges (today, last 7 days, last 30 days, etc.)
 * - shadcn/ui Calendar and Popover
 * - date-fns for formatting
 * 
 * Requirements: 1.1, 13.2
 * 
 * @example
 * ```tsx
 * const [dateRange, setDateRange] = useState<DateRange>();
 * 
 * <DateRangePicker
 *   value={dateRange}
 *   onChange={setDateRange}
 *   showPresets
 * />
 * ```
 */
export function DateRangePicker({
  value,
  onChange,
  placeholder = 'Pick a date range',
  showPresets = true,
  presets = defaultPresets,
  disabled,
  fromDate,
  toDate,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const handlePresetClick = (preset: DateRangePreset) => {
    onChange?.(preset.range);
    setOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range) return placeholder;
    if (!range.from) return placeholder;
    if (!range.to) return format(range.from, 'LLL dd, y');
    return `${format(range.from, 'LLL dd, y')} - ${format(range.to, 'LLL dd, y')}`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange(value)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          {showPresets && (
            <div className="border-r border-border">
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium mb-2">Presets</p>
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start font-normal"
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
          <div className="p-3">
            <Calendar
              mode="range"
              selected={value}
              onSelect={onChange}
              disabled={disabled}
              fromDate={fromDate}
              toDate={toDate}
              numberOfMonths={2}
              defaultMonth={value?.from}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
