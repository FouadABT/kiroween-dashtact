import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

/**
 * Blog Post Not Found Page
 * 
 * Displayed when a blog post with the requested slug doesn't exist.
 * Provides user-friendly message and navigation options.
 * 
 * Features:
 * - Clear error message
 * - Navigation back to blog listing
 * - Navigation to home page
 * - Responsive design
 * - Accessible with proper ARIA labels
 */

export default function BlogPostNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Post Not Found
          </h1>
          <p className="text-lg text-muted-foreground">
            The blog post you're looking for doesn't exist or has been removed.
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground">
          This could be because the post was deleted, the URL is incorrect, or the post hasn't been published yet.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <div className="pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact support or try searching for the content you're looking for.
          </p>
        </div>
      </div>
    </div>
  );
}
