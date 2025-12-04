'use client';

import { useState } from 'react';
import { CronLog } from '@/types/cron-job';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface ExecutionHistoryProps {
  logs: CronLog[];
  loading: boolean;
  onRefresh: () => void;
}

export function ExecutionHistory({ logs, loading, onRefresh }: ExecutionHistoryProps) {
  const [filter, setFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [selectedLog, setSelectedLog] = useState<CronLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'success') return log.status === 'SUCCESS';
    if (filter === 'failed') return log.status === 'FAILED';
    return true;
  });

  const getStatusBadge = (status: CronLog['status']) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      case 'RUNNING':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
    }
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPpp');
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Execution History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No execution logs found
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="border border-border rounded-lg p-3 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(log.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(log.startedAt)}
                          </span>
                        </div>
                        {log.error && (
                          <p className="text-sm text-destructive line-clamp-2 mt-1">
                            {log.error}
                          </p>
                        )}
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">{formatDuration(log.duration)}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Execution Details
              {selectedLog && getStatusBadge(selectedLog.status)}
            </DialogTitle>
            <DialogDescription>
              {selectedLog && formatDateTime(selectedLog.startedAt)}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <div className="font-medium">{formatDateTime(selectedLog.startedAt)}</div>
                  </div>
                  {selectedLog.completedAt && (
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <div className="font-medium">
                        {formatDateTime(selectedLog.completedAt)}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <div className="font-medium">{formatDuration(selectedLog.duration)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                </div>

                {selectedLog.error && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="font-semibold text-sm">Error Message</span>
                    </div>
                    <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                      {selectedLog.error}
                    </div>
                  </div>
                )}

                {selectedLog.stackTrace && (
                  <div>
                    <span className="font-semibold text-sm">Stack Trace</span>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto mt-2">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}

                {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                  <div>
                    <span className="font-semibold text-sm">Metadata</span>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto mt-2">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
