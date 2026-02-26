"use client";

import { useMemo } from "react";
import {
    type ColumnDef,
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
import { Skeleton } from "@/domains/shared/ui/skeleton";
import {
    createActionsColumn,
    type RenderActions,
} from "./actions-column";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SimpleTableProps<TData, TValue> {
    /** Column definitions (without actions — use renderActions for that) */
    columns: ColumnDef<TData, TValue>[];
    /** Row data */
    data: TData[];
    /** Show skeleton loading state */
    isLoading?: boolean;
    /** Message when data is empty */
    emptyMessage?: string;
    /** Render action buttons per row — column is hidden when omitted */
    renderActions?: RenderActions<TData>;
    /** Render No counter */
    showRowNumber?: boolean;
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SimpleTableSkeleton({ columns }: { columns: number }) {
    return (
        <>
            {Array.from({ length: 3 }).map((_, rowIndex) => (
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

// ─── SimpleTable Component ────────────────────────────────────────────────────

export function SimpleTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    emptyMessage = "No data available.",
    renderActions,
    showRowNumber=false,
}: SimpleTableProps<TData, TValue>) {
    // Conditionally append the actions column
    const allColumns = useMemo(() => {
        const finalColumns = [...columns];
        // insert column No in front of table
        if(showRowNumber){
            finalColumns.unshift({
                id: "_index",
                header: () => <div className="text-center w-full">No</div>,
                cell: ({row}) => (
                    <div className="text-center">{row.index + 1}</div>
                ),
                enableSorting: false,
                enableHiding: false,
                meta: {
                    className: "w-[1%] whitespace-nowrap text-center"
                },
            } as ColumnDef<TData, any>);
        }
        if (renderActions){
            finalColumns.push(createActionsColumn<TData>(renderActions))
        }
        return finalColumns
        // return [...columns, createActionsColumn<TData>(renderActions)];
    }, [columns, renderActions, showRowNumber]);

    const table = useReactTable({
        data,
        columns: allColumns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="rounded-lg border bg-card">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow
                            key={headerGroup.id}
                            className="bg-muted/50 hover:bg-muted/50"
                        >
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id} className={(header.column.columnDef.meta as any)?.className}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>

                <TableBody>
                    {isLoading ? (
                        <SimpleTableSkeleton columns={allColumns.length} />
                    ) : table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className={(cell.column.columnDef.meta as any)?.className}>
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
    );
}
