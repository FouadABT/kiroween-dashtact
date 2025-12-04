/**
 * Metadata Context Usage Examples
 * 
 * This file demonstrates various ways to use the MetadataContext
 * for dynamic page metadata updates.
 */

'use client';

import { useEffect, useState, useMemo } from 'react';
import { useMetadata } from '@/hooks';

/**
 * Example 1: Basic Metadata Update
 * Update page title and description based on loaded data
 */
export function BasicMetadataExample() {
  const { updateMetadata } = useMetadata();
  const [data, setData] = useState({ title: 'Loading...', description: '' });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      const loadedData = {
        title: 'My Page Title',
        description: 'This is a description of my page',
      };
      setData(loadedData);

      // Update metadata
      updateMetadata({
        title: loadedData.title,
        description: loadedData.description,
      });
    }, 1000);
  }, [updateMetadata]);

  return (
    <div>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
    </div>
  );
}

/**
 * Example 2: User Profile with Dynamic Breadcrumbs
 * Update metadata and breadcrumb labels based on user data
 */
export function UserProfileExample({ userId }: { userId: string }) {
  const { updateMetadata, setDynamicValues } = useMetadata();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);

  useEffect(() => {
    async function loadUser() {
      // Simulate API call
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
      };
      setUser(userData);

      // Update page metadata
      updateMetadata({
        title: `${userData.name} - User Profile`,
        description: `View and manage ${userData.name}'s profile`,
        keywords: ['user', 'profile', userData.name],
      });

      // Update breadcrumb labels
      // If breadcrumb config has {userName}, it will be replaced with actual name
      setDynamicValues({
        userName: userData.name,
        userId: userId,
      });
    }

    loadUser();
  }, [userId, updateMetadata, setDynamicValues]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
}

/**
 * Example 3: Article with SEO Metadata
 * Add comprehensive SEO metadata including Open Graph and Twitter Cards
 */
export function ArticleExample() {
  const { updateMetadata } = useMetadata();

  const article = useMemo(
    () => ({
      title: 'How to Build a Metadata System',
      excerpt: 'Learn how to implement a comprehensive metadata system for your Next.js application',
      author: 'Jane Smith',
      publishedDate: '2024-01-15',
      coverImage: '/images/article-cover.jpg',
      tags: ['nextjs', 'seo', 'metadata', 'react'],
    }),
    []
  );

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
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        author: {
          '@type': 'Person',
          name: article.author,
        },
        datePublished: article.publishedDate,
        image: article.coverImage,
      },
    });
  }, [article, updateMetadata]);

  return (
    <article>
      <h1>{article.title}</h1>
      <p className="text-muted-foreground">
        By {article.author} • {article.publishedDate}
      </p>
      <p>{article.excerpt}</p>
    </article>
  );
}

/**
 * Example 4: Product Page with Canonical URL
 * Set canonical URL to prevent duplicate content issues
 */
export function ProductExample({ productId }: { productId: string }) {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: 'Product Name - Our Store',
      description: 'Product description goes here',
      canonical: `https://example.com/products/${productId}`,
      openGraph: {
        type: 'website',
        url: `https://example.com/products/${productId}`,
      },
    });
  }, [productId, updateMetadata]);

  return <div>Product details</div>;
}

/**
 * Example 5: Draft Content with No-Index
 * Prevent search engines from indexing draft content
 */
export function DraftContentExample() {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: 'Draft Post - Not Published',
      robots: {
        index: false,
        follow: false,
        noarchive: true,
      },
    });
  }, [updateMetadata]);

  return (
    <div>
      <div className="bg-yellow-100 border border-yellow-400 p-4 mb-4">
        <p className="text-yellow-800">
          ⚠️ This is a draft. It will not be indexed by search engines.
        </p>
      </div>
      <div>Draft content...</div>
    </div>
  );
}

/**
 * Example 6: Event Page with Structured Data
 * Add event structured data for rich search results
 */
export function EventExample() {
  const { updateMetadata } = useMetadata();

  const event = useMemo(
    () => ({
      name: 'Tech Conference 2024',
      startDate: '2024-06-15T09:00:00',
      endDate: '2024-06-17T18:00:00',
      venue: 'Convention Center',
      address: '123 Main St, City, State 12345',
      description: 'Annual technology conference featuring industry leaders',
    }),
    []
  );

  useEffect(() => {
    updateMetadata({
      title: event.name,
      description: event.description,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: event.name,
        description: event.description,
        startDate: event.startDate,
        endDate: event.endDate,
        location: {
          '@type': 'Place',
          name: event.venue,
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.address,
          },
        },
      },
    });
  }, [event, updateMetadata]);

  return (
    <div>
      <h1>{event.name}</h1>
      <p>{event.description}</p>
      <p>
        {event.venue} • {new Date(event.startDate).toLocaleDateString()}
      </p>
    </div>
  );
}

/**
 * Example 7: Cleanup on Unmount
 * Reset metadata when component unmounts
 */
export function TemporaryPageExample() {
  const { updateMetadata, resetMetadata } = useMetadata();

  useEffect(() => {
    updateMetadata({
      title: 'Temporary Page',
      description: 'This page is temporary',
      robots: { index: false },
    });

    // Cleanup when component unmounts
    return () => {
      resetMetadata();
    };
  }, [updateMetadata, resetMetadata]);

  return <div>Temporary content that will be cleaned up</div>;
}

/**
 * Example 8: Multiple Metadata Updates
 * Update different metadata fields separately
 */
export function MultipleUpdatesExample() {
  const { updateMetadata } = useMetadata();
  const [step, setStep] = useState(1);

  useEffect(() => {
    // Update title based on step
    updateMetadata({
      title: `Step ${step} - Multi-step Form`,
    });
  }, [step, updateMetadata]);

  useEffect(() => {
    // Update robots meta separately
    updateMetadata({
      robots: { index: false, follow: true },
    });
  }, [updateMetadata]);

  return (
    <div>
      <h1>Step {step}</h1>
      <button onClick={() => setStep(step + 1)}>Next Step</button>
    </div>
  );
}

/**
 * Example 9: Conditional Metadata
 * Update metadata based on conditions
 */
export function ConditionalMetadataExample({ isPublished }: { isPublished: boolean }) {
  const { updateMetadata } = useMetadata();

  useEffect(() => {
    if (isPublished) {
      updateMetadata({
        title: 'Published Article',
        robots: { index: true, follow: true },
      });
    } else {
      updateMetadata({
        title: 'Draft Article',
        robots: { index: false, follow: false },
      });
    }
  }, [isPublished, updateMetadata]);

  return (
    <div>
      <div className={isPublished ? 'text-green-600' : 'text-yellow-600'}>
        Status: {isPublished ? 'Published' : 'Draft'}
      </div>
    </div>
  );
}

/**
 * Example 10: Metadata with Loading State
 * Handle metadata updates during async operations
 */
export function LoadingStateExample({ postId }: { postId: string }) {
  const { updateMetadata } = useMetadata();
  const [post, setPost] = useState<{ title: string; content: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      setIsLoading(true);

      // Show loading state in title
      updateMetadata({
        title: 'Loading...',
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const loadedPost = {
        title: 'My Blog Post',
        content: 'Post content here',
      };

      setPost(loadedPost);
      setIsLoading(false);

      // Update with actual data
      updateMetadata({
        title: loadedPost.title,
        description: loadedPost.content.substring(0, 160),
      });
    }

    loadPost();
  }, [postId, updateMetadata]);

  if (isLoading) return <div>Loading...</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
}
