/**
 * Slug Generation and Validation Utilities
 * 
 * Provides client-side slug generation and validation helpers
 * for the blog system.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Generate a URL-friendly slug from a title
 * 
 * @param title - The title to convert to a slug
 * @returns URL-friendly slug
 * 
 * @example
 * generateSlug('Hello World!') // 'hello-world'
 * generateSlug('My First Post - 2024') // 'my-first-post-2024'
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Validate if a slug is available
 * 
 * @param slug - The slug to validate
 * @param excludeId - Optional post ID to exclude from validation (for editing)
 * @param token - Authentication token
 * @returns Validation result with availability status and suggestions
 */
export async function validateSlug(
  slug: string,
  excludeId?: string,
  token?: string | null,
): Promise<{
  available: boolean;
  slug: string;
  message: string;
  existingPost?: {
    id: string;
    title: string;
    status: string;
  };
  suggestions?: string[];
}> {
  try {
    const url = new URL(`${API_BASE_URL}/blog/validate-slug/${encodeURIComponent(slug)}`);
    if (excludeId) {
      url.searchParams.append('excludeId', excludeId);
    }

    const response = await fetch(url.toString(), {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to validate slug');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating slug:', error);
    return {
      available: false,
      slug,
      message: 'Unable to validate slug. Please try again.',
    };
  }
}

/**
 * Generate a unique slug from a title
 * 
 * @param title - The title to convert to a slug
 * @param excludeId - Optional post ID to exclude from validation (for editing)
 * @param token - Authentication token
 * @returns Unique slug and whether it was modified
 */
export async function generateUniqueSlug(
  title: string,
  excludeId?: string,
  token?: string | null,
): Promise<{
  slug: string;
  isUnique: boolean;
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/blog/generate-slug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ title, excludeId }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate slug');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating slug:', error);
    // Fallback to client-side generation
    const slug = generateSlug(title);
    return {
      slug,
      isUnique: true,
    };
  }
}

/**
 * Format a slug for display
 * Shows the full URL path
 * 
 * @param slug - The slug to format
 * @returns Formatted URL path
 */
export function formatSlugPreview(slug: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return `${baseUrl}/blog/${slug}`;
}

/**
 * Validate slug format (client-side)
 * Checks if slug follows URL-friendly conventions
 * 
 * @param slug - The slug to validate
 * @returns Validation result
 */
export function validateSlugFormat(slug: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!slug) {
    errors.push('Slug cannot be empty');
    return { valid: false, errors };
  }

  if (slug.length < 3) {
    errors.push('Slug must be at least 3 characters long');
  }

  if (slug.length > 200) {
    errors.push('Slug must be less than 200 characters');
  }

  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
  }

  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Slug cannot start or end with a hyphen');
  }

  if (/--/.test(slug)) {
    errors.push('Slug cannot contain consecutive hyphens');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Debounce function for slug validation
 * Prevents excessive API calls while typing
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
