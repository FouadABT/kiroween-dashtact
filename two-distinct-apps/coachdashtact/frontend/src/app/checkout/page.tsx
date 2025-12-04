import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import CheckoutPageClient from './CheckoutPageClient';

export const metadata: Metadata = generatePageMetadata('/checkout');

export default function CheckoutPage() {
  return <CheckoutPageClient />;
}
