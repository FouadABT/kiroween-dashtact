'use client';

/**
 * Metadata Context and Provider
 * Manages page metadata state and client-side updates
 * 
 * This context provides runtime metadata updates for dynamic pages,
 * allowing components to update document title, meta tags, and
 * breadcrumb labels based on loaded data.
 */

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PageMetadata, MetadataContextValue } from '@/types/metadata';

// Create the context
const MetadataContext = createContext<MetadataContextValue | undefined>(undefined);

/**
 * Debounce timer for metadata updates
 * Prevents excessive DOM updates when metadata changes rapidly
 */
let debounceTimer: NodeJS.Timeout | null = null;
const DEBOUNCE_DELAY = 150; // milliseconds

/**
 * Update or create a meta tag in the document head
 * @param name - Meta tag name or property
 * @param content - Meta tag content
 * @param attribute - Attribute type ('name' or 'property')
 */
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  if (typeof document === 'undefined') return;

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
}

/**
 * Remove a meta tag from the document head
 * @param name - Meta tag name or property
 * @param attribute - Attribute type ('name' or 'property')
 * 
 * Note: Currently unused but kept for future use cases
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function removeMetaTag(name: string, attribute: 'name' | 'property' = 'name'): void {
  if (typeof document === 'undefined') return;

  const element = document.querySelector(`meta[${attribute}="${name}"]`);
  if (element) {
    element.remove();
  }
}

/**
 * MetadataProvider Component
 * Provides metadata context to the application
 * 
 * @example
 * ```tsx
 * <MetadataProvider>
 *   <App />
 * </MetadataProvider>
 * ```
 */
