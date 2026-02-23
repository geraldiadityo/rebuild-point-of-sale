"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/domains/shared/ui/badge";
import type { Product } from "../types";

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Product["status"] }) {
    const variants: Record<Product["status"], "default" | "secondary" | "outline"> = {
        active: "default",
        draft: "secondary",
        archived: "outline",
    };

    return (
        <Badge variant={variants[status]} className="capitalize">
            {status}
        </Badge>
    );
}

// ─── Column Definitions ───────────────────────────────────────────────────────

export const productColumns: ColumnDef<Product>[] = [
    {
        accessorKey: "name",
        header: "Product Name",
        enableSorting: true,
    },
    {
        accessorKey: "sku",
        header: "SKU",
        enableSorting: false,
    },
    {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
    },
    {
        accessorKey: "price",
        header: "Price",
        enableSorting: true,
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("price"));
            return new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
            }).format(price);
        },
    },
    {
        accessorKey: "stock",
        header: "Stock",
        enableSorting: true,
        cell: ({ row }) => {
            const stock = row.getValue<number>("stock");
            return (
                <span className={stock === 0 ? "text-destructive font-medium" : ""}>
                    {stock === 0 ? "Out of stock" : stock}
                </span>
            );
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
        accessorKey: "createdAt",
        header: "Created",
        enableSorting: true,
    },
];
