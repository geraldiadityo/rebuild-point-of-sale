import { create } from "zustand";
import Cookies from "js-cookie";
import type { AuthUser } from "@/domains/auth/types";
import { logoutClient } from "@/domains/auth/services/authService";

// ─── Auth Store ───────────────────────────────────────────────────────────────

interface AuthState {
    /** Current authenticated user (parsed from cookie) */
    user: AuthUser | null;

    /** Derived flag: true when `user` is present */
    isAuthenticated: boolean;

    /**
     * Read and parse the `user` cookie.
     * Call on mount and after login to sync cookie → store.
     */
    hydrate: () => void;

    /** Set user directly (used internally after login). */
    setUser: (user: AuthUser) => void;

    /** Clear auth state and remove the `user` cookie. */
    clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,

    hydrate: () => {
        const raw = Cookies.get("user");
        if (raw) {
            try {
                const parsed: AuthUser = JSON.parse(decodeURIComponent(raw));
                set({ user: parsed, isAuthenticated: true });
            } catch {
                // Cookie value is corrupted — treat as unauthenticated
                set({ user: null, isAuthenticated: false });
            }
        } else {
            set({ user: null, isAuthenticated: false });
        }
    },

    setUser: (user) => set({ user, isAuthenticated: true }),

    clearAuth: () => {
        logoutClient();
        set({ user: null, isAuthenticated: false });
    },
}));
