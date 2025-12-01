'use client';

"use client";

import React, { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { WidgetContainer } from "./WidgetContainer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BaseWidgetProps } from "../types/widget.types";

/**
 * Props for the DataTable component
 */
export interface DataTableProps<T> extends BaseWidgetProps {
  /** Table data */
  data: T[];
  /** Column definitions (TanStack Table format) */
  columns: ColumnDef<T>[];
  /** Optional row actions renderer */
  actions?: (row: T) => React.ReactNode;
  /** Enable global search */
  searchable?: boolean;
  /** Enable column filters */
  filterable?: boolean;
  /** Enable pagination */
  pagination?: boolean;
  /** Row click handler */
  onRowClick?: (row: T) => void;
  /** Optional title */
  title?: string;
  /** Optional description */
  description?: string;
}

/**
 * DataTable Component
 * 
 * Advanced table with search, filter, sort, and pagination using TanStack Table.
 * Responsive design with horizontal scroll on mobile.
 * 
 * @example Basic usage
 * ```tsx
 * const columns: ColumnDef<User>[] = [
 *   { accessorKey: "name", header: "Name" },
 *   { accessorKey: "email", header: "Email" },
 * ];
 * 
 * <DataTable
 *   data={users}
 *   columns={columns}
 * />
 * ```
 * 
 * @example With search and pagination
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   searchable={true}
 *   pagination={true}
 * />
 * ```
 * 
 * @example With row actions
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={columns}
 *   actions={(row) => (
 *     <Button size="sm" onClick={() => handleEdit(row)}>
 *       Edit
 *     </Button>
 *   )}
 * />
 * ```
 */
export function DataTable<T>({
  data,
  columns,
  actions,
  searchable = false,
  pagination = false,
  onRowClick,
  title,
  description,
  loading = false,
  error,
  permission,
  className,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Add actions column if actions prop is provided
  const columnsWithActions: ColumnDef<T>[] = actions
    ? [
        ...columns,
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => actions(row.original),
        },
      ]
    : columns;

  const table = useReactTable({
    data,
    columns: columnsWithActions,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: pagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });

  return (
    <WidgetContainer
      title={title}
      description={description}
      loading={loading}
      error={error}
      permission={permission}
      className={className}
    >
      <div className="space-y-4">
        {/* Search Bar */}
        {searchable && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Table - Responsive with horizontal scroll */}
        <div className="rounded-md border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "flex items-center gap-2",
                            header.column.getCanSort() && "cursor-pointer select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                          )}
                          {header.column.getIsSorted() === "asc" && (
                            <span className="text-xs">↑</span>
                          )}
                          {header.column.getIsSorted() === "desc" && (
                            <span className="text-xs">↓</span>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(onRowClick && "cursor-pointer")}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columnsWithActions.length}
                    className="h-24 text-center"
                  >
                    <div className="text-muted-foreground">
                      No results found.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={table.getState().pagination.pageSize.toString()}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
}

