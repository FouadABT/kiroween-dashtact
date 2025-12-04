'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, FileSpreadsheet, FileJson, Loader2 } from 'lucide-react';
import { InlinePermissionWrapper } from './PermissionWrapper';

/**
 * ExportButton - Export data in various formats (CSV, JSON, Excel, PDF)
 * 
 * Features:
 * - Multiple export formats
 * - Permission-based access control
 * - Loading state during export
 * - Automatic file download
 * - Custom filename support
 * 
 * @example
 * ```tsx
 * <ExportButton
 *   data={users}
 *   filename="users-export"
 *   formats={['csv', 'json', 'excel']}
 *   permission="users:export"
 * />
 * ```
 */

export type ExportFormat = 'csv' | 'json' | 'excel' | 'pdf';

export interface ExportButtonProps {
  /** Data to export */
  data: Record<string, unknown>[];
  /** Base filename (without extension) */
  filename?: string;
  /** Available export formats */
  formats?: ExportFormat[];
  /** Permission required to export */
  permission?: string;
  /** Custom export handler */
  onExport?: (format: ExportFormat, data: Record<string, unknown>[]) => Promise<void> | void;
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Show as icon only */
  iconOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function ExportButton({
  data,
  filename = 'export',
  formats = ['csv', 'json'],
  permission,
  onExport,
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const formatIcons: Record<ExportFormat, React.ReactNode> = {
    csv: <FileSpreadsheet className="w-4 h-4 mr-2" />,
    json: <FileJson className="w-4 h-4 mr-2" />,
    excel: <FileSpreadsheet className="w-4 h-4 mr-2" />,
    pdf: <FileText className="w-4 h-4 mr-2" />,
  };

  const formatLabels: Record<ExportFormat, string> = {
    csv: 'Export as CSV',
    json: 'Export as JSON',
    excel: 'Export as Excel',
    pdf: 'Export as PDF',
  };

  const formatExtensions: Record<ExportFormat, string> = {
    csv: 'csv',
    json: 'json',
    excel: 'xlsx',
    pdf: 'pdf',
  };

  const convertToCSV = (data: Record<string, unknown>[]): string => {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          const stringValue = value === null || value === undefined ? '' : String(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          return stringValue.includes(',') || stringValue.includes('"')
            ? `"${stringValue.replace(/"/g, '""')}"`
            : stringValue;
        }).join(',')
      ),
    ];

    return csvRows.join('\n');
  };

  const convertToJSON = (data: Record<string, unknown>[]): string => {
    return JSON.stringify(data, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setExportingFormat(format);

    try {
      // Use custom export handler if provided
      if (onExport) {
        await onExport(format, data);
        return;
      }

      // Default export handlers
      const timestamp = new Date().toISOString().split('T')[0];
      const fullFilename = `${filename}-${timestamp}.${formatExtensions[format]}`;

      switch (format) {
        case 'csv': {
          const csv = convertToCSV(data);
          downloadFile(csv, fullFilename, 'text/csv');
          break;
        }
        case 'json': {
          const json = convertToJSON(data);
          downloadFile(json, fullFilename, 'application/json');
          break;
        }
        case 'excel': {
          // For Excel, we'll export as CSV for now
          // In a real implementation, you'd use a library like xlsx
          const csv = convertToCSV(data);
          downloadFile(csv, fullFilename, 'text/csv');
          console.warn('Excel export uses CSV format. Install xlsx library for true Excel support.');
          break;
        }
        case 'pdf': {
          // PDF export requires a library like jsPDF
          // For now, we'll export as JSON
          const json = convertToJSON(data);
          downloadFile(json, fullFilename.replace('.pdf', '.json'), 'application/json');
          console.warn('PDF export not implemented. Install jsPDF library for PDF support.');
          break;
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
      setExportingFormat(null);
    }
  };

  const button = (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={isExporting || data.length === 0}
          className={className}
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className={iconOnly ? 'w-4 h-4' : 'w-4 h-4 mr-2'} />
              {!iconOnly && 'Export'}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map(format => (
          <DropdownMenuItem
            key={format}
            onClick={() => handleExport(format)}
            disabled={isExporting}
          >
            {isExporting && exportingFormat === format ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              formatIcons[format]
            )}
            {formatLabels[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Wrap with permission check if permission is provided
  if (permission) {
    return (
      <InlinePermissionWrapper permission={permission}>
        {button}
      </InlinePermissionWrapper>
    );
  }

  return button;
}
