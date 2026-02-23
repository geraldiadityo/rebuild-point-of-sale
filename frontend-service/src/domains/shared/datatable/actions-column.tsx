import { type ColumnDef } from "@tanstack/react-table";
import { type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Render function that receives the row data and returns action buttons */
export type RenderActions<TData> = (row: TData) => ReactNode;

// ─── Actions Column Factory ───────────────────────────────────────────────────

/**
 * Creates an "Actions" column definition that renders custom action buttons.
 * Only call this when `renderActions` is provided — the column
 * is conditionally appended by the table components.
 *
 * @example
 * // Inside DataTable or SimpleTable (internal usage):
 * const allColumns = renderActions
 *   ? [...columns, createActionsColumn(renderActions)]
 *   : columns;
 */
export function createActionsColumn<TData>(
    renderActions: RenderActions<TData>
): ColumnDef<TData, unknown> {
    return {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
            <div className="flex items-center justify-end gap-1">
                {renderActions(row.original)}
            </div>
        ),
        meta: {
            className: "w-[1%] whitespace-nowrap text-right",
        },
    };
}
