/**
 * Image Proxy Utilities
 * 
 * Handles proxying of backend images through Next.js API route
 * to bypass localhost/private IP restrictions in production.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Check if a URL is a localhost/private IP URL
 */
export function isLocalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.')
    );
  } catch {
    return false;
  }
}

/**
 * Convert a backend image URL to a proxied URL
 * 
 * @param imageUrl - The original image URL from backend
 * @returns Proxied URL or original URL if not needed
 */
export function getProxiedImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/placeholder-image.png'; // Fallback image
  }

  // If it's a relative URL, make it absolute
  let fullUrl = imageUrl;
  if (imageUrl.startsWith('/')) {
    fullUrl = `${API_URL}${imageUrl}`;
  }

  // In development or if it's not a local URL, return as-is
  if (process.env.NODE_ENV === 'development' || !isLocalUrl(fullUrl)) {
    return fullUrl;
  }

  // In production with localhost URL, proxy it
  return `/api/image-proxy?url=${encodeURIComponent(fullUrl)}`;
}

/**
 * Get image URL for Next.js Image component
 * Handles both absolute and relative URLs
 */
export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) {
    return '/placeholder-image.png';
  }

  // If it's already an absolute URL (http/https), use proxy if needed
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return getProxiedImageUrl(imageUrl);
  }

  // If it's a relative URL starting with /uploads, make it absolute
  if (imageUrl.startsWith('/uploads')) {
    return getProxiedImageUrl(`${API_URL}${imageUrl}`);
  }

  // Otherwise, assume it's a local public file
  return imageUrl;
}
