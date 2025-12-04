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

  // Fallback to default dark logo if no custom favicon
  redirect('/logo dark.png');
}
