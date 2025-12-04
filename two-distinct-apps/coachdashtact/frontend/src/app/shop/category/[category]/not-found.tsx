import Link from 'next/link';
import { ShoppingBag, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CategoryNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <ShoppingBag className="mb-6 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-3xl font-bold">Category Not Found</h1>
        <p className="mb-8 max-w-md text-muted-foreground">
          The category you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="default">
            <Link href="/shop">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse All Products
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
