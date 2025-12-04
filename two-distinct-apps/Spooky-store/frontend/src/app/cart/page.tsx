import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import CartPageClient from './CartPageClient';

export const metadata: Metadata = generatePageMetadata('/cart');

export default function CartPage() {
  return <CartPageClient />;
}
