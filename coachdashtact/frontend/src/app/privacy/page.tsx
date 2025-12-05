import { Metadata } from 'next';
import { legalPagesApi } from '@/lib/api/legal-pages';

export const revalidate = 3600; // Revalidate every 1 hour (ISR)

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn how we collect, use, and protect your personal information in our Privacy Policy.',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function PrivacyPage() {
  let legalPage = null;
  let error = null;

  try {
    legalPage = await legalPagesApi.getLegalPage('privacy');
  } catch (err) {
    // Only log in development, suppress during build
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to fetch Privacy Policy:', err);
    }
    error = 'Failed to load Privacy Policy';
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="bg-card text-card-foreground border border-border rounded-lg p-8 shadow-sm">
          <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
          
          {legalPage?.updatedAt && (
            <p className="text-sm text-muted-foreground mb-8">
              Last updated: {new Date(legalPage.updatedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-4 mb-6">
              <p>{error}</p>
            </div>
          )}

          {!legalPage && !error && (
            <div className="bg-muted text-muted-foreground rounded-lg p-6 text-center">
              <p className="text-lg">Privacy Policy content is being prepared.</p>
              <p className="text-sm mt-2">Please check back later.</p>
            </div>
          )}

          {legalPage && (
            <div 
              className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:text-foreground prose-headings:font-semibold
                prose-p:text-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-foreground prose-ol:text-foreground
                prose-li:text-foreground prose-li:marker:text-muted-foreground
                prose-blockquote:text-muted-foreground prose-blockquote:border-border
                prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:text-foreground prose-pre:border prose-pre:border-border"
              dangerouslySetInnerHTML={{ __html: legalPage.content }}
            />
          )}
        </article>
      </div>
    </div>
  );
}
