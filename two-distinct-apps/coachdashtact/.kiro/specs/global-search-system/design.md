# Global Search System - Design Document

## Overview

The Global Search System provides a unified, permission-aware search experience across all major entity types in the dashboard. The design emphasizes extensibility, security, and performance while maintaining a clean separation between search infrastructure and entity-specific implementations.

### Key Design Principles

1. **Extensibility**: New entity types can be added by implementing a simple interface
2. **Security First**: All searches respect RBAC permissions and include rate limiting
3. **Performance**: Debouncing, caching, and pagination ensure responsive search
4. **User Experience**: Keyboard shortcuts, real-time results, and clear feedback
5. **Separation of Concerns**: Search infrastructure is decoupled from entity logic

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
├─────────────────────────────────────────────────────────────┤
│  GlobalSearchBar (Header)  →  SearchDialog (Cmd+K)          │
│                               ↓                              │
│                    SearchResultsPage (/search)               │
└─────────────────────────────────────────────────────────────┘
                              ↓ HTTP
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
├─────────────────────────────────────────────────────────────┤
│  GET /search?q=query&type=all&page=1&limit=20               │
│  GET /search/quick?q=query                                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Search Module (NestJS)                  │
├─────────────────────────────────────────────────────────────┤
│  SearchController  →  SearchService  →  SearchRegistry       │
│                              ↓                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Search Provider Implementations            │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  UsersSearchProvider                                 │   │
│  │  ProductsSearchProvider                              │   │
│  │  BlogPostsSearchProvider                             │   │
│  │  PagesSearchProvider                                 │   │
│  │  CustomersSearchProvider                             │   │
│  │  OrdersSearchProvider                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database Layer (Prisma)                   │
├─────────────────────────────────────────────────────────────┤
│  User, Product, BlogPost, Page, Customer, Order models       │
└─────────────────────────────────────────────────────────────┘
```

### Module Structure

```
backend/src/search/
├── search.module.ts                    # Main module with provider registration
├── search.controller.ts                # API endpoints
├── search.service.ts                   # Core search orchestration
├── search-registry.service.ts          # Provider registry and coordination
├── dto/
│   ├── search-query.dto.ts            # Request validation
│   ├── search-result.dto.ts           # Response format
│   └── quick-search-query.dto.ts      # Quick search request
├── interfaces/
│   ├── searchable.interface.ts        # Contract for search providers
│   └── search-result.interface.ts     # Result structure
├── providers/
│   ├── users-search.provider.ts       # User search implementation
│   ├── products-search.provider.ts    # Product search implementation
│   ├── blog-posts-search.provider.ts  # Blog post search implementation
│   ├── pages-search.provider.ts       # Page search implementation
│   ├── customers-search.provider.ts   # Customer search implementation
│   └── orders-search.provider.ts      # Order search implementation
└── guards/
    └── search-rate-limit.guard.ts     # Rate limiting guard

frontend/src/
├── components/search/
│   ├── GlobalSearchBar.tsx            # Header search input
│   ├── SearchDialog.tsx               # Cmd+K modal
│   ├── SearchResultsList.tsx          # Results display
│   ├── SearchResultItem.tsx           # Individual result card
│   ├── SearchFilters.tsx              # Entity type filters
│   └── SearchEmptyState.tsx           # No results message
├── app/search/
│   └── page.tsx                       # Full search results page
├── hooks/
│   ├── useSearch.ts                   # Search logic and state
│   ├── useSearchShortcut.ts           # Keyboard shortcut handler
│   └── useSearchHistory.ts            # Recent searches (optional)
├── lib/api/
│   └── search.ts                      # API client methods
└── types/
    └── search.ts                      # TypeScript interfaces
```

## Components and Interfaces

### Backend Components

#### 1. Searchable Interface

The core contract that all search providers must implement:

```typescript
export interface ISearchable {
  // Entity type identifier (e.g., 'users', 'products')
  getEntityType(): string;
  
  // Permission required to search this entity type
  getRequiredPermission(): string;
  
  // Execute search with user context and query
  search(
    userId: string,
    query: string,
    options: SearchOptions
  ): Promise<SearchResultItem[]>;
  
