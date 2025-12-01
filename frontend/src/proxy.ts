import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Proxy for Feature Flag-Based Route Handling
 * 
 * This proxy handles routing based on feature flags:
 * - Landing page: Controls root route (/) behavior
 * - Blog: Controls blog routes (/blog, /blog/*) accessibility
 * 
 * The proxy runs on every request matching the configured paths.
 */

/**
 * Proxy function
 * 
 * Handles route protection and redirection based on feature flags.
 * 
 * @param request - The incoming Next.js request
 * @returns NextResponse with redirect or next()
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check feature flags from environment variables
  const landingEnabled = process.env.NEXT_PUBLIC_ENABLE_LANDING === 'true';
  const blogEnabled = process.env.NEXT_PUBLIC_ENABLE_BLOG === 'true';
  
  // Root route handling
  if (pathname === '/') {
    if (!landingEnabled) {
      // Landing page is disabled - redirect based on authentication
      // Check for auth token in cookies
      const authToken = request.cookies.get('auth-token')?.value;
      
      // Redirect to dashboard if authenticated, otherwise to login
      const redirectUrl = authToken ? '/dashboard' : '/login';
      
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    // Landing page is enabled - allow access
    return NextResponse.next();
  }
  
  // Blog route handling
  if (pathname.startsWith('/blog')) {
    if (!blogEnabled) {
      // Blog is disabled - return 404
      return NextResponse.rewrite(new URL('/404', request.url));
    }
    // Blog is enabled - allow access
    return NextResponse.next();
  }
  
  // Allow all other routes
  return NextResponse.next();
}

/**
 * Proxy configuration
 * 
 * Specifies which routes the proxy should run on.
 * Uses Next.js matcher syntax for path matching.
 * 
 * Matched routes:
 * - / (root route)
 * - /blog (blog listing)
 * - /blog/* (all blog sub-routes)
 */
export const config = {
  matcher: [
    '/',
    '/blog/:path*',
  ],
};
