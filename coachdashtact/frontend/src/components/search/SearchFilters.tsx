'use client';

/**
 * SearchFilters Component
 * Entity type filtering and sorting controls for search results
 */

'use client';

import { Users, Package, FileText, File, UserCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SearchFiltersProps {
  activeType: string;
  sortBy: 'relevance' | 'date' | 'name';
  onTypeChange: (type: string) => void;
  onSortChange: (sortBy: 'relevance' | 'date' | 'name') => void;
}

const entityTypes = [
  { value: 'all', label: 'All', icon: null },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'products', label: 'Products', icon: Package },
  { value: 'posts', label: 'Posts', icon: FileText },
  { value: 'pages', label: 'Pages', icon: File },
  { value: 'customers', label: 'Customers', icon: UserCircle },
  { value: 'orders', label: 'Orders', icon: ShoppingCart },
];

export function SearchFilters({
  activeType,
  sortBy,
  onTypeChange,
  onSortChange,
}: SearchFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* Entity Type Filters */}
      <div className="flex flex-wrap gap-2">
        {entityTypes.map((type) => {
          const Icon = type.icon;
          const isActive = activeType === type.value;
          
          return (
            <Button
              key={type.value}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => onTypeChange(type.value)}
              className={cn(
                'transition-colors',
                isActive && 'bg-primary text-primary-foreground'
              )}
              aria-pressed={isActive}
            >
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Sort by:
        </span>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Relevance</SelectItem>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

