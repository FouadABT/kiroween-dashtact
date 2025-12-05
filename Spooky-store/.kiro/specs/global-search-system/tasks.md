# Implementation Plan

- [x] 1. Backend search infrastructure and core module




  - Create search module structure with controller, service, and registry
  - Implement Searchable interface contract for search providers
  - Create SearchRegistryService to manage provider registration
  - Implement SearchService for orchestrating searches across providers
  - Create DTOs for search requests and responses with validation
  - Add rate limiting guard for search endpoints
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 7.1, 7.2, 7.3, 7.4, 7.5, 9.1, 9.2, 9.6_

- [x] 1.1 Create search module structure


  - Generate search module with NestJS CLI
  - Create directory structure (dto/, interfaces/, providers/, guards/)
  - Set up module imports (PrismaModule, PermissionsModule, UsersModule)
  - Export SearchService for use in other modules
  - _Requirements: 7.1_

- [x] 1.2 Implement Searchable interface and base types


  - Create ISearchable interface with required methods
  - Define SearchOptions interface for pagination and sorting
  - Define SearchResultItem interface for result format
  - Create base search provider abstract class (optional helper)
  - _Requirements: 7.2, 7.3_


- [x] 1.3 Implement SearchRegistryService

  - Create service to maintain provider registry
  - Implement registerProvider method
  - Implement getProvider and getAllProviders methods
  - Implement getProvidersByTypes for filtered retrieval
  - _Requirements: 7.4_

- [x] 1.4 Create DTOs with validation


  - Create SearchQueryDto with class-validator decorators
  - Create QuickSearchQueryDto for quick search endpoint
  - Create SearchResultDto for response format
  - Create PaginatedSearchResultDto with metadata
  - _Requirements: 1.5, 8.1, 8.4, 8.5, 8.6_

- [x] 1.5 Implement SearchService core logic


  - Implement search method to orchestrate multi-provider search
  - Implement quickSearch method for top 8 results
  - Add query validation and sanitization
  - Implement result merging and sorting by relevance
  - Add pagination logic
  - Integrate with PermissionsService for permission checks
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 7.5_


- [x] 1.6 Create rate limiting guard

  - Implement SearchRateLimitGuard with 100 requests per hour limit
  - Track requests per user with timestamp-based window
  - Throw appropriate exception when limit exceeded
  - Clean up old request records periodically
  - _Requirements: 9.1, 9.2_

- [x] 2. Implement search providers for all entity types





  - Create UsersSearchProvider with role-based filtering
  - Create ProductsSearchProvider with publish status filtering
  - Create BlogPostsSearchProvider with author and publish filtering
  - Create PagesSearchProvider with visibility filtering
  - Create CustomersSearchProvider with role-based access
  - Create OrdersSearchProvider with customer/staff filtering
  - Register all providers in SearchModule
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 7.6_


- [x] 2.1 Implement UsersSearchProvider

  - Implement ISearchable interface for users entity
  - Define getEntityType as 'users' and getRequiredPermission as 'users:read'
  - Implement search method with role-based WHERE clauses (regular users see self, managers see team, admins see all)
  - Search by name and email fields with case-insensitive matching
  - Implement count method for pagination
  - Implement formatResult to return user name, email, role, and status
  - Implement getEntityUrl to return /dashboard/users/{id}
  - Calculate relevance score based on exact/partial matches
  - _Requirements: 3.2, 3.3, 3.4, 3.5_


- [x] 2.2 Implement ProductsSearchProvider

  - Implement ISearchable interface for products entity
  - Define getEntityType as 'products' and getRequiredPermission as 'products:read'
  - Implement search method filtering by publish status (all users see published, admins see all)
  - Search by title, description, and SKU fields
  - Implement count method for pagination
  - Implement formatResult to return product title, description, price, and status
  - Implement getEntityUrl to return /dashboard/products/{id}
  - Calculate relevance score prioritizing title matches
  - _Requirements: 3.6, 3.7_