  // Get total count for pagination
  count(userId: string, query: string): Promise<number>;
  
  // Format entity data into search result
  formatResult(entity: any): SearchResultItem;
  
  // Get URL to entity detail page
  getEntityUrl(entityId: string): string;
}

export interface SearchOptions {
  page?: number;
  limit?: number;
  sortBy?: 'relevance' | 'date' | 'name';
}

export interface SearchResultItem {
  id: string;
  entityType: string;
  title: string;
  description: string;
  url: string;
  metadata: {
    date?: Date;
    author?: string;
    status?: string;
    [key: string]: any;
  };
  relevanceScore: number;
}
```

#### 2. SearchService

Orchestrates search across all providers:

```typescript
@Injectable()
export class SearchService {
  constructor(
    private searchRegistry: SearchRegistryService,
    private permissionsService: PermissionsService,
    private auditService: AuditLoggingService,
  ) {}

  async search(
    userId: string,
    query: SearchQueryDto,
  ): Promise<PaginatedSearchResult> {
    // 1. Validate query
    // 2. Get applicable providers based on type filter
    // 3. Check permissions for each provider
    // 4. Execute search in parallel
    // 5. Merge and sort results
    // 6. Apply pagination
    // 7. Log sensitive searches
    // 8. Return formatted results
  }

  async quickSearch(
    userId: string,
    query: string,
  ): Promise<SearchResultItem[]> {
    // 1. Execute search across all providers
    // 2. Return top 8 results
    // 3. No pagination
  }
}
```

#### 3. SearchRegistryService

Manages all search providers:

```typescript
@Injectable()
export class SearchRegistryService {
  private providers: Map<string, ISearchable> = new Map();

  registerProvider(provider: ISearchable): void {
    this.providers.set(provider.getEntityType(), provider);
  }

  getProvider(entityType: string): ISearchable | undefined {
    return this.providers.get(entityType);
  }

  getAllProviders(): ISearchable[] {
    return Array.from(this.providers.values());
  }

  getProvidersByTypes(types: string[]): ISearchable[] {
    return types
      .map(type => this.providers.get(type))
      .filter(provider => provider !== undefined);
  }
}
```

#### 4. Example Search Provider (Users)

```typescript
@Injectable()
export class UsersSearchProvider implements ISearchable {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  getEntityType(): string {
    return 'users';
  }

  getRequiredPermission(): string {
    return 'users:read';
  }

  async search(
    userId: string,
    query: string,
    options: SearchOptions,
  ): Promise<SearchResultItem[]> {
    // 1. Get user's role and permissions
    const user = await this.usersService.findOne(userId);
    
    // 2. Build query based on role
    const whereClause = this.buildWhereClause(user, query);
    
    // 3. Execute search with pagination
    const users = await this.prisma.user.findMany({
      where: whereClause,
      skip: (options.page - 1) * options.limit,
      take: options.limit,
      orderBy: this.getOrderBy(options.sortBy),
    });
    
    // 4. Format results
    return users.map(u => this.formatResult(u));
  }

  async count(userId: string, query: string): Promise<number> {
    const user = await this.usersService.findOne(userId);
    const whereClause = this.buildWhereClause(user, query);
    return this.prisma.user.count({ where: whereClause });
  }

  formatResult(user: any): SearchResultItem {
    return {
      id: user.id,
      entityType: 'users',
      title: user.name || user.email,
      description: `${user.email} • ${user.role}`,
      url: `/dashboard/users/${user.id}`,
      metadata: {
        date: user.createdAt,
        status: user.isActive ? 'Active' : 'Inactive',
        role: user.role,
      },
      relevanceScore: this.calculateRelevance(user, query),
    };
  }

  getEntityUrl(entityId: string): string {
    return `/dashboard/users/${entityId}`;
  }

  private buildWhereClause(user: any, query: string): any {
    const baseWhere = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };

