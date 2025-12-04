'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ActivityItem, BaseWidgetProps } from '../types/widget.types';
import { format } from 'date-fns';
import { Circle, Clock } from 'lucide-react';

type TimelineOrientation = 'vertical' | 'horizontal';

interface TimelineProps extends BaseWidgetProps {
  items: ActivityItem[];
  orientation?: TimelineOrientation;
  onItemClick?: (item: ActivityItem) => void;
  title?: string;
  maxHeight?: string;
  showTime?: boolean;
  groupByDate?: boolean;
}

interface TimelineItemProps {
  item: ActivityItem;
  isLast: boolean;
  orientation: TimelineOrientation;
  onItemClick?: (item: ActivityItem) => void;
  showTime: boolean;
}

function TimelineItem({
  item,
  isLast,
  orientation,
  onItemClick,
  showTime,
}: TimelineItemProps) {
  const handleClick = () => {
    onItemClick?.(item);
  };

  if (orientation === 'horizontal') {
    return (
      <div className="flex flex-col items-center min-w-[200px]">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground cursor-pointer hover:scale-110 transition-transform ${
            onItemClick ? 'cursor-pointer' : ''
          }`}
          onClick={handleClick}
        >
          <Circle className="h-5 w-5" />
        </div>
        {!isLast && (
          <div className="w-full h-0.5 bg-border my-2" />
        )}
        <div className="text-center mt-2">
          <div className="text-xs text-muted-foreground mb-1">
            {format(item.timestamp, 'MMM d, yyyy')}
            {showTime && (
              <span className="ml-1">{format(item.timestamp, 'h:mm a')}</span>
            )}
          </div>
          <div className="font-medium text-sm">{item.title}</div>
          {item.description && (
            <div className="text-xs text-muted-foreground mt-1">
              {item.description}
            </div>
          )}
          {item.user && (
            <div className="text-xs text-muted-foreground mt-1">
              by {item.user.name}
            </div>
          )}
          {item.metadata && (
            <div className="flex flex-wrap gap-1 justify-center mt-2">
              {Object.entries(item.metadata).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {String(value)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground flex-shrink-0 ${
            onItemClick ? 'cursor-pointer hover:scale-110' : ''
          } transition-transform`}
          onClick={handleClick}
        >
          <Circle className="h-5 w-5" />
        </div>
        {!isLast && <div className="w-0.5 flex-1 bg-border mt-2" />}
      </div>
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between mb-1">
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {format(item.timestamp, 'MMM d, yyyy')}
              {showTime && (
                <span className="ml-1">{format(item.timestamp, 'h:mm a')}</span>
              )}
            </span>
          </div>
          {item.type && (
            <Badge variant="outline" className="text-xs">
              {item.type}
            </Badge>
          )}
        </div>
        <div
          className={`${
            onItemClick ? 'cursor-pointer hover:bg-accent' : ''
          } p-3 rounded-lg border bg-card transition-colors`}
          onClick={handleClick}
        >
          <h4 className="font-medium text-sm mb-1">{item.title}</h4>
          {item.description && (
            <p className="text-sm text-muted-foreground mb-2">
              {item.description}
            </p>
          )}
          {item.user && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {item.user.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.user.avatar}
                  alt={item.user.name}
                  className="w-5 h-5 rounded-full"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                  {item.user.name.charAt(0).toUpperCase()}
                </div>
              )}
              <span>{item.user.name}</span>
            </div>
          )}
          {item.metadata && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(item.metadata).map(([key, value]) => (
                <Badge key={key} variant="secondary" className="text-xs">
                  {key}: {String(value)}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Timeline({
  items,
  orientation = 'vertical',
  onItemClick,
  title = 'Timeline',
  maxHeight = '600px',
  showTime = true,
  groupByDate = false,
  permission,
  className = '',
}: TimelineProps) {
  const sortedItems = [...items].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  const groupedItems = groupByDate
    ? sortedItems.reduce((acc, item) => {
        const dateKey = format(item.timestamp, 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
      }, {} as Record<string, ActivityItem[]>)
    : { all: sortedItems };

  const content = (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No timeline items to display
          </div>
        ) : orientation === 'horizontal' ? (
          <ScrollArea className="w-full">
            <div className="flex gap-4 pb-4">
              {sortedItems.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === sortedItems.length - 1}
                  orientation={orientation}
                  onItemClick={onItemClick}
                  showTime={showTime}
                />
              ))}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea style={{ maxHeight }}>
            {groupByDate ? (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([dateKey, dateItems]) => (
                  <div key={dateKey}>
                    <div className="sticky top-0 bg-background z-10 py-2 mb-4">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                      </h3>
                    </div>
                    {dateItems.map((item, index) => (
                      <TimelineItem
                        key={item.id}
                        item={item}
                        isLast={index === dateItems.length - 1}
                        orientation={orientation}
                        onItemClick={onItemClick}
                        showTime={showTime}
                      />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              sortedItems.map((item, index) => (
                <TimelineItem
                  key={item.id}
                  item={item}
                  isLast={index === sortedItems.length - 1}
                  orientation={orientation}
                  onItemClick={onItemClick}
                  showTime={showTime}
                />
              ))
            )}
          </ScrollArea>
        )}
      </CardContent>
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
