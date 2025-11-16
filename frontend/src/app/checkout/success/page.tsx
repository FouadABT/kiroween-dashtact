import { Metadata } from 'next';
import { Suspense } from 'react';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import SuccessClient from './SuccessClient';

export const metadata: Metadata = generatePageMetadata('/checkout/success');

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuccessClient />
    </Suspense>
  );
}
