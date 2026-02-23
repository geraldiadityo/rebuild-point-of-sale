// ─── Standard API Response ────────────────────────────────────────────────────

/**
 * Standard wrapper for non-paginated API responses.
 *
 * @example
 * // Single entity
 * const res: ApiResponse<Product> = {
 *   message: "Product fetched successfully",
 *   data: { id: 1, name: "Widget", ... }
 * };
 *
 * // Array of entities
 * const res: ApiResponse<Product[]> = {
 *   message: "Products fetched",
 *   data: [{ id: 1, ... }, { id: 2, ... }]
 * };
 */
export interface ApiResponse<T> {
    message: string;
    data: T;
}

// ─── Paginated API Response ───────────────────────────────────────────────────

/**
 * Extended wrapper for paginated API endpoints.
 * Inherits `message` and `data` from `ApiResponse`, adds page metadata.
 *
 * @example
 * const res: PaginatedResponse<Product> = {
 *   message: "Products fetched",
 *   data: [{ id: 1, ... }, { id: 2, ... }],
 *   totalItem: 58,
 *   totalPage: 6,
 *   currentPage: 1,
 * };
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    totalItem: number;
    totalPage: number;
    currentPage: number;
}

// ─── Error Response ───────────────────────────────────────────────────────────

/**
 * Standard error shape returned by the API.
 *
 * @example
 * const err: ApiErrorResponse = {
 *   message: "Validation failed",
 *   errors: { name: ["Name is required"], price: ["Must be positive"] }
 * };
 */
export interface ApiErrorResponse {
    message: string;
    errors?: Record<string, string[]>;
}
