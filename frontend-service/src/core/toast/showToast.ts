import { toast } from "sonner";

/**
 * Reusable toast helpers with clear semantic variants.
 *
 * @example
 * showToast.success("Product saved!");
 * showToast.error("Failed to delete product.");
 * showToast.warning("Stock is running low.");
 * showToast.info("New update available.");
 */
export const showToast = {
    success: (message: string, description?: string) =>
        toast.success(message, { description }),

    error: (message: string, description?: string) =>
        toast.error(message, { description }),

    warning: (message: string, description?: string) =>
        toast.warning(message, { description }),

    info: (message: string, description?: string) =>
        toast.info(message, { description }),
};
