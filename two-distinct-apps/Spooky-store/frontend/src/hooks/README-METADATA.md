# Metadata Hooks

This directory contains hooks for managing page metadata and SEO optimization.

## useMetadata

The `useMetadata` hook provides access to the metadata context, allowing components to update page metadata dynamically based on loaded data.

### Basic Usage

```tsx
import { useMetadata } from '@/hooks';

function MyComponent() {
  const { updateMetadata, setDynamicValues } = useMetadata();
  
  // Update metadata
  updateMetadata({
    title: 'My Page Title',
    description: 'Page description'
  });
  
  return <div>Content</div>;
}
```

### API Reference

#### Context Value

```typescript
interface MetadataContextValue {
  metadata: PageMetadata | null;           // Current metadata state
  dynamicValues: Record<string, string>;   // Dynamic template values
  updateMetadata: (metadata: Partial<PageMetadata>) => void;
  setDynamicValues: (values: Record<string, string>) => void;
  resetMetadata: () => void;
}
```

#### Methods

**`updateMetadata(metadata: Partial<PageMetadata>)`**

Updates page metadata and applies changes to the document. Changes are debounced by 150ms to prevent excessive DOM updates.

```tsx
updateMetadata({
  title: 'New Title',
  description: 'New description',
  keywords: ['keyword1', 'keyword2'],
});
```

**`setDynamicValues(values: Record<string, string>)`**

Sets dynamic values for template resolution in breadcrumbs and other dynamic content.

```tsx
setDynamicValues({
  userName: 'John Doe',
  userId: '123',
  postTitle: 'My Post',
});
```

**`resetMetadata()`**

Resets metadata to initial state and clears dynamic values.

```tsx
resetMetadata();
```

### Common Use Cases

#### 1. Dynamic Page Titles

Update the page title based on loaded data:

```tsx
function UserProfilePage({ userId }: { userId: string }) {
  const { updateMetadata } = useMetadata();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(userId);
      setUser(userData);
      
      updateMetadata({
        title: `${userData.name} - User Profile`,
        description: `View and manage ${userData.name}'s profile`,
      });
    }
    
    loadUser();
  }, [userId, updateMetadata]);
  
  return <div>{user?.name}</div>;
}
```

#### 2. SEO Metadata for Articles

Add Open Graph and Twitter Card metadata for articles:

```tsx
function ArticlePage({ article }: { article: Article }) {
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    updateMetadata({
      title: article.title,
      description: article.excerpt,
      keywords: article.tags,
      openGraph: {
        type: 'article',
        title: article.title,
        description: article.excerpt,
        images: [
          {
            url: article.coverImage,
            width: 1200,
            height: 630,
            alt: article.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt,
        images: [article.coverImage],
      },
    });
  }, [article, updateMetadata]);
  
  return <article>{article.content}</article>;
}
```

#### 3. Dynamic Breadcrumb Labels

Update breadcrumb labels with dynamic data:

```tsx
function UserDetailPage({ userId }: { userId: string }) {
  const { updateMetadata, setDynamicValues } = useMetadata();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    async function loadUser() {
      const userData = await fetchUser(userId);
      setUser(userData);
      
      // Update page metadata
      updateMetadata({
        title: `${userData.name} - User Details`,
      });
      
      // Update breadcrumb labels
      // Breadcrumbs configured with {userName} will now show the actual name
      setDynamicValues({
        userName: userData.name,
        userId: userId,
      });
    }
    
    loadUser();
  }, [userId, updateMetadata, setDynamicValues]);
  
  return <div>{user?.name}</div>;
}
```

#### 4. Canonical URLs

Set canonical URLs to prevent duplicate content issues:

```tsx
function ProductPage({ productId }: { productId: string }) {
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    updateMetadata({
      canonical: `https://example.com/products/${productId}`,
    });
  }, [productId, updateMetadata]);
  
  return <div>Product details</div>;
}
```

#### 5. Robots Meta Tags

Control search engine indexing:

```tsx
function DraftPostPage() {
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    // Prevent search engines from indexing draft posts
    updateMetadata({
      robots: {
        index: false,
        follow: false,
      },
    });
  }, [updateMetadata]);
  
  return <div>Draft content</div>;
}
```

#### 6. Structured Data (JSON-LD)

Add structured data for rich search results:

```tsx
function EventPage({ event }: { event: Event }) {
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    updateMetadata({
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        startDate: event.startDate,
        endDate: event.endDate,
        location: {
          '@type': 'Place',
          name: event.venue,
          address: event.address,
        },
      },
    });
  }, [event, updateMetadata]);
  
  return <div>{event.name}</div>;
}
```

#### 7. Cleanup on Unmount

Reset metadata when component unmounts:

```tsx
function TemporaryPage() {
  const { updateMetadata, resetMetadata } = useMetadata();
  
  useEffect(() => {
    updateMetadata({
      title: 'Temporary Page',
      robots: { index: false },
    });
    
    // Cleanup when component unmounts
    return () => {
      resetMetadata();
    };
  }, [updateMetadata, resetMetadata]);
  
  return <div>Temporary content</div>;
}
```

### Performance Considerations

#### Debouncing

The `updateMetadata` function is automatically debounced by 150ms to prevent excessive DOM updates when metadata changes rapidly.

```tsx
// These rapid updates will be batched into a single DOM update
updateMetadata({ title: 'Title 1' });
updateMetadata({ title: 'Title 2' });
updateMetadata({ title: 'Title 3' });
// Only the final title will be applied to the document
```

#### Memoization

Use `useCallback` and `useMemo` to prevent unnecessary re-renders:

```tsx
function MyComponent({ data }: { data: Data }) {
  const { updateMetadata } = useMetadata();
  
  // Memoize the metadata object
  const metadata = useMemo(() => ({
    title: data.title,
    description: data.description,
  }), [data.title, data.description]);
  
  useEffect(() => {
    updateMetadata(metadata);
  }, [metadata, updateMetadata]);
  
  return <div>Content</div>;
}
```

### Error Handling

The hook will throw an error if used outside of a `MetadataProvider`:

```tsx
// ❌ This will throw an error
function MyComponent() {
  const { updateMetadata } = useMetadata(); // Error: must be used within MetadataProvider
  return <div>Content</div>;
}

// ✅ Correct usage
function App() {
  return (
    <MetadataProvider>
      <MyComponent />
    </MetadataProvider>
  );
}
```

### Best Practices

1. **Update metadata in useEffect**: Always update metadata inside `useEffect` to avoid updates during render.

2. **Include dependencies**: Include `updateMetadata` and `setDynamicValues` in the dependency array.

3. **Cleanup when needed**: Use `resetMetadata()` in the cleanup function if you need to reset metadata on unmount.

4. **Combine updates**: Update multiple metadata fields in a single call for better performance.

5. **Use dynamic values for breadcrumbs**: Set dynamic values separately from metadata for better separation of concerns.

### Integration with Next.js

The metadata context works alongside Next.js's built-in Metadata API:

- **Server-side**: Use Next.js `generateMetadata()` for initial metadata
- **Client-side**: Use `useMetadata()` for runtime updates based on loaded data

```tsx
// app/users/[id]/page.tsx

// Server-side metadata (initial render)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'User Profile',
    description: 'View user profile',
  };
}

// Client component for dynamic updates
'use client';
function UserProfile({ userId }: { userId: string }) {
  const { updateMetadata } = useMetadata();
  
  useEffect(() => {
    async function loadUser() {
      const user = await fetchUser(userId);
      
      // Update metadata with actual user data
      updateMetadata({
        title: `${user.name} - User Profile`,
        description: `View ${user.name}'s profile`,
      });
    }
    
    loadUser();
  }, [userId, updateMetadata]);
  
  return <div>Profile content</div>;
}
```

### Related Hooks

- **useTheme**: Manage theme and design system settings
- **useAuth**: Access authentication state and user information
- **useScreenReaderAnnouncement**: Announce changes to screen readers

### See Also

- [MetadataContext Documentation](../contexts/MetadataContext.tsx)
- [Metadata Types](../types/metadata.ts)
- [Metadata Configuration](../lib/metadata-config.ts)
- [Breadcrumb Component](../components/navigation/Breadcrumb.tsx)
