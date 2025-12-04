'use client';

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Menu, 
  Search, 
  Bell, 
  ChevronRight,
  User,
  Sun,
  Moon,
  Settings,
  HelpCircle,
  LogOut
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
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { MessageIcon } from "@/components/messaging/MessageIcon";
import { MessagePanel } from "@/components/messaging/MessagePanel";
import { GlobalSearchBar } from "@/components/search/GlobalSearchBar";
import { SearchDialog } from "@/components/search/SearchDialog";
import { useSearchShortcut } from "@/hooks/useSearchShortcut";

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
  const [avatarKey, setAvatarKey] = useState(Date.now());

  // Update avatar key when user avatar changes
  useEffect(() => {
    console.log('[Header] User avatar changed:', user?.avatarUrl);
    setAvatarKey(Date.now());
  }, [user?.avatarUrl]);
  const { resolvedTheme, setThemeMode } = useTheme();
  const { isOpen, openSearch, closeSearch } = useSearchShortcut();

  // Log user avatar info for debugging
  console.log('[Header] Rendering with user:', {
    hasUser: !!user,
    userId: user?.id,
    userName: user?.name,
    avatarUrl: user?.avatarUrl,
    hasAvatar: !!user?.avatarUrl
  });

  const toggleTheme = () => {
    const newMode = resolvedTheme === 'light' ? 'dark' : 'light';
    console.log('[Header] Toggling theme from', resolvedTheme, 'to', newMode);
    setThemeMode(newMode);
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
        <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" aria-hidden="true" />
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
        {/* Global Search Bar */}
        <div className="hidden md:flex md:items-center">
          <GlobalSearchBar />
        </div>

        {/* Mobile search button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="md:hidden p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="Open search"
          type="button"
          onClick={openSearch}
        >
          <Search className="h-4 w-4 text-foreground" aria-hidden="true" />
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
            <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" aria-hidden="true" />
          ) : (
            <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" aria-hidden="true" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <NotificationCenter />

        {/* Messages */}
        <MessageIcon />

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" />

        {/* Profile dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="relative h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`User menu for ${user?.name || 'User'}`}
              aria-haspopup="menu"
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                <AvatarImage 
                  src={user?.avatarUrl ? `${user.avatarUrl}?t=${avatarKey}` : undefined} 
                  alt={`${user?.name || 'User'} profile picture`}
                  key={`header-avatar-${avatarKey}`}
                />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm font-semibold">
                  {user?.name 
                    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                    : <User className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                  }
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            className="w-64 sm:w-72" 
            align="end" 
            forceMount
            role="menu"
            aria-label="User account menu"
          >
            {/* User Info Header with Avatar */}
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user?.avatarUrl ? `${user.avatarUrl}?t=${avatarKey}` : undefined} 
                    alt={`${user?.name || 'User'} profile picture`}
                    key={`header-dropdown-avatar-${avatarKey}`}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                    {user?.name 
                      ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                      : <User className="h-5 w-5" aria-hidden="true" />
                    }
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none truncate">{user?.name || 'User'}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                  {user?.role && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 w-fit">
                      {user.role.name}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Menu Items */}
            <DropdownMenuItem asChild role="menuitem" className="cursor-pointer">
              <Link href="/dashboard/profile" className="flex items-center py-2">
                <User className="mr-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Profile</span>
                  <span className="text-xs text-muted-foreground">View and edit your profile</span>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem asChild role="menuitem" className="cursor-pointer">
              <Link href="/dashboard/settings" className="flex items-center py-2">
                <Settings className="mr-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Settings</span>
                  <span className="text-xs text-muted-foreground">Manage your preferences</span>
                </div>
              </Link>
            </DropdownMenuItem>
            
            <DropdownMenuItem role="menuitem" className="cursor-pointer py-2">
              <HelpCircle className="mr-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">Support</span>
                <span className="text-xs text-muted-foreground">Get help and support</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={logout} 
              role="menuitem" 
              className="cursor-pointer py-2 text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950"
            >
              <LogOut className="mr-3 h-4 w-4" aria-hidden="true" />
              <span className="text-sm font-medium">Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Message Panel */}
      <MessagePanel />

      {/* Search Dialog */}
      <SearchDialog open={isOpen} onOpenChange={closeSearch} />
    </header>
  );
}
