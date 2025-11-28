'use client';

/**
 * EmailLogsTable Component
 * 
 * Displays email delivery logs with:
 * - Recipient, subject, status, timestamp
 * - Color-coded status badges
 * - Pagination
 * - Row click for details
 * - Filters (date range, status, recipient)
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Search,
  Calendar as CalendarIcon,
  X,
  Copy,
  Check,
} from 'lucide-react';
import { emailLogsApi } from '@/lib/api/email';
import type { EmailLog, EmailStatus } from '@/types/email';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function EmailLogsTable() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<EmailStatus | 'all'>('all');
  const [recipientSearch, setRecipientSearch] = useState('');
  const [debouncedRecipient, setDebouncedRecipient] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  // Detail view
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Debounce recipient search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedRecipient(recipientSearch);
      setPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [recipientSearch]);

  // Load logs
  useEffect(() => {
    loadLogs();
  }, [page, statusFilter, debouncedRecipient, startDate, endDate]);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const response = await emailLogsApi.getLogs({
        page,
        limit,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        recipient: debouncedRecipient || undefined,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      });
      setLogs(response.logs || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to load logs:', error);
      toast.error('Failed to load email logs');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle row click
  const handleRowClick = async (log: EmailLog) => {
    try {
      const details = await emailLogsApi.getLogDetails(log.id);
      setSelectedLog(details);
      setDetailOpen(true);
    } catch (error) {
      console.error('Failed to load log details:', error);
      toast.error('Failed to load log details');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('all');
    setRecipientSearch('');
    setDebouncedRecipient('');
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  // Get status badge variant
  const getStatusVariant = (status: EmailStatus) => {
    switch (status) {
      case 'SENT':
        return 'default';
      case 'FAILED':
        return 'destructive';
      case 'BOUNCED':
        return 'destructive';
      case 'SKIPPED':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Check if filters are active
  const hasActiveFilters =
    statusFilter !== 'all' || debouncedRecipient || startDate || endDate;

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Email Logs</CardTitle>
          <CardDescription>
            View email delivery history and troubleshoot issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Recipient Search */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="recipient"
                    placeholder="Search by email..."
                    value={recipientSearch}
                    onChange={(e) => setRecipientSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as EmailStatus | 'all');
                    setPage(1);
                  }}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="BOUNCED">Bounced</SelectItem>
                    <SelectItem value="SKIPPED">Skipped</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => {
                        setStartDate(date);
                        setPage(1);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => {
                        setEndDate(date);
                        setPage(1);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Active filters:</span>
                {statusFilter !== 'all' && (
                  <Badge variant="secondary">Status: {statusFilter}</Badge>
                )}
                {debouncedRecipient && (
                  <Badge variant="secondary">Recipient: {debouncedRecipient}</Badge>
                )}
                {startDate && (
                  <Badge variant="secondary">From: {format(startDate, 'PP')}</Badge>
                )}
                {endDate && <Badge variant="secondary">To: {format(endDate, 'PP')}</Badge>}
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1 h-3 w-3" />
                  Clear all
                </Button>
              </div>
            )}
          </div>

          {/* Logs Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">
                {hasActiveFilters ? 'No logs match your filters' : 'No email logs yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleRowClick(log)}
                      >
                        <TableCell className="font-medium">{log.recipient}</TableCell>
                        <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(log.status)}>{log.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {log.sentAt
                            ? format(new Date(log.sentAt), 'PPp')
                            : format(new Date(log.createdAt), 'PPp')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total}{' '}
                  logs
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Email Log Details</SheetTitle>
            <SheetDescription>Complete information about this email delivery</SheetDescription>
          </SheetHeader>

          {selectedLog && (
            <div className="mt-6 space-y-6">
              {/* Status */}
              <div>
                <Label>Status</Label>
                <div className="mt-2">
                  <Badge variant={getStatusVariant(selectedLog.status)} className="text-base">
                    {selectedLog.status}
                  </Badge>
                </div>
              </div>

              {/* Recipient */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Recipient</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedLog.recipient, 'recipient')}
                  >
                    {copiedField === 'recipient' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-sm">{selectedLog.recipient}</p>
              </div>

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between">
                  <Label>Subject</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedLog.subject, 'subject')}
                  >
                    {copiedField === 'subject' ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-1 text-sm">{selectedLog.subject}</p>
              </div>

              {/* Template */}
              {selectedLog.templateId && (
                <div>
                  <Label>Template</Label>
                  <p className="mt-1 text-sm">
                    {(selectedLog as any).templateName || selectedLog.templateId}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Created At</Label>
                  <p className="mt-1 text-sm">
                    {format(new Date(selectedLog.createdAt), 'PPpp')}
                  </p>
                </div>
                {selectedLog.sentAt && (
                  <div>
                    <Label>Sent At</Label>
                    <p className="mt-1 text-sm">
                      {format(new Date(selectedLog.sentAt), 'PPpp')}
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {selectedLog.error && (
                <div>
                  <Label className="text-destructive">Error Message</Label>
                  <div className="mt-2 rounded-md border border-destructive bg-destructive/10 p-3">
                    <pre className="whitespace-pre-wrap text-sm text-destructive">
                      {selectedLog.error}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedLog.metadata && (
                <div>
                  <Label>Metadata</Label>
                  <pre className="mt-2 rounded-md border bg-muted p-3 text-xs">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