- [x] 2.3 Implement BlogPostsSearchProvider

  - Implement ISearchable interface for blog posts entity
  - Define getEntityType as 'posts' and getRequiredPermission as 'blog:read'
  - Implement search method with publish status and author filtering (all see published, authors see own drafts, admins see all)
  - Search by title, excerpt, and content fields
  - Implement count method for pagination
  - Implement formatResult to return post title, excerpt, author, and publish date
  - Implement getEntityUrl to return /dashboard/blog/{id}
  - Calculate relevance score prioritizing title and excerpt matches
  - _Requirements: 3.8, 3.9, 3.10_

- [x] 2.4 Implement PagesSearchProvider


  - Implement ISearchable interface for pages entity
  - Define getEntityType as 'pages' and getRequiredPermission based on page visibility
  - Implement search method filtering by visibility settings and user permissions
  - Search by title, slug, and content fields
  - Implement count method for pagination
  - Implement formatResult to return page title, description, and status
  - Implement getEntityUrl to return /dashboard/pages/{id}
  - Calculate relevance score prioritizing title matches
  - _Requirements: 3.11_


- [x] 2.5 Implement CustomersSearchProvider

  - Implement ISearchable interface for customers entity
  - Define getEntityType as 'customers' and getRequiredPermission as 'customers:read'
  - Implement search method with role-based filtering
  - Search by name, email, and company fields
  - Implement count method for pagination
  - Implement formatResult to return customer name, email, and company
  - Implement getEntityUrl to return /dashboard/customers/{id}
  - Calculate relevance score based on name and email matches
  - _Requirements: 3.12_

- [x] 2.6 Implement OrdersSearchProvider


  - Implement ISearchable interface for orders entity
  - Define getEntityType as 'orders' and getRequiredPermission as 'orders:read'
  - Implement search method filtering by customer (customers see own, staff see all)
  - Search by order number, customer name, and product names
  - Implement count method for pagination
  - Implement formatResult to return order number, customer, total, and status
  - Implement getEntityUrl to return /dashboard/orders/{id}
  - Calculate relevance score prioritizing order number matches
  - _Requirements: 3.13, 3.14_


- [x] 2.7 Register all providers in SearchModule

  - Import all search provider classes
  - Add all providers to SearchModule providers array
  - Inject providers into SearchRegistryService in onModuleInit
  - Call registerProvider for each provider
  - Verify all entity types are registered correctly
  - _Requirements: 7.5, 7.6_

- [x] 3. Create search API endpoints and security




  - Implement SearchController with GET /search endpoint
  - Implement GET /search/quick endpoint for Cmd+K dialog
  - Apply JwtAuthGuard to all endpoints
  - Apply SearchRateLimitGuard to all endpoints
  - Apply PermissionsGuard where needed
  - Add audit logging for sensitive entity searches
  - Implement error handling and consistent response format
  - Add API documentation with Swagger decorators
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 9.3, 9.4, 9.5, 9.6_

- [x] 3.1 Implement SearchController with main endpoint


  - Create SearchController with @Controller('search') decorator
  - Implement GET /search endpoint accepting SearchQueryDto
  - Apply @UseGuards(JwtAuthGuard, SearchRateLimitGuard)
  - Extract user ID from request for permission filtering
  - Call SearchService.search with user ID and query
  - Return PaginatedSearchResultDto
  - Add @ApiOperation and @ApiResponse Swagger decorators
  - _Requirements: 8.1, 8.2, 9.6_

- [x] 3.2 Implement quick search endpoint

  - Implement GET /search/quick endpoint accepting query parameter
  - Apply @UseGuards(JwtAuthGuard, SearchRateLimitGuard)
  - Extract user ID from request
  - Call SearchService.quickSearch with user ID and query
  - Return array of top 8 SearchResultDto items
  - Add Swagger documentation
  - _Requirements: 8.3, 8.4_

- [x] 3.3 Add audit logging for sensitive searches


  - Inject AuditLoggingService into SearchService
  - Check if entity type is sensitive (users, customers, orders)
  - Log search action with user ID, entity type, query, and timestamp
  - Ensure logging doesn't impact search performance
  - _Requirements: 9.4_


- [x] 3.4 Implement error handling

  - Add try-catch blocks in SearchService methods
  - Throw InvalidSearchQueryException for validation errors
  - Throw SearchRateLimitException when limit exceeded
  - Return consistent error responses with proper HTTP status codes
  - Log errors for debugging
  - _Requirements: 9.3, 9.5_


