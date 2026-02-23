"use client";

import { useState, useMemo, useEffect } from "react";
import type { PaginationState, SortingState } from "@tanstack/react-table";
import { DataTable } from "@/domains/shared/datatable/DataTable";
import { AppBreadcrumb } from "@/domains/shared/breadcrumb/Breadcrumb";
import { Button } from "@/domains/shared/ui/button";
import { productColumns } from "@/domains/products/components/product-columns";
import { DUMMY_PRODUCTS } from "@/domains/products/data/dummy-products";
import { useDebounce } from "@/hooks/use-debounce";
import { showToast } from "@/core/toast/showToast";
import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "@/domains/products/types";

// ─── Simulated server-side query ─────────────────────────────────────────────
// In a real app, replace this with a React Query hook that sends
// `search`, `pagination`, and `sorting` as query params to your API.
//
// Example with React Query:
//
//   const { data, isLoading } = useQuery({
//     queryKey: ["products", debouncedSearch, pagination, sorting],
//     queryFn: () => fetchProducts({
//       search: debouncedSearch,
//       page: pagination.pageIndex + 1,
//       pageSize: pagination.pageSize,
//       sortBy: sorting[0]?.id,
//       sortOrder: sorting[0]?.desc ? "desc" : "asc",
//     }),
//   });

function useServerSimulation(
    allData: Product[],
    search: string,
    pagination: PaginationState,
    sorting: SortingState
) {
    return useMemo(() => {
        // 1. Filter by search (simulates server WHERE clause)
        let filtered = allData;
        if (search) {
            const q = search.toLowerCase();
            filtered = allData.filter(
                (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.sku.toLowerCase().includes(q) ||
                    p.category.toLowerCase().includes(q)
            );
        }

        // 2. Sort (simulates server ORDER BY)
        if (sorting.length > 0) {
            const { id, desc } = sorting[0];
            filtered = [...filtered].sort((a, b) => {
                const aVal = a[id as keyof Product];
                const bVal = b[id as keyof Product];
                if (aVal < bVal) return desc ? 1 : -1;
                if (aVal > bVal) return desc ? -1 : 1;
                return 0;
            });
        }

        // 3. Paginate (simulates server LIMIT/OFFSET)
        const start = pagination.pageIndex * pagination.pageSize;
        const paged = filtered.slice(start, start + pagination.pageSize);

        return {
            data: paged,
            pageCount: Math.ceil(filtered.length / pagination.pageSize),
            total: filtered.length,
        };
    }, [allData, search, pagination, sorting]);
}

// ─── Products Page ────────────────────────────────────────────────────────────

export default function ProductsPage() {
    // Search state — raw value updates on every keystroke
    const [search, setSearch] = useState("");
    // Debounced value — only updates 400ms after the user stops typing
    const debouncedSearch = useDebounce(search, 400);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 5,
    });
    const [sorting, setSorting] = useState<SortingState>([]);

    // Reset to page 0 when the debounced search term changes
    useEffect(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, [debouncedSearch]);

    // Simulated server response — in production, this is your React Query hook
    const { data, pageCount, total } = useServerSimulation(
        DUMMY_PRODUCTS,
        debouncedSearch,
        pagination,
        sorting
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    Products
                </h1>
                <AppBreadcrumb />
            </div>

            <DataTable
                columns={productColumns}
                data={data}
                pageCount={pageCount}
                rowCount={total}
                pagination={pagination}
                sorting={sorting}
                onPaginationChange={setPagination}
                onSortingChange={setSorting}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Search by name, SKU, or category..."
                emptyMessage="No products match your search."
                renderActions={(product) => (
                    <>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => showToast.info(`Editing ${product.name}`, `SKU: ${product.sku}`)}
                            aria-label={`Edit ${product.name}`}
                        >
                            <Pencil className="size-3.5" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => showToast.error(`Deleted ${product.name}`)}
                            aria-label={`Delete ${product.name}`}
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 className="size-3.5" />
                        </Button>
                    </>
                )}
            />
        </div>
    );
}

