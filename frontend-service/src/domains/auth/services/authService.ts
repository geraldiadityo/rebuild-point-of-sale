import { axiosUse } from "@/lib/axiosFunc";
import Cookies from "js-cookie";
import type { LoginCredentials } from "@/domains/auth/types";
import type { ApiResponse } from "@/core/api/types";

// ─── Auth Service ─────────────────────────────────────────────────────────────

/**
 * POST /api/auth/login
 *
 * Sends credentials to the backend.
 * On success the server sets:
 *   - `token`  (httpOnly cookie — handled by the browser automatically)
 *   - `user`   (client-readable cookie — JSON string)
 */
export const loginApi = async (
    credentials: LoginCredentials
): Promise<ApiResponse<string>> => {
    const { data } = await axiosUse.post<ApiResponse<string>>(
        "/api/auth/login",
        credentials
    );
    return data;
};

/**
 * POST /api/auth/logout
 *
 * Notifies the backend to invalidate the session/token.
 * Must be called BEFORE clearing client-side state.
 */
export const logoutApi = async (): Promise<void> => {
    await axiosUse.post("/api/auth/logout", {});
};

/**
 * Client-side logout.
 * Removes the `user` cookie.
 * The `token` (httpOnly) cookie cannot be removed client-side;
 * it either expires naturally or is cleared via a server logout endpoint.
 */
export const logoutClient = (): void => {
    Cookies.remove("user");
};
