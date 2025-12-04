'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp,
  User,
  FileText,
  ShoppingCart,
  Settings,
  AlertCircle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  LogIn,
  LogOut,
  UserPlus,
  Key,
} from 'lucide-react';
import { ActivityLog } from '@/types/activity-log';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLogItemProps {
  activity: ActivityLog;
}

/**
 * Get icon for action type
 */
function getActionIcon(action: string) {
  if (action.includes('LOGIN')) return LogIn;
  if (action.includes('LOGOUT')) return LogOut;
  if (action.includes('REGISTER')) return UserPlus;
  if (action.includes('PASSWORD')) return Key;
  if (action.includes('CREATED')) return Plus;
  if (action.includes('UPDATED')) return Edit;
  if (action.includes('DELETED')) return Trash2;
  if (action.includes('USER')) return User;
  if (action.includes('PRODUCT') || action.includes('ORDER')) return ShoppingCart;
  if (action.includes('PAGE') || action.includes('BLOG')) return FileText;
  if (action.includes('SETTINGS') || action.includes('MENU') || action.includes('WIDGET')) return Settings;
  if (action.includes('ERROR')) return XCircle;
  if (action.includes('WARNING')) return AlertCircle;
  return CheckCircle;
}

/**
 * Get color variant for action type
 */
function getActionColor(action: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (action.includes('DELETED') || action.includes('ERROR')) return 'destructive';
  if (action.includes('WARNING')) return 'outline';
  if (action.includes('CREATED') || action.includes('LOGIN')) return 'default';
  return 'secondary';
}

/**
 * Format action name for display
 */
function formatActionName(action: string): string {
  return action
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Parse user agent to extract browser and OS info
 */
function parseBrowser(userAgent: string): string {
  if (!userAgent) return 'Unknown';

  // Extract browser
  let browser = 'Unknown Browser';
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Extract OS
  let os = '';
  if (userAgent.includes('Windows NT 10.0')) {
    os = 'Windows 10';
  } else if (userAgent.includes('Windows NT')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  return os ? `${browser} on ${os}` : browser;
}

export function ActivityLogItem({ activity }: ActivityLogItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = getActionIcon(activity.action);
  const hasMetadata = activity.metadata && Object.keys(activity.metadata).length > 0;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={`
          flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center
          ${activity.action.includes('DELETED') || activity.action.includes('ERROR') 
            ? 'bg-destructive/10 text-destructive' 
            : activity.action.includes('CREATED') || activity.action.includes('LOGIN')
            ? 'bg-primary/10 text-primary'
            : 'bg-secondary text-secondary-foreground'
          }
        `}>
          <Icon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant={getActionColor(activity.action)}>
                  {formatActionName(activity.action)}
                </Badge>
                <span className="text-sm font-medium text-foreground">
                  {activity.actorName}
                </span>
              </div>
              
              {activity.entityType && (
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.entityType}
                  {activity.entityId && (
                    <span className="font-mono text-xs ml-1">
                      ({activity.entityId.slice(0, 8)}...)
                    </span>
                  )}
                </p>
              )}
            </div>

            <time 
              className="text-xs text-muted-foreground whitespace-nowrap"
              dateTime={activity.createdAt}
              title={new Date(activity.createdAt).toLocaleString()}
            >
              {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
            </time>
          </div>

          {/* Metadata toggle */}
          {hasMetadata && (
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" />
                      Hide details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" />
                      Show details
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                <div className="bg-muted rounded-md p-3">
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify(activity.metadata, null, 2)}
                  </pre>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Additional info */}
          {(activity.ipAddress || activity.userAgent) && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {activity.ipAddress && activity.ipAddress !== '::1' && activity.ipAddress !== '127.0.0.1' && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">IP:</span>
                    <span className="font-mono">{activity.ipAddress}</span>
                  </div>
                )}
                {activity.userAgent && (
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Browser:</span>
                    <span title={activity.userAgent}>
                      {parseBrowser(activity.userAgent)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