- [x] 3.5 Add database indexes for performance

  - Create migration to add indexes on searchable fields
  - Add index on users.name and users.email
  - Add index on products.title and products.description
  - Add index on blog_posts.title and blog_posts.content
  - Add index on pages.title
  - Add index on customers.name and customers.email
  - Add index on orders.order_number
  - _Requirements: 10.4_

- [x] 4. Build frontend search components and dialog








  - Create GlobalSearchBar component for header
  - Create SearchDialog component with Cmd+K trigger
  - Create SearchResultsList component for displaying results
  - Create SearchResultItem component for individual results
  - Create SearchEmptyState component for no results
  - Implement useSearchShortcut hook for keyboard handling
  - Implement useSearch hook for search logic and state
  - Add search components to dashboard layout
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_



- [x] 4.1 Create GlobalSearchBar component


  - Create component with search icon and input field
  - Display "Search... (Cmd+K)" placeholder
  - Show keyboard shortcut badge (⌘K or Ctrl+K)
  - Make input read-only and trigger dialog on click
  - Style with theme variables for dark mode support
  - Position in dashboard header

  - _Requirements: 4.1, 4.2_



- [x] 4.2 Implement useSearchShortcut hook

  - Listen for Cmd+K (Mac) or Ctrl+K (Windows) keyboard event
  - Prevent default browser behavior
  - Manage search dialog open/close state
  - Return isOpen state and openSearch/closeSearch functions
  - Clean up event listeners on unmount
  - _Requirements: 4.2, 4.6_

- [x] 4.3 Create SearchDialog component


  - Create modal dialog using shadcn/ui Dialog component
  - Add search input with autofocus
  - Integrate useSearch hook with quick search mode
  - Display loading state with "Searching..." message
  - Display error state with error message
  - Show SearchResultsList when results available
  - Show SearchEmptyState when no results
  - Add "View all results" link to full search page
  - Handle Escape key to close dialog
  - _Requirements: 4.2, 4.3, 4.4, 4.5, 11.1, 11.2, 11.3, 11.4, 11.6_


- [x] 4.4 Implement useSearch hook

  - Accept query string and options (quick, type, page, limit)
  - Implement debouncing with 300ms delay using useDebounce
  - Manage loading, error, and results state
  - Call searchApi.quickSearch or searchApi.search based on options
  - Handle errors and set appropriate error messages
  - Return results, isLoading, error, and totalCount
  - _Requirements: 4.3, 10.1, 10.2_

- [x] 4.5 Create SearchResultsList component


  - Accept results array and onResultClick callback
  - Map results to SearchResultItem components
  - Handle keyboard navigation with arrow keys
  - Track selected result index
  - Call onResultClick when Enter pressed or item clicked
  - Style with proper spacing and theme colors
  - _Requirements: 4.4, 4.7_


- [x] 4.6 Create SearchResultItem component

  - Display entity type icon and badge
  - Display title as clickable link
  - Display description with 150 character limit
  - Display metadata (date, author, status)
  - Highlight search terms in title and description
  - Style with hover effects and theme colors
  - Support keyboard focus states
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_


- [x] 4.7 Create SearchEmptyState component

  - Display "No results found for 'query'" message
  - Show helpful suggestions ("Try different keywords")
  - Style with muted colors and proper spacing
  - _Requirements: 11.3_


- [x] 4.8 Integrate search into dashboard layout

  - Add GlobalSearchBar to dashboard header component
  - Add SearchDialog with useSearchShortcut integration
  - Ensure search is accessible on all dashboard pages
  - Test keyboard shortcut functionality
  - _Requirements: 4.1, 4.2_

- [x] 5. Create full search results page with filtering




  - Create /search page route in Next.js app directory
  - Implement SearchResultsPage component with pagination
  - Create SearchFilters component for entity type filtering
  - Add sort controls (relevance, date, name)
  - Display result count and pagination controls
  - Add breadcrumb navigation
  - Handle URL query parameters for search state
  - Implement loading and error states
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 10.5, 11.5_

