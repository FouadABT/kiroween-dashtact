'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Sun, Moon, Menu, X, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { useCustomerAuth } from '@/contexts/CustomerAuthContext';
import { CartApi } from '@/lib/api';

export function StorefrontHeader() {
  const router = useRouter();
  const { resolvedTheme, setThemeMode } = useTheme();
  const { user: customer, logout } = useCustomerAuth();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const sessionId = localStorage.getItem('cartSessionId');
        if (!sessionId) return;

        const cart = await CartApi.getCart(sessionId);
        const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        setCartItemCount(count);
      } catch (error) {
        console.error('Failed to fetch cart count:', error);
      }
    };

    fetchCartCount();

    const handleCartUpdate = () => fetchCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const toggleTheme = () => {
    setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/account/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Store</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/shop" className="text-sm font-medium transition-colors hover:text-primary">
              Shop
            </Link>
            <Link href="/shop?isFeatured=true" className="text-sm font-medium transition-colors hover:text-primary">
              Featured
            </Link>
            <Link href="/shop?inStock=true" className="text-sm font-medium transition-colors hover:text-primary">
              In Stock
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme" className="h-9 w-9">
              {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            <Button variant="ghost" size="icon" onClick={() => router.push('/cart')} aria-label="Shopping cart" className="relative h-9 w-9">
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge variant="destructive" className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </Badge>
              )}
            </Button>

            {customer ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {customer.customer?.firstName} {customer.customer?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{customer.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/account')}>
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/account/orders')}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => router.push('/account/login')} className="hidden md:flex">
                Login
              </Button>
            )}

            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden h-9 w-9" aria-label="Toggle menu">
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            <Link href="/shop" className="block px-2 py-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              Shop
            </Link>
            <Link href="/shop?isFeatured=true" className="block px-2 py-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              Featured
            </Link>
            <Link href="/shop?inStock=true" className="block px-2 py-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              In Stock
            </Link>
            {!customer && (
              <>
                <div className="border-t pt-3" />
                <Link href="/account/login" className="block px-2 py-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                  Login
                </Link>
                <Link href="/account/register" className="block px-2 py-2 text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