    // Apply role-based filtering
    if (user.role === 'USER') {
      return { ...baseWhere, id: user.id };
    } else if (user.role === 'MANAGER') {
      return { ...baseWhere, teamId: user.teamId };
    }
    // Admin sees all
    return baseWhere;
  }

  private calculateRelevance(user: any, query: string): number {
    // Simple relevance scoring
    let score = 0;
    const lowerQuery = query.toLowerCase();
    
    if (user.name?.toLowerCase() === lowerQuery) score += 100;
    else if (user.name?.toLowerCase().startsWith(lowerQuery)) score += 50;
    else if (user.name?.toLowerCase().includes(lowerQuery)) score += 25;
    
    if (user.email?.toLowerCase() === lowerQuery) score += 100;
    else if (user.email?.toLowerCase().startsWith(lowerQuery)) score += 50;
    
    return score;
  }

  private getOrderBy(sortBy: string): any {
    switch (sortBy) {
      case 'date': return { createdAt: 'desc' };
      case 'name': return { name: 'asc' };
      default: return {}; // Relevance handled by scoring
    }
  }
}
```

### Frontend Components

#### 1. GlobalSearchBar Component

```typescript
'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchShortcut } from '@/hooks/useSearchShortcut';

export function GlobalSearchBar() {
  const { openSearch } = useSearchShortcut();

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search... (Cmd+K)"
        className="pl-10 pr-4"
        onClick={openSearch}
        readOnly
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
        <span className="text-xs">⌘</span>K
      </kbd>
    </div>
  );
}
```

#### 2. SearchDialog Component

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useSearch } from '@/hooks/useSearch';
import { SearchResultsList } from './SearchResultsList';
import { SearchEmptyState } from './SearchEmptyState';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { results, isLoading, error } = useSearch(query, { quick: true });

  const handleResultClick = (url: string) => {
    router.push(url);
    onOpenChange(false);
  };

  const handleViewAll = () => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        
        <Input
          type="text"
          placeholder="Start typing to search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="mb-4"
        />

        {isLoading && <div>Searching...</div>}
        
        {error && (
          <div className="text-destructive">
            Search failed. Please try again.
          </div>
        )}

        {!isLoading && !error && query && (
          <>
            {results.length > 0 ? (
              <>
                <SearchResultsList
                  results={results}
                  onResultClick={handleResultClick}
                  highlightQuery={query}
                />
                <button
                  onClick={handleViewAll}
                  className="mt-4 text-sm text-primary hover:underline"
                >
                  View all results →
                </button>
              </>
            ) : (
              <SearchEmptyState query={query} />
            )}
          </>
        )}

        {!query && (
          <div className="text-muted-foreground text-sm">
            Start typing to search...
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

#### 3. useSearch Hook

```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchApi } from '@/lib/api/search';
import type { SearchResult } from '@/types/search';

interface UseSearchOptions {
  quick?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export function useSearch(query: string, options: UseSearchOptions = {}) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    const executeSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (options.quick) {
          const data = await searchApi.quickSearch(debouncedQuery);
          setResults(data);
          setTotalCount(data.length);
        } else {
          const data = await searchApi.search({
            q: debouncedQuery,
            type: options.type,
            page: options.page,
            limit: options.limit,
          });
          setResults(data.results);
          setTotalCount(data.total);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    executeSearch();
  }, [debouncedQuery, options.quick, options.type, options.page, options.limit]);

  return { results, isLoading, error, totalCount };
}
```

#### 4. useSearchShortcut Hook

```typescript
import { useEffect, useState } from 'react';

