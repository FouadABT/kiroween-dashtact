import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import ShippingPageClient from './ShippingPageClient';

export const metadata: Metadata = generatePageMetadata('/dashboard/ecommerce/shipping');

export default function ShippingPage() {
  return <ShippingPageClient />;
}
