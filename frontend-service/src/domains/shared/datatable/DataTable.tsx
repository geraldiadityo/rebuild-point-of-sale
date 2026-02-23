"use client";

import { useMemo } from "react";
import {
    type ColumnDef,
    type SortingState,
    type PaginationState,
    type OnChangeFn,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/domains/shared/ui/table";
import { Button } from "@/domains/shared/ui/button";
import { Input } from "@/domains/shared/ui/input";
import { Skeleton } from "@/domains/shared/ui/skeleton";
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Search,
    X,
} from "lucide-react";
import {
    createActionsColumn,
    type RenderActions,
} from "./actions-column";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pageCount?: number;
    rowCount?: number;
    isLoading?: boolean;
    pagination?: PaginationState;
    sorting?: SortingState;
    onPaginationChange?: OnChangeFn<PaginationState>;
    onSortingChange?: OnChangeFn<SortingState>;
    emptyMessage?: string;
    /** Current raw search value (before debounce — for immediate UI feedback) */
    searchValue?: string;
    /** Called on every keystroke — consumer should debounce before querying */
    onSearchChange?: (value: string) => void;
    /** Placeholder text for the search input */
    searchPlaceholder?: string;
    /** Render action buttons per row — column is hidden when omitted */
    renderActions?: RenderActions<TData>;
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function DataTableSkeleton({ columns }: { columns: number }) {
    return (
        <>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <TableCell key={colIndex}>
                            <Skeleton className="h-4 w-full" />
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ isSorted }: { isSorted: false | "asc" | "desc" }) {
    if (isSorted === "asc") return <ArrowUp className="ml-1 size-3.5" />;
    if (isSorted === "desc") return <ArrowDown className="ml-1 size-3.5" />;
    return <ArrowUpDown className="ml-1 size-3.5 opacity-40" />;
}

// ─── Pagination Info ──────────────────────────────────────────────────────────

function PaginationInfo({
    pageIndex,
    pageSize,
    totalRows,
}: {
    pageIndex: number;
    pageSize: number;
    totalRows: number;
}) {
    if (totalRows === 0) return null;

    const start = pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, totalRows);

    return (
        <p className="text-muted-foreground text-sm">
            Showing <span className="font-medium text-foreground">{start}</span> to{" "}
            <span className="font-medium text-foreground">{end}</span> of{" "}
            <span className="font-medium text-foreground">{totalRows}</span> results
        </p>
    );
}

// ─── DataTable Component ──────────────────────────────────────────────────────

export function DataTable<TData, TValue>({
    columns,
    data,
    pageCount = -1,
    rowCount = 0,
    isLoading = false,
    pagination,
    sorting,
    onPaginationChange,
    onSortingChange,
    emptyMessage = "No results found.",
    searchValue,
    onSearchChange,
    searchPlaceholder = "Search...",
    renderActions,
}: DataTableProps<TData, TValue>) {
    // Conditionally append the actions column
    const allColumns = useMemo(() => {
        if (!renderActions) return columns;
        return [...columns, createActionsColumn<TData>(renderActions)];
    }, [columns, renderActions]);

    const table = useReactTable({
        data,
        columns: allColumns,
        pageCount,
        rowCount,
        state: {
            pagination,
            sorting,
        },
        onPaginationChange,
        onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
    });

    return (
        <div className="space-y-4">
            {/* Search Toolbar */}
            {onSearchChange && (
                <div className="flex items-center">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            type="search"
                            placeholder={searchPlaceholder}
                            value={searchValue ?? ""}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 pr-9"
                        />
                        {searchValue && (
                            <button
                                type="button"
                                onClick={() => onSearchChange("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Clear search"
                            >
                                <X className="size-4" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow
                                key={headerGroup.id}
                                className="bg-muted/50 hover:bg-muted/50"
                            >
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-1 font-medium hover:text-foreground transition-colors cursor-pointer select-none"
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                <SortIcon
                                                    isSorted={header.column.getIsSorted()}
                                                />
                                            </button>
                                        ) : (
                                            flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {isLoading ? (
                            <DataTableSkeleton columns={allColumns.length} />
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
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
                                    colSpan={allColumns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    {emptyMessage}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between px-2">
                    <PaginationInfo
                        pageIndex={pagination.pageIndex}
                        pageSize={pagination.pageSize}
                        totalRows={rowCount}
                    />

                    <div className="flex items-center gap-1">
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.firstPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Go to first page"
                        >
                            <ChevronsLeft className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Go to previous page"
                        >
                            <ChevronLeft className="size-4" />
                        </Button>

                        <span className="text-sm text-muted-foreground px-2">
                            Page{" "}
                            <span className="font-medium text-foreground">
                                {pagination.pageIndex + 1}
                            </span>{" "}
                            of{" "}
                            <span className="font-medium text-foreground">
                                {table.getPageCount()}
                            </span>
                        </span>

                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Go to next page"
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => table.lastPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Go to last page"
                        >
                            <ChevronsRight className="size-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