- [x] 5.1 Create search page route


  - Create frontend/src/app/search/page.tsx
  - Extract query parameters from URL (q, type, page, sortBy)
  - Use useSearch hook with full pagination mode
  - Pass search state to SearchResultsPage component
  - Handle loading and error states
  - _Requirements: 5.1_

- [x] 5.2 Implement SearchResultsPage component


  - Display page title "Search Results"
  - Show total result count
  - Render SearchFilters component
  - Render SearchResultsList component
  - Add pagination controls (previous, next, page numbers)
  - Update URL when filters or page changes
  - Style with proper layout and spacing
  - _Requirements: 5.1, 5.2, 5.4, 5.6, 10.5_

- [x] 5.3 Create SearchFilters component


  - Display entity type filter tabs or buttons
  - Options: All, Users, Products, Posts, Pages, Customers, Orders
  - Highlight active filter
  - Call onChange callback when filter selected
  - Display sort dropdown (relevance, date, name)
  - Style with theme colors and proper spacing
  - _Requirements: 5.2, 5.3_


- [x] 5.4 Add breadcrumb navigation

  - Display "Dashboard > Search Results" breadcrumb
  - Make breadcrumb items clickable links
  - Style consistently with other dashboard pages
  - _Requirements: 5.7_

- [x] 5.5 Implement pagination controls


  - Display current page and total pages
  - Show previous/next buttons
  - Show page number buttons (with ellipsis for many pages)
  - Disable buttons appropriately
  - Update URL query parameters on page change
  - Scroll to top when page changes
  - _Requirements: 5.1, 5.6, 10.5_

- [x] 5.6 Handle empty and error states


  - Show SearchEmptyState when no results
  - Show error message when search fails
  - Show loading skeleton while searching
  - Ensure smooth transitions between states
  - _Requirements: 11.3, 11.4, 11.5_

- [x] 6. Create API client and TypeScript types





  - Create search API client methods in frontend/src/lib/api/search.ts
  - Define TypeScript interfaces in frontend/src/types/search.ts
  - Implement search and quickSearch API methods
  - Add error handling and response parsing
  - Add request caching for recent searches
  - Export all types and methods

  - _Requirements: 8.1, 8.2, 8.3, 8.4, 10.3_

- [x] 6.1 Create TypeScript interfaces

  - Define SearchResult interface matching backend SearchResultDto
  - Define PaginatedSearchResults interface
  - Define SearchFilters interface
  - Define SearchOptions interface
  - Export all interfaces from search.ts
  - _Requirements: 6.1, 6.2, 6.3, 6.4_


- [x] 6.2 Implement search API client

  - Create searchApi object with search and quickSearch methods
  - Implement search method calling GET /search with query params
  - Implement quickSearch method calling GET /search/quick
  - Add authentication headers from auth context
  - Parse and return typed responses
  - Handle HTTP errors and throw appropriate exceptions
  - _Requirements: 8.1, 8.2, 8.3, 8.4_


- [x] 6.3 Add client-side caching

  - Implement simple cache using Map or localStorage
  - Cache search results with 5-minute TTL
  - Check cache before making API request
  - Invalidate cache on new searches
  - _Requirements: 10.3_

- [x] 6.4 Write unit tests for search components




  - Test GlobalSearchBar renders correctly
  - Test SearchDialog opens on Cmd+K
  - Test useSearch hook debounces input
  - Test SearchResultItem displays data correctly
  - Test SearchFilters updates URL parameters
  - Test pagination controls work correctly
  - Test error handling in components
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 6.5 Write backend unit tests






  - Test SearchService.search method
  - Test SearchService.quickSearch method
  - Test each search provider (users, products, posts, pages, customers, orders)
  - Test permission filtering logic
  - Test relevance scoring
  - Test pagination logic
  - Test rate limiting guard
  - Test error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 9.1, 9.2_

- [x] 6.6 Write E2E tests






  - Test full search flow from dialog to results page
  - Test keyboard shortcuts (Cmd+K)
  - Test filtering by entity type
  - Test pagination
  - Test permission-based result filtering
  - Test rate limiting enforcement
  - Test error scenarios
  - _Requirements: 4.1, 4.2, 4.3, 5.1, 5.2, 9.1, 9.2_
