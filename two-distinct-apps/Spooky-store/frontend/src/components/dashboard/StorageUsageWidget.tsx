'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { HardDrive, Image, FileText, User } from 'lucide-react';
import { mediaApi } from '@/lib/api/media';
import { UploadType } from '@/types/media';

interface StorageStats {
  total: number;
  byType: Record<UploadType, number>;
  byUser?: Record<string, { name: string; size: number }>;
}

export function StorageUsageWidget() {
  const [stats, setStats] = useState<StorageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStorageStats();
  }, []);

  const loadStorageStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all uploads to calculate stats
      const response = await mediaApi.getUploads({ limit: 1000 });
      
      const storageStats: StorageStats = {
        total: 0,
        byType: {
          [UploadType.IMAGE]: 0,
          [UploadType.DOCUMENT]: 0,
          [UploadType.AVATAR]: 0,
          [UploadType.EDITOR_IMAGE]: 0,
        },
        byUser: {},
      };

      response.data.forEach((upload) => {
        storageStats.total += upload.size;
        storageStats.byType[upload.type] += upload.size;

        // Track per-user stats
        const userName = upload.uploadedBy.name || upload.uploadedBy.email;
        if (!storageStats.byUser![userName]) {
          storageStats.byUser![userName] = { name: userName, size: 0 };
        }
        storageStats.byUser![userName].size += upload.size;
      });

      setStats(storageStats);
    } catch (err) {
      console.error('Failed to load storage stats:', err);
      setError('Failed to load storage statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getTypeIcon = (type: UploadType) => {
    switch (type) {
      case UploadType.IMAGE:
      case UploadType.EDITOR_IMAGE:
        return <Image className="h-4 w-4" />;
      case UploadType.DOCUMENT:
        return <FileText className="h-4 w-4" />;
      case UploadType.AVATAR:
        return <User className="h-4 w-4" />;
      default:
        return <HardDrive className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: UploadType): string => {
    switch (type) {
      case UploadType.IMAGE:
        return 'Images';
      case UploadType.DOCUMENT:
        return 'Documents';
      case UploadType.AVATAR:
        return 'Avatars';
      case UploadType.EDITOR_IMAGE:
        return 'Editor Images';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <HardDrive className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">{error || 'No storage data available'}</p>
        </div>
      </Card>
    );
  }

  const maxStorage = 10 * 1024 * 1024 * 1024; // 10GB limit
  const usagePercentage = (stats.total / maxStorage) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Storage Usage</h3>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatBytes(stats.total)} / {formatBytes(maxStorage)}
          </span>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <Progress value={usagePercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {usagePercentage.toFixed(1)}% used
          </p>
        </div>

        {/* Breakdown by Type */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">By Type</h4>
          {Object.entries(stats.byType).map(([type, size]) => {
            if (size === 0) return null;
            const percentage = (size / stats.total) * 100;
            return (
              <div key={type} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(type as UploadType)}
                    <span>{getTypeLabel(type as UploadType)}</span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatBytes(size)} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-1" />
              </div>
            );
          })}
        </div>

        {/* Per-User Stats (for admins) */}
        {stats.byUser && Object.keys(stats.byUser).length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-sm font-medium">By User</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {Object.values(stats.byUser)
                .sort((a, b) => b.size - a.size)
                .slice(0, 5)
                .map((user) => {
                  const percentage = (user.size / stats.total) * 100;
                  return (
                    <div
                      key={user.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="truncate flex-1">{user.name}</span>
                      <span className="text-muted-foreground ml-2">
                        {formatBytes(user.size)} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
