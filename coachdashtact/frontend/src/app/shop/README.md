# Shop Page - Product Catalog

This directory contains the implementation of the public-facing product catalog page (`/shop`).

## Features

### ✅ Server-Side Rendering (SSR)
- Products and categories are fetched on the server for optimal SEO
- Initial page load is fast with pre-rendered content
- Search engines can properly index product listings

### ✅ Product Grid
- Responsive layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop) → 4 columns (large screens)
- Product cards display:
  - Product image with hover zoom effect
  - Product name and short description
  - Price with discount badge (if applicable)
  - Category badges
  - "Add to Cart" button
  - "Out of Stock" badge when inventory is depleted
  - "Featured" badge for featured products

### ✅ Advanced Filtering
- **Search**: Real-time search by product name (debounced 300ms)
- **Categories**: Hierarchical category tree with product counts
  - Parent categories
  - Subcategories (nested)
- **Price Range**: Slider with min/max price filtering
- **Options**:
  - Featured products only
  - In stock only
- **Clear Filters**: One-click to reset all filters

### ✅ Sorting Options
- Newest First (default)
- Oldest First
- Price: Low to High
- Price: High to Low
- Name: A to Z
- Name: Z to A

### ✅ Pagination
- Page numbers with ellipsis for large page counts
- First/Last page buttons
- Previous/Next page buttons
- Smooth scroll to top on page change
- Current page highlighted

### ✅ URL State Management
- All filters, sort, and pagination state stored in URL query parameters
- Shareable links with preserved filters
- Browser back/forward navigation works correctly
- URL updates without page reload (client-side navigation)

### ✅ Shopping Cart Integration
- "Add to Cart" button on each product card
- Guest cart support with session ID
- Toast notifications on successful add
- Quick link to view cart after adding product
- Loading state while adding to cart

### ✅ Loading & Error States
- Loading skeleton while fetching data
- Error boundary with retry functionality
- Empty state when no products match filters
- Graceful error handling with user-friendly messages

### ✅ Accessibility
- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Focus management

## File Structure

```
frontend/src/app/shop/
├── page.tsx              # Server component - SSR entry point
├── ShopPageClient.tsx    # Client component - interactive UI
├── loading.tsx           # Loading state
├── error.tsx             # Error boundary
└── README.md             # This file

frontend/src/components/storefront/
├── ProductCard.tsx       # Individual product card
├── ProductGrid.tsx       # Responsive product grid
├── ProductFilters.tsx    # Filter sidebar
├── ProductSort.tsx       # Sort dropdown
├── Pagination.tsx        # Pagination controls
└── index.ts              # Barrel exports
```

## Usage

### Accessing the Shop Page

Navigate to `/shop` to view the product catalog.

### URL Parameters

The shop page supports the following URL parameters:

- `search` - Search query (e.g., `?search=laptop`)
- `categorySlug` - Filter by category (e.g., `?categorySlug=electronics`)
- `minPrice` - Minimum price (e.g., `?minPrice=100`)
- `maxPrice` - Maximum price (e.g., `?maxPrice=500`)
- `isFeatured` - Show only featured products (e.g., `?isFeatured=true`)
- `inStock` - Show only in-stock products (e.g., `?inStock=true`)
- `sortBy` - Sort order (e.g., `?sortBy=price_asc`)
- `page` - Page number (e.g., `?page=2`)
- `limit` - Items per page (e.g., `?limit=24`)

### Example URLs

```
/shop                                    # All products
/shop?search=laptop                      # Search for "laptop"
/shop?categorySlug=electronics           # Electronics category
/shop?minPrice=100&maxPrice=500          # Price range $100-$500
/shop?isFeatured=true                    # Featured products only
/shop?sortBy=price_asc&page=2            # Sorted by price, page 2
/shop?categorySlug=electronics&inStock=true&sortBy=price_desc
                                         # Electronics, in stock, sorted by price descending
```

## API Integration

### Endpoints Used

- `GET /storefront/products` - Fetch products with filters
- `GET /storefront/categories` - Fetch category tree
- `POST /cart/items` - Add product to cart

### Data Flow

1. **Server-Side (page.tsx)**:
   - Parse URL search parameters
   - Fetch products and categories from API
   - Pass data to client component as props

2. **Client-Side (ShopPageClient.tsx)**:
   - Render products with initial data
   - Handle filter/sort/pagination changes
   - Update URL without page reload
   - Manage cart operations

