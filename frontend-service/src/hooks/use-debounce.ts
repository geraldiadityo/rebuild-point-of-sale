import { useState, useEffect } from "react";

/**
 * Debounces a value by the specified delay.
 * Useful for delaying server-side search requests until the user stops typing.
 *
 * @example
 * const [search, setSearch] = useState("");
 * const debouncedSearch = useDebounce(search, 400);
 * // Use debouncedSearch as a React Query key — request fires 400ms after last keystroke
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delayMs);
        return () => clearTimeout(timer);
    }, [value, delayMs]);

    return debouncedValue;
}
