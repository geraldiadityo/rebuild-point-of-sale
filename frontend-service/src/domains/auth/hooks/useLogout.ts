"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/domains/auth/stores/useAuthStore";
import { logoutApi } from "@/domains/auth/services/authService";

// ─── useLogout Hook ───────────────────────────────────────────────────────────

/**
 * Hook that performs a complete logout:
 * 1. Calls the BACKEND API (via axiosUse proxy) to invalidate the session
 * 2. Calls the LOCAL Next.js Route Handler (via fetch) to clear the httpOnly `token` cookie
 * 3. Resets the Zustand auth store (also removes `user` cookie client-side)
 * 4. Redirects to `/login`
 *
 * ⚠️ Step 2 MUST use fetch(), NOT axiosUse.
 *    axiosUse prepends /api/proxy → goes to the backend.
 *    fetch("/api/auth/logout") → hits the local Route Handler at app/api/auth/logout/route.ts.
 *
 * @example
 * const logout = useLogout();
 * <button onClick={logout}>Log out</button>
 */
export function useLogout() {
    const router = useRouter();
    const clearAuth = useAuthStore((s) => s.clearAuth);

    return useCallback(async () => {
        // 1. Notify backend to invalidate the session/token (via proxy)
        try {
            await logoutApi();
        } catch {
            // Backend call failed — still proceed with client-side cleanup
        }

        // 2. Clear the httpOnly `token` cookie via LOCAL Next.js Route Handler
        //    ⚠️ Must use fetch() here — NOT axiosUse (which would proxy to backend)
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Even if the server call fails, clear client-side state
        }

        // 3. Clear Zustand store + remove `user` cookie
        clearAuth();

        // 4. Redirect to login
        router.push("/login");
    }, [clearAuth, router]);
}
