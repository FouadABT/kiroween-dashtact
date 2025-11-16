/**
 * UserCard Component
 * 
 * Displays user information in a card format with avatar, name, email,
 * and optional action buttons. Supports permission-based access control.
 * 
 * @example
 * ```tsx
 * <UserCard
 *   user={{
 *     id: '1',
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     avatar: '/avatars/john.jpg',
 *     role: 'Admin',
 *     status: 'online'
 *   }}
 *   actions={[
 *     { label: 'Edit', onClick: handleEdit, permission: 'users:write' },
 *     { label: 'Delete', onClick: handleDelete, permission: 'users:delete', variant: 'destructive' }
 *   ]}
 * />
 * ```
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Mail, Phone, MapPin, Calendar, LucideIcon } from 'lucide-react';
import { BaseWidgetProps } from '../types/widget.types';

export interface UserCardUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  phone?: string;
  location?: string;
  joinedDate?: Date | string;
  bio?: string;
  [key: string]: unknown;
}

export interface UserCardAction {
  label: string;
  onClick: (user: UserCardUser) => void;
  icon?: LucideIcon;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  permission?: string;
}

export interface UserCardProps extends BaseWidgetProps {
  /** User data to display */
  user: UserCardUser;
  /** Action buttons to display */
  actions?: UserCardAction[];
  /** Show additional details */
  showDetails?: boolean;
  /** Compact mode */
  compact?: boolean;
  /** Click handler for the card */
  onClick?: (user: UserCardUser) => void;
}

/**
 * Get user initials from name
 */
function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get status badge variant
 */
function getStatusVariant(status?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'online':
      return 'default';
    case 'away':
      return 'secondary';
    case 'busy':
      return 'destructive';
    default:
      return 'outline';
  }
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function UserCard({
  user,
  actions = [],
  showDetails = true,
  compact = false,
  onClick,
  permission,
  className = '',
}: UserCardProps) {
  // Safety check for user object
  if (!user || typeof user !== 'object') {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No user data available
          </p>
        </div>
      </Card>
    );
  }

  const content = (
    <Card 
      className={`p-6 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={() => onClick?.(user)}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Avatar className={compact ? 'h-12 w-12' : 'h-16 w-16'}>
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getUserInitials(user.name || 'User')}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-foreground truncate">
                {user.name}
              </h3>
              <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {user.email}
              </p>
            </div>

            {/* Status Badge */}
            {user.status && (
              <Badge variant={getStatusVariant(user.status)}>
                {user.status}
              </Badge>
            )}
          </div>

          {/* Role */}
          {user.role && (
            <div className="mt-2">
              <Badge variant="outline">{user.role}</Badge>
            </div>
          )}

          {/* Bio */}
          {!compact && user.bio && (
            <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
              {user.bio}
            </p>
          )}

          {/* Additional Details */}
          {!compact && showDetails && (
            <div className="mt-4 space-y-2">
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.joinedDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(user.joinedDate)}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {actions.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {actions.map((action, index) => {
                const button = (
                  <Button
                    key={index}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      action.onClick(user);
                    }}
                  >
                    {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                    {action.label}
                  </Button>
                );

                if (action.permission) {
                  return (
                    <PermissionGuard key={index} permission={action.permission} fallback={null}>
                      {button}
                    </PermissionGuard>
                  );
                }

                return button;
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );

  if (permission) {
    return (
      <PermissionGuard permission={permission} fallback={null}>
        {content}
      </PermissionGuard>
    );
  }

  return content;
}