export function MetadataProvider({ children }: { children: React.ReactNode }) {
  const [metadata, setMetadata] = useState<PageMetadata | null>(null);
  const [dynamicValues, setDynamicValuesState] = useState<Record<string, string>>({});
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Update metadata and apply changes to document
   * Debounced to prevent excessive DOM updates
   * 
   * @param newMetadata - Partial metadata to update
   * 
   * @example
   * ```tsx
   * updateMetadata({
   *   title: 'New Page Title',
   *   description: 'Updated description'
   * });
   * ```
   */
  const updateMetadata = useCallback((newMetadata: Partial<PageMetadata>) => {
    if (!isMountedRef.current) return;

    // Clear existing debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Debounce the update to prevent rapid successive updates
    debounceTimer = setTimeout(() => {
      if (!isMountedRef.current) return;

      setMetadata(prev => {
        const updated = { ...prev, ...newMetadata } as PageMetadata;
        
        // Apply updates to document
        if (typeof document !== 'undefined') {
          // Update document title
          if (newMetadata.title) {
            document.title = newMetadata.title;
          }

          // Update meta description
          if (newMetadata.description) {
            updateMetaTag('description', newMetadata.description);
          }

          // Update keywords
          if (newMetadata.keywords) {
            updateMetaTag('keywords', newMetadata.keywords.join(', '));
          }

          // Update canonical URL
          if (newMetadata.canonical !== undefined) {
            const existingCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
            
            if (newMetadata.canonical) {
              if (!existingCanonical) {
                const link = document.createElement('link');
                link.rel = 'canonical';
                link.href = newMetadata.canonical;
                document.head.appendChild(link);
              } else {
                existingCanonical.href = newMetadata.canonical;
              }
            } else if (existingCanonical) {
              existingCanonical.remove();
            }
          }

          // Update Open Graph tags
          if (newMetadata.openGraph) {
            const og = newMetadata.openGraph;
            
            if (og.title) {
              updateMetaTag('og:title', og.title, 'property');
            }
            if (og.description) {
              updateMetaTag('og:description', og.description, 'property');
            }
            if (og.type) {
              updateMetaTag('og:type', og.type, 'property');
            }
            if (og.url) {
              updateMetaTag('og:url', og.url, 'property');
            }
            if (og.siteName) {
              updateMetaTag('og:site_name', og.siteName, 'property');
            }
            if (og.locale) {
              updateMetaTag('og:locale', og.locale, 'property');
            }
            
            // Update Open Graph images
            if (og.images && og.images.length > 0) {
              const firstImage = og.images[0];
              updateMetaTag('og:image', firstImage.url, 'property');
              
              if (firstImage.width) {
                updateMetaTag('og:image:width', firstImage.width.toString(), 'property');
              }
              if (firstImage.height) {
                updateMetaTag('og:image:height', firstImage.height.toString(), 'property');
              }
              if (firstImage.alt) {
                updateMetaTag('og:image:alt', firstImage.alt, 'property');
              }
              if (firstImage.type) {
                updateMetaTag('og:image:type', firstImage.type, 'property');
              }
            }
          }

          // Update Twitter Card tags
          if (newMetadata.twitter) {
            const twitter = newMetadata.twitter;
            
            if (twitter.card) {
              updateMetaTag('twitter:card', twitter.card);
            }
            if (twitter.site) {
              updateMetaTag('twitter:site', twitter.site);
            }
            if (twitter.creator) {
              updateMetaTag('twitter:creator', twitter.creator);
            }
            if (twitter.title) {
              updateMetaTag('twitter:title', twitter.title);
            }
            if (twitter.description) {
              updateMetaTag('twitter:description', twitter.description);
            }
            
            // Update Twitter images
            if (twitter.images && twitter.images.length > 0) {
              updateMetaTag('twitter:image', twitter.images[0]);
            }
          }

          // Update robots meta tag
          if (newMetadata.robots) {
            const robots = newMetadata.robots;
            const directives: string[] = [];
            
            if (robots.index !== undefined) {
              directives.push(robots.index ? 'index' : 'noindex');
            }
            if (robots.follow !== undefined) {
              directives.push(robots.follow ? 'follow' : 'nofollow');
            }
            if (robots.noarchive) {
              directives.push('noarchive');
            }
            if (robots.nosnippet) {
              directives.push('nosnippet');
            }
            if (robots.noimageindex) {
              directives.push('noimageindex');
            }
            if (robots.maxSnippet !== undefined) {
              directives.push(`max-snippet:${robots.maxSnippet}`);
            }
            if (robots.maxImagePreview) {
              directives.push(`max-image-preview:${robots.maxImagePreview}`);
            }
            if (robots.maxVideoPreview !== undefined) {
              directives.push(`max-video-preview:${robots.maxVideoPreview}`);
            }
            
            if (directives.length > 0) {
              updateMetaTag('robots', directives.join(', '));
            }
          }

          // Update structured data (JSON-LD)
          if (newMetadata.structuredData) {
            // Remove existing structured data script
            const existingScript = document.querySelector('script[type="application/ld+json"][data-metadata-context]');
            if (existingScript) {
              existingScript.remove();
            }

            // Add new structured data script
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.setAttribute('data-metadata-context', 'true');
            script.textContent = JSON.stringify(newMetadata.structuredData);
            document.head.appendChild(script);
          }
        }

        return updated;
      });
    }, DEBOUNCE_DELAY);
  }, []);

  /**
   * Set dynamic values for template resolution
   * Used to update breadcrumb labels and other dynamic content
   * 
   * @param values - Key-value pairs for template variables
   * 
   * @example
   * ```tsx
   * setDynamicValues({
   *   userName: 'John Doe',
   *   userId: '123'
   * });
   * ```
   */
  const setDynamicValues = useCallback((values: Record<string, string>) => {
    console.log('[MetadataContext] setDynamicValues called:', {
      values,
      isMounted: isMountedRef.current,
      currentDynamicValues: dynamicValues
    });
    if (!isMountedRef.current) {
      console.warn('[MetadataContext] Component not mounted, skipping setDynamicValues');
      return;
    }
    setDynamicValuesState(values);
    console.log('[MetadataContext] Dynamic values updated to:', values);
  }, [dynamicValues]);

  /**
   * Reset metadata to initial state
   * Clears all metadata and dynamic values
   * 
   * @example
   * ```tsx
   * resetMetadata();
   * ```
   */
  const resetMetadata = useCallback(() => {
    if (!isMountedRef.current) return;

    setMetadata(null);
    setDynamicValuesState({});

    // Clear debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    // Optionally clean up meta tags added by this context
    // (Keep this commented out to preserve server-rendered meta tags)
    /*
    if (typeof document !== 'undefined') {
      // Remove dynamic meta tags
      removeMetaTag('description');
      removeMetaTag('keywords');
      removeMetaTag('og:title', 'property');
      removeMetaTag('og:description', 'property');
      removeMetaTag('twitter:title');
      removeMetaTag('twitter:description');
      
      // Remove structured data
      const script = document.querySelector('script[type="application/ld+json"][data-metadata-context]');
      if (script) {
        script.remove();
      }
    }
    */
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      // Clear debounce timer on unmount
      if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
      }
    };
  }, []);

  const value: MetadataContextValue = {
    metadata,
    dynamicValues,
    updateMetadata,
    setDynamicValues,
    resetMetadata,
  };

  return (
    <MetadataContext.Provider value={value}>
      {children}
    </MetadataContext.Provider>
  );
}

/**
 * useMetadata hook
 * Access metadata context in components
 * 
 * @throws {Error} If used outside of MetadataProvider
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { updateMetadata, setDynamicValues } = useMetadata();
 *   
 *   useEffect(() => {
 *     updateMetadata({
 *       title: 'My Page',
 *       description: 'Page description'
 *     });
 *   }, []);
 *   
 *   return <div>Content</div>;
 * }
 * ```
 */
export function useMetadata(): MetadataContextValue {
  const context = useContext(MetadataContext);

  if (context === undefined) {
    throw new Error('useMetadata must be used within a MetadataProvider');
  }

  return context;
}
