import { Metadata } from 'next';
import ShippingPageClient from './ShippingPageClient';

export const metadata: Metadata = {
  title: 'Shipping Methods | Dashboard',
  description: 'Manage shipping methods and rates',
};

export default function ShippingPage() {
  return <ShippingPageClient />;
}
