'use client';

import { 
  User, 
  Package, 
  FileText, 
  File, 
  Users, 
  ShoppingCart,
  type LucideIcon 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/types/search';

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
  isSelected?: boolean;
  highlightQuery?: string;
}

const entityTypeConfig: Record<
  string,
  { icon: LucideIcon; label: string; color: string }
> = {
  users: { icon: User, label: 'User', color: 'bg-blue-500/10 text-blue-500' },
  products: { icon: Package, label: 'Product', color: 'bg-green-500/10 text-green-500' },
  posts: { icon: FileText, label: 'Blog Post', color: 'bg-purple-500/10 text-purple-500' },
  pages: { icon: File, label: 'Page', color: 'bg-orange-500/10 text-orange-500' },
  customers: { icon: Users, label: 'Customer', color: 'bg-cyan-500/10 text-cyan-500' },
  orders: { icon: ShoppingCart, label: 'Order', color: 'bg-pink-500/10 text-pink-500' },
};

function highlightText(text: string, query: string): React.ReactNode {
  if (!query || !text) return text;

  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900/50 text-foreground">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function truncateText(text: string, maxLength: number = 150): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function SearchResultItem({
  result,
  onClick,
  isSelected = false,
  highlightQuery = '',
}: SearchResultItemProps) {
  const config = entityTypeConfig[result.entityType] || {
    icon: File,
    label: result.entityType,
    color: 'bg-gray-500/10 text-gray-500',
  };

  const Icon = config.icon;
  const truncatedDescription = truncateText(result.description);

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg border transition-colors
        ${
          isSelected
            ? 'bg-accent border-primary'
            : 'bg-card border-border hover:bg-accent'
        }
        focus:outline-none focus:ring-2 focus:ring-primary
      `}
      role="option"
      aria-selected={isSelected}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-md ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary" className="text-xs">
              {config.label}
            </Badge>
          </div>
          
          <h3 className="font-medium text-foreground mb-1 truncate">
            {highlightText(result.title, highlightQuery)}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {highlightText(truncatedDescription, highlightQuery)}
          </p>
          
          {result.metadata && (
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {result.metadata.date && (
                <span>
                  {new Date(result.metadata.date).toLocaleDateString()}
                </span>
              )}
              {result.metadata.author && (
                <span>by {result.metadata.author}</span>
              )}
              {result.metadata.status && (
                <Badge variant="outline" className="text-xs">
                  {result.metadata.status}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