export function useSearchShortcut() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    openSearch: () => setIsOpen(true),
    closeSearch: () => setIsOpen(false),
  };
}
```

## Data Models

### DTOs

#### SearchQueryDto

```typescript
import { IsString, IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchQueryDto {
  @IsString()
  @MaxLength(200)
  q: string;

  @IsOptional()
  @IsIn(['all', 'users', 'products', 'posts', 'pages', 'customers', 'orders'])
  type?: string = 'all';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsIn(['relevance', 'date', 'name'])
  sortBy?: string = 'relevance';
}
```

#### SearchResultDto

```typescript
export class SearchResultDto {
  id: string;
  entityType: string;
  title: string;
  description: string;
  url: string;
  metadata: Record<string, any>;
  relevanceScore: number;
}

export class PaginatedSearchResultDto {
  results: SearchResultDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### TypeScript Interfaces (Frontend)

```typescript
export interface SearchResult {
  id: string;
  entityType: 'users' | 'products' | 'posts' | 'pages' | 'customers' | 'orders';
  title: string;
  description: string;
  url: string;
  metadata: {
    date?: string;
    author?: string;
    status?: string;
    [key: string]: any;
  };
  relevanceScore: number;
}

export interface PaginatedSearchResults {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchFilters {
  type: string;
  sortBy: 'relevance' | 'date' | 'name';
}
```

## Error Handling

### Backend Error Handling

```typescript
// Custom exceptions
export class SearchRateLimitException extends HttpException {
  constructor() {
    super('Search rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
  }
}

export class InvalidSearchQueryException extends BadRequestException {
  constructor(message: string) {
    super(`Invalid search query: ${message}`);
  }
}

// Error handling in SearchService
async search(userId: string, query: SearchQueryDto) {
  try {
    // Validate query
    if (!query.q || query.q.trim().length === 0) {
      throw new InvalidSearchQueryException('Query cannot be empty');
    }

    if (query.q.length > 200) {
      throw new InvalidSearchQueryException('Query too long (max 200 characters)');
    }

    // Execute search
    const results = await this.executeSearch(userId, query);
    return results;
  } catch (error) {
    if (error instanceof HttpException) {
      throw error;
    }
    
    this.logger.error(`Search failed for user ${userId}:`, error);
    throw new InternalServerErrorException('Search failed');
  }
}
```

### Frontend Error Handling

```typescript
// In useSearch hook
try {
  const data = await searchApi.search(params);
  setResults(data.results);
} catch (err) {
  if (err.response?.status === 429) {
    setError('Too many searches. Please wait a moment.');
  } else if (err.response?.status === 400) {
    setError('Invalid search query.');
  } else {
    setError('Search failed. Please try again.');
  }
}
```

## Testing Strategy

### Backend Tests

#### Unit Tests

```typescript
describe('SearchService', () => {
  it('should search across all providers', async () => {
    // Test multi-provider search
  });

  it('should filter results by entity type', async () => {
    // Test type filtering
  });

  it('should respect user permissions', async () => {
    // Test permission filtering
  });

  it('should paginate results correctly', async () => {
    // Test pagination
  });

  it('should handle empty queries', async () => {
    // Test validation
  });
});

describe('UsersSearchProvider', () => {
  it('should search users by name', async () => {
    // Test name search
  });

  it('should search users by email', async () => {
    // Test email search
  });

  it('should filter by user role', async () => {
    // Test role-based filtering
  });

  it('should calculate relevance scores', async () => {
    // Test scoring
  });
});
```

#### E2E Tests

```typescript
describe('Search API (e2e)', () => {
  it('/search (GET) should return results', () => {
    return request(app.getHttpServer())
      .get('/search?q=test')
      .expect(200)
      .expect((res) => {
        expect(res.body.results).toBeDefined();
        expect(res.body.total).toBeGreaterThanOrEqual(0);
      });
  });

  it('/search/quick (GET) should return top 8 results', () => {
    return request(app.getHttpServer())
      .get('/search/quick?q=test')
      .expect(200)
      .expect((res) => {
        expect(res.body.length).toBeLessThanOrEqual(8);
      });
  });

  it('/search (GET) should enforce rate limiting', async () => {
    // Make 101 requests
    for (let i = 0; i < 101; i++) {
      const response = await request(app.getHttpServer())
        .get('/search?q=test');
      
      if (i < 100) {
        expect(response.status).toBe(200);
      } else {
        expect(response.status).toBe(429);
      }
    }
  });

  it('/search (GET) should respect permissions', () => {
    // Test with different user roles
  });
});
```

### Frontend Tests

```typescript
describe('SearchDialog', () => {
  it('should open on Cmd+K', () => {
    // Test keyboard shortcut
  });

  it('should debounce search input', () => {
    // Test debouncing
  });

  it('should display results', () => {
    // Test result display
  });

  it('should handle empty state', () => {
    // Test empty state
  });

  it('should handle errors', () => {
    // Test error handling
  });
});

describe('useSearch hook', () => {
  it('should execute search after debounce', () => {
    // Test debouncing
  });

  it('should handle loading state', () => {
    // Test loading
  });

  it('should handle errors', () => {
    // Test error handling
  });
});
```

## Performance Considerations

### Database Optimization

1. **Indexes**: Add indexes on searchable fields
```sql
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_title ON products(title);
CREATE INDEX idx_blog_posts_title ON blog_posts(title);
-- Add for all searchable fields
```

2. **Full-Text Search** (Optional future enhancement):
```sql
-- PostgreSQL full-text search
ALTER TABLE users ADD COLUMN search_vector tsvector;
CREATE INDEX idx_users_search ON users USING GIN(search_vector);
```

### Caching Strategy

1. **Client-Side Caching**: Cache recent searches for 5 minutes
2. **Server-Side Caching**: Cache common queries using Redis (optional)
3. **Result Caching**: Cache search results with short TTL

### Query Optimization

1. **Parallel Execution**: Search providers execute in parallel
2. **Early Termination**: Stop searching once limit is reached
3. **Selective Fields**: Only fetch required fields from database
4. **Pagination**: Always use pagination to limit data transfer

## Security Considerations

### Rate Limiting

```typescript
@Injectable()
export class SearchRateLimitGuard implements CanActivate {
  private readonly requests = new Map<string, number[]>();
  private readonly limit = 100;
  private readonly windowMs = 60 * 60 * 1000; // 1 hour

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const now = Date.now();

    // Get user's request history
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside window
    const recentRequests = userRequests.filter(
      time => now - time < this.windowMs
    );

    // Check limit
    if (recentRequests.length >= this.limit) {
      throw new SearchRateLimitException();
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);

    return true;
  }
}
```

### Input Validation

1. **Query Length**: Maximum 200 characters
2. **SQL Injection**: Use Prisma parameterized queries
3. **XSS Prevention**: Sanitize output in frontend
4. **Type Validation**: Validate entity type parameter

### Audit Logging

```typescript
// Log sensitive searches
if (['users', 'customers', 'orders'].includes(entityType)) {
  await this.auditService.log({
    userId,
    action: 'SEARCH',
    entityType,
    query,
    timestamp: new Date(),
  });
}
```

## Deployment Considerations

### Environment Variables

```env
# Backend
SEARCH_RATE_LIMIT=100
SEARCH_RATE_WINDOW_MS=3600000
SEARCH_MAX_QUERY_LENGTH=200
SEARCH_DEFAULT_PAGE_SIZE=20
SEARCH_MAX_PAGE_SIZE=100

# Frontend
NEXT_PUBLIC_SEARCH_DEBOUNCE_MS=300
NEXT_PUBLIC_SEARCH_QUICK_LIMIT=8
```

### Database Migrations

```typescript
// Add indexes for search performance
export async function up(prisma: PrismaClient) {
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_products_title ON products(title);
    CREATE INDEX IF NOT EXISTS idx_products_description ON products(description);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_title ON blog_posts(title);
    CREATE INDEX IF NOT EXISTS idx_blog_posts_content ON blog_posts(content);
    CREATE INDEX IF NOT EXISTS idx_pages_title ON pages(title);
    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
  `;
}
```

## Future Enhancements

1. **Advanced Search**: Boolean operators, phrase matching, wildcards
2. **Search Analytics**: Track popular searches, click-through rates
3. **Search Suggestions**: Auto-complete, did-you-mean
4. **Saved Searches**: Allow users to save and reuse searches
5. **Search History**: Show recent searches in dialog
6. **Faceted Search**: Filter by multiple attributes
7. **Full-Text Search**: PostgreSQL tsvector or Elasticsearch integration
8. **Search Highlighting**: Highlight matched terms in results
9. **Search Filters**: Date ranges, status filters, custom filters
10. **Export Results**: Export search results to CSV/PDF

## Conclusion

This design provides a solid foundation for a professional, extensible search system. The architecture separates concerns cleanly, making it easy to add new searchable entity types. Security and performance are built-in from the start, and the user experience is modern and intuitive with keyboard shortcuts and real-time results.
