import { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/metadata-helpers';
import SuccessClient from './SuccessClient';

export const metadata: Metadata = generatePageMetadata('/checkout/success');

export default function CheckoutSuccessPage() {
  return <SuccessClient />;
}
