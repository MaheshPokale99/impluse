"use client";

import { useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { ActionForm, type ActionFormProps } from "./action-form";

export function FormDialog({
    trigger,
    title,
    description,
    className,
    ...form
}: Omit<ActionFormProps, "onSuccess"> & {
    trigger: ReactNode;
    title: string;
    description?: string;
    className?: string;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent
                className={cn("max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg", className)}
            >
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <ActionForm
                    {...form}
                    onSuccess={(state) => {
                        setOpen(false);
                        if (state.message) toast.success(state.message);
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}

/** Asks for confirmation, then runs a server action (for example, a delete). */
export function ConfirmAction({
    trigger,
    title,
    description,
    confirmLabel,
    action,
}: {
    trigger: ReactNode;
    title: string;
    description: string;
    confirmLabel: string;
    action: () => Promise<void>;
}) {
    const [open, setOpen] = useState(false);
    const [pending, startTransition] = useTransition();
    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        disabled={pending}
                        onClick={(event) => {
                            event.preventDefault();
                            startTransition(async () => {
                                await action();
                                setOpen(false);
                            });
                        }}
                    >
                        {confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
