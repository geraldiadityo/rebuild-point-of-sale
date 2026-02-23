import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { loginApi } from "@/domains/auth/services/authService";
import { useAuthStore } from "@/domains/auth/stores/useAuthStore";
import type { MutationConfig } from "@/core/query/QueryProvider";

// ─── useLogin Mutation Hook ───────────────────────────────────────────────────

type UseLoginOptions = Omit<
    MutationConfig<typeof loginApi>,
    "mutationFn" | "retry"
>;

/**
 * React Query mutation hook for the login flow.
 *
 * - Calls `POST /api/auth/login` via `loginApi`
 * - On success: hydrates the Zustand auth store from the newly set `user` cookie
 * - Smart retry: skips retries for 4xx (client errors), retries up to 3× for 5xx / network errors
 *
 * @example
 * const login = useLogin({
 *   onSuccess: () => router.push("/"),
 *   onError:   (err) => showToast.error(err.message),
 * });
 *
 * login.mutate({ username: "admin", password: "secret" });
 */
export function useLogin(options?: UseLoginOptions) {
    const { hydrate } = useAuthStore();

    return useMutation({
        mutationFn: loginApi,

        // Smart Retry — mirrors the pattern in QueryProvider.tsx
        retry: (failureCount, error) => {
            if (
                error instanceof AxiosError &&
                error.status &&
                error.status >= 400 &&
                error.status < 500
            ) {
                return false;
            }
            return failureCount < 3;
        },

        ...options,

        onSuccess: (data, variables, onMutateResult, context) => {
            // Sync cookie → Zustand store
            hydrate();
            options?.onSuccess?.(data, variables, onMutateResult, context);
        },
    });
}
