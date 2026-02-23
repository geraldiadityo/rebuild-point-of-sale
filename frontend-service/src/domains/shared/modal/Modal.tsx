"use client";

import { type ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/domains/shared/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModalProps {
    /** Controls whether the modal is open */
    open: boolean;
    /** Called when the modal requests to close (backdrop click, X button, Escape) */
    onClose: () => void;
    /** Modal title — rendered in the header */
    title?: string;
    /** Optional description text below the title */
    description?: string;
    /** Main body content */
    children: ReactNode;
    /** Optional footer (e.g. action buttons) — rendered below the body */
    footer?: ReactNode;
    /** Max-width class — defaults to "sm:max-w-lg" */
    className?: string;
}

// ─── Modal Component ──────────────────────────────────────────────────────────

/**
 * A highly reusable modal built on Shadcn Dialog.
 * The consumer controls visibility via `open` / `onClose`.
 *
 * @example
 * const [open, setOpen] = useState(false);
 *
 * <Modal
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Delete Product"
 *   description="This action cannot be undone."
 *   footer={
 *     <>
 *       <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
 *       <Button variant="destructive" onClick={handleDelete}>Delete</Button>
 *     </>
 *   }
 * >
 *   <p>Are you sure you want to delete <strong>{product.name}</strong>?</p>
 * </Modal>
 */
export function Modal({
    open,
    onClose,
    title,
    description,
    children,
    footer,
    className,
}: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className={className}>
                {/* Header — only rendered when title or description is provided */}
                {(title || description) && (
                    <DialogHeader>
                        {title && <DialogTitle>{title}</DialogTitle>}
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                )}

                {/* Body */}
                <div className="py-2">{children}</div>

                {/* Footer — only rendered when provided */}
                {footer && (
                    <DialogFooter>{footer}</DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
