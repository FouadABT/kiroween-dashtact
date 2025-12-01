import { redirect } from 'next/navigation';
import { BrandingApi } from '@/lib/api/branding';

export async function GET() {
  try {
    const branding = await BrandingApi.getBrandSettings();
    
    if (branding.faviconUrl) {
      // Redirect to the actual favicon URL from database
      redirect(branding.faviconUrl);
    }
  } catch (error) {
    // Only log in development, suppress during build
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch branding for favicon:', error);
    }
  }

  // Fallback to a simple SVG if no custom favicon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="#000" width="100" height="100"/></svg>`;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
