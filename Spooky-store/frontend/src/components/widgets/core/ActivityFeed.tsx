'use client';

"use client";

import React, { useState } from "react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { WidgetContainer } from "./WidgetContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { BaseWidgetProps, ActivityItem } from "../types/widget.types";

/**
 * Props for the ActivityFeed component
 */
export interface ActivityFeedProps extends BaseWidgetProps {
  /** Array of activity items */
  activities: ActivityItem[];
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
  /** Group activities by date */
  groupByDate?: boolean;
  /** Maximum number of visible items (default: 10) */
  maxItems?: number;
  /** Show "show more" button */
  showMoreButton?: boolean;
}

/**
 * Format date for grouping
 */
function formatDateGroup(date: Date): string {
  if (isToday(date)) {
    return "Today";
  }
  if (isYesterday(date)) {
    return "Yesterday";
  }
  return format(date, "MMMM d, yyyy");
}

/**
 * Get user initials from name
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * ActivityFeed Component
 * 
 * Displays a timeline of activity items with user avatars and timestamps.
 * Supports date grouping and "show more" functionality.
 * 
 * @example Basic usage
 * ```tsx
 * <ActivityFeed
 *   activities={[
 *     {
 *       id: '1',
 *       type: 'user_created',
 *       title: 'New user registered',
 *       description: 'John Doe joined the platform',
 *       timestamp: new Date(),
 *       user: { name: 'John Doe', avatar: '/avatar.jpg' }
 *     },
 *   ]}
 * />
 * ```
 * 
 * @example With date grouping
 * ```tsx
 * <ActivityFeed
 *   title="Recent Activity"
 *   activities={activities}
 *   groupByDate={true}
 *   maxItems={5}
 *   showMoreButton={true}
 * />
 * ```
 */
export function ActivityFeed({
  activities = [],
  title = "Activity Feed",
  description,
  groupByDate = false,
  maxItems = 10,
  showMoreButton = true,
  loading = false,
  error,
  permission,
  className,
}: ActivityFeedProps) {
  const [showAll, setShowAll] = useState(false);

  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : [];

  // Limit visible items
  const visibleActivities = showAll
    ? safeActivities
    : safeActivities.slice(0, maxItems);

  // Group activities by date if enabled
  const groupedActivities = groupByDate
    ? visibleActivities.reduce((groups, activity) => {
        const dateKey = formatDateGroup(activity.timestamp);
        if (!groups[dateKey]) {
          groups[dateKey] = [];
        }
        groups[dateKey].push(activity);
        return groups;
      }, {} as Record<string, ActivityItem[]>)
    : { All: visibleActivities };

  return (
    <WidgetContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      permission={permission}
      className={className}
    >
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([dateGroup, items]) => (
            <div key={dateGroup}>
              {/* Date Group Header */}
              {groupByDate && (
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  {dateGroup}
                </h3>
              )}

              {/* Activity Items */}
              <div className="space-y-4">
                {items.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={cn(
                      "flex gap-3 pb-4",
                      index !== items.length - 1 && "border-b border-border"
                    )}
                  >
                    {/* User Avatar */}
                    {activity.user && (
                      <Avatar className="h-10 w-10">
                        {activity.user.avatar && (
                          <AvatarImage
                            src={activity.user.avatar}
                            alt={activity.user.name}
                          />
                        )}
                        <AvatarFallback>
                          {getInitials(activity.user.name)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    {/* Activity Content */}
                    <div className="flex-1 space-y-1">
                      {/* Title and User */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {activity.title}
                          </p>
                          {activity.user && (
                            <p className="text-xs text-muted-foreground">
                              {activity.user.name}
                            </p>
                          )}
                        </div>
                        {/* Timestamp */}
                        <time
                          className="text-xs text-muted-foreground whitespace-nowrap"
                          dateTime={activity.timestamp.toISOString()}
                          title={format(activity.timestamp, "PPpp")}
                        >
                          {formatDistanceToNow(activity.timestamp, {
                            addSuffix: true,
                          })}
                        </time>
                      </div>

                      {/* Description */}
                      {activity.description && (
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      )}

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {Object.entries(activity.metadata).map(
                            ([key, value]) => (
                              <span
                                key={key}
                                className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground"
                              >
                                {key}: {String(value)}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Show More Button */}
      {showMoreButton && safeActivities.length > maxItems && !showAll && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(true)}
          >
            Show More ({safeActivities.length - maxItems} more)
          </Button>
        </div>
      )}

      {/* Show Less Button */}
      {showMoreButton && showAll && safeActivities.length > maxItems && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(false)}
          >
            Show Less
          </Button>
        </div>
      )}

      {/* Empty State */}
      {safeActivities.length === 0 && !loading && !error && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No activity to display
          </p>
        </div>
      )}
    </WidgetContainer>
  );
}

