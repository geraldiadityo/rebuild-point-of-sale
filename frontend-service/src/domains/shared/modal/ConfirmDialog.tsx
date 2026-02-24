import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { buttonVariants } from "../ui/button";

interface ConfirmDialogProps {
    trigger: React.ReactNode;
    title: string;
    description: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isPending?: boolean;
    confirmText?: string;
    pendingText?: string;
    cancelText?: string;
};

export function ConfirmDialog({
    title,
    trigger,
    description,
    open,
    onOpenChange,
    onConfirm,
    isPending=false,
    confirmText='Confirm',
    pendingText='Loading...',
    cancelText='Cancel',
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isPending}
                        className={buttonVariants({ variant: 'destructive' })}
                    >
                        {isPending ? pendingText : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}