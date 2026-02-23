// ─── Product Entity ───────────────────────────────────────────────────────────

export interface Product {
    id: number;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock: number;
    status: "active" | "draft" | "archived";
    createdAt: string;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ProductListResponse {
    data: Product[];
    total: number;
    page: number;
    pageSize: number;
    pageCount: number;
}
