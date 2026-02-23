"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/domains/auth/stores/useAuthStore";

// ─── useAuth Hook ─────────────────────────────────────────────────────────────

/**
 * Convenience hook for consuming auth state.
 *
 * - Automatically hydrates from the `user` cookie on first render
 * - Returns the current user, auth status, and a logout action
 *
 * @example
 * const { user, isAuthenticated, clearAuth } = useAuth();
 */
export function useAuth() {
    const { user, isAuthenticated, hydrate, clearAuth } = useAuthStore();

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    return { user, isAuthenticated, clearAuth };
}