## Components

### ProductCard

Displays individual product with:
- Image with hover effect
- Name and description
- Price with discount
- Category badges
- Add to cart button
- Stock status

**Props**:
```typescript
interface ProductCardProps {
  product: StorefrontProductResponseDto;
  onAddToCart?: (productId: string) => void;
}
```

### ProductGrid

Responsive grid layout for products.

**Props**:
```typescript
interface ProductGridProps {
  products: StorefrontProductResponseDto[];
  onAddToCart?: (productId: string) => void;
}
```

### ProductFilters

Sidebar with all filtering options.

**Props**:
```typescript
interface ProductFiltersProps {
  categories: StorefrontCategoryResponseDto[];
  filters: ProductFiltersState;
  onFiltersChange: (filters: ProductFiltersState) => void;
  priceRange?: { min: number; max: number };
}
```

### ProductSort

Dropdown for sorting options.

**Props**:
```typescript
interface ProductSortProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
}
```

### Pagination

Page navigation controls.

**Props**:
```typescript
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}
```

## State Management

### Filter State

```typescript
interface ProductFiltersState {
  search: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  inStock?: boolean;
}
```

### Sort Options

```typescript
type SortOption = 
  | 'price_asc' 
  | 'price_desc' 
  | 'name_asc' 
  | 'name_desc' 
  | 'newest' 
  | 'oldest';
```

## Performance Optimizations

1. **Server-Side Rendering**: Initial page load is fast with pre-rendered HTML
2. **Debounced Search**: Search input debounced by 300ms to reduce API calls
3. **URL State**: Filters stored in URL to enable browser caching
4. **Lazy Loading**: Images use Next.js Image component with lazy loading
5. **Responsive Images**: Different image sizes for different screen sizes
6. **Client-Side Navigation**: URL updates without full page reload

## Accessibility Features

- Semantic HTML (`<nav>`, `<main>`, `<aside>`)
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators
- Screen reader announcements
- Color contrast compliance (WCAG AA)

## Error Handling

1. **API Errors**: Gracefully handled with empty state
2. **Network Errors**: Error boundary with retry option
3. **Invalid Filters**: Ignored or reset to defaults
4. **Cart Errors**: Toast notification with error message

## Future Enhancements

- [ ] Product quick view modal
- [ ] Compare products feature
- [ ] Save filters as presets
- [ ] Recently viewed products
- [ ] Product recommendations
- [ ] Infinite scroll option
- [ ] Grid/List view toggle
- [ ] Advanced filters (brand, rating, etc.)
- [ ] Filter by tags
- [ ] Price history chart

## Testing

### Manual Testing Checklist

- [ ] Products load correctly
- [ ] Search filters products
- [ ] Category filtering works
- [ ] Price range slider works
- [ ] Sort options work
- [ ] Pagination works
- [ ] Add to cart works
- [ ] URL updates correctly
- [ ] Browser back/forward works
- [ ] Loading states display
- [ ] Error states display
- [ ] Empty state displays
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Keyboard navigation works
- [ ] Screen reader compatible

### Test URLs

```bash
# Test search
/shop?search=test

# Test category
/shop?categorySlug=electronics

# Test price range
/shop?minPrice=100&maxPrice=500

# Test featured
/shop?isFeatured=true

# Test in stock
/shop?inStock=true

# Test sort
/shop?sortBy=price_asc

# Test pagination
/shop?page=2

# Test combined filters
/shop?categorySlug=electronics&minPrice=100&maxPrice=500&sortBy=price_asc&page=1
```

## Troubleshooting

### Products not loading
- Check backend is running on port 3001
- Verify `/storefront/products` endpoint is accessible
- Check browser console for errors

### Filters not working
- Check URL parameters are being set correctly
- Verify filter state is updating
- Check API is receiving correct query parameters

### Add to cart not working
- Verify CartApi is imported correctly
- Check session ID is being generated
- Verify `/cart/items` endpoint is accessible
- Check browser console for errors

### Images not displaying
- Verify product has `featuredImage` field
- Check image URLs are valid
- Verify Next.js Image component is configured correctly

## Related Documentation

- [Storefront API Documentation](../../lib/api.ts)
- [Storefront Types](../../types/storefront.ts)
- [E-Commerce Types](../../types/ecommerce.ts)
- [Cart Implementation](../cart/README.md)
- [Product Detail Page](./[slug]/README.md)
