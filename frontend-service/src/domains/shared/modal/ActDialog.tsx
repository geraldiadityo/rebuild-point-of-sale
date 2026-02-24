import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

interface ActDialogProps {
    trigger: React.ReactNode;
    title: string;
    children: React.ReactNode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentClassName?: string;
}

export function ActDialog({
    trigger,
    title,
    children,
    open,
    onOpenChange,
    contentClassName
}: ActDialogProps){
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className={contentClassName}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                {children}
            </DialogContent>
        </Dialog>
    )
}