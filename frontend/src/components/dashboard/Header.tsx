"use client";

import Link from "next/link";
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronRight,
  User,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigation } from "@/contexts/NavigationContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Optional custom breadcrumbs to override defaults */
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
  /** Optional callback when search is performed */
  onSearch?: (query: string) => void;
  /** Optional callback when notifications are clicked */
  onNotificationClick?: () => void;
}

export function Header() {
  const { setSidebarOpen, breadcrumbs } = useNavigation();
  const { user, logout } = useAuth();
  const { resolvedTheme, setThemeMode } = useTheme();

  const toggleTheme = () => {
    setThemeMode(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 sm:h-16 shrink-0 items-center gap-x-2 sm:gap-x-4 border-b border-border bg-background px-3 sm:px-4 shadow-sm lg:gap-x-6 lg:px-8">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="lg:hidden p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={false}
        type="button"
      >
        <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
        <span className="sr-only">Open sidebar</span>
      </Button>

      {/* Separator */}
      <div className="h-4 sm:h-6 w-px bg-border lg:hidden" />

      {/* Breadcrumbs */}
      <div className="flex flex-1 gap-x-2 sm:gap-x-4 self-stretch lg:gap-x-6 min-w-0">
        <nav 
          className="flex items-center space-x-1 text-xs sm:text-sm text-muted-foreground overflow-hidden"
          aria-label="Breadcrumb navigation"
        >
          <ol className="flex items-center space-x-1">
            {breadcrumbs.map((item, index) => (
              <li key={item.title} className="flex items-center min-w-0">
                {index > 0 && (
                  <ChevronRight 
                    className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/60 mx-0.5 sm:mx-1 flex-shrink-0" 
                    aria-hidden="true"
                  />
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors truncate focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded px-1"
                    aria-current={index === breadcrumbs.length - 1 ? "page" : undefined}
                  >
                    {item.title}
                  </Link>
                ) : (
                  <span 
                    className="text-foreground font-medium truncate"
                    aria-current="page"
                  >
                    {item.title}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-x-2 sm:gap-x-3 lg:gap-x-4">
        {/* Search bar - placeholder */}
        <div className="hidden md:flex md:items-center">
          <div className="relative">
            <label htmlFor="search-input" className="sr-only">
              Search dashboard
            </label>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 sm:pl-3">
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground/60 transition-colors" aria-hidden="true" />
            </div>
            <input
              id="search-input"
              type="text"
              placeholder="Search..."
              className="block w-32 sm:w-40 lg:w-48 rounded-md border border-input bg-muted/50 py-1.5 pl-8 sm:pl-10 pr-2 sm:pr-3 text-foreground placeholder:text-muted-foreground/60 focus:bg-background focus:ring-2 focus:ring-ring focus:scale-[1.02] text-xs sm:text-sm leading-6 transition-all duration-200 focus:outline-none"
              aria-describedby="search-description"
            />
            <div id="search-description" className="sr-only">
              Search through dashboard content and navigation
            </div>
          </div>
        </div>

        {/* Mobile search button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open search"
          type="button"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Switch to ${resolvedTheme === 'light' ? 'dark' : 'light'} mode`}
          type="button"
        >
          {resolvedTheme === 'light' ? (
            <Moon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative transition-all duration-200 hover:scale-110 active:scale-95 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="View notifications (3 unread)"
          type="button"
        >
          <Bell className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-200 hover:rotate-12" aria-hidden="true" />
          <span className="sr-only">View notifications</span>
          {/* Notification badge */}
          <span 
            className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse"
            aria-label="3 unread notifications"
          >
            <span className="hidden sm:inline">3</span>
            <span className="sm:hidden text-[10px]">3</span>
          </span>
        </Button>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

        {/* Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`User menu for ${user?.name || 'User'}`}
              aria-haspopup="menu"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage src="/avatars/01.png" alt={`${user?.name || 'User'} profile picture`} />
                <AvatarFallback>
                  <User className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-48 sm:w-56" 
            align="end" 
            forceMount
            role="menu"
            aria-label="User account menu"
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none truncate">{user?.name || 'User'}</p>
                <p className="text-xs leading-none text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem role="menuitem">
              <User className="mr-2 h-4 w-4" aria-hidden="true" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem role="menuitem">
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem role="menuitem">
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} role="menuitem">
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}