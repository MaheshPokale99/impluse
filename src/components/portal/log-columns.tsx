"use client";

import { useOptimistic, useTransition } from "react";
import { Columns3, Eye, EyeOff, Lock, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    addLogColumn,
    deleteLogColumn,
    updateLogColumn,
    type ColumnChange,
} from "@/lib/students/actions";
import { MAX_COLUMN_LABEL, newColumnFields, type LogColumn } from "@/lib/students/fields";
import { ActionForm } from "./action-form";
import { ConfirmAction } from "./dialogs";
import { FieldIcon } from "./values";

/**
 * The mentor's column settings for every student's daily log: rename or hide any column
 * (hidden columns keep their values) and add columns of their own.
 */
export function LogColumnsButton({ columns }: { columns: LogColumn[] }) {
    const hidden = columns.filter((column) => column.hidden).length;
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Columns3 /> Columns
                    {hidden > 0 && <span className="text-muted-foreground">({hidden} hidden)</span>}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Daily log columns</DialogTitle>
                    <DialogDescription>
                        Changes apply to every student&apos;s log. Hiding a column keeps its values;
                        show it again any time. Clear a built-in column&apos;s name to restore it.
                    </DialogDescription>
                </DialogHeader>
                <ul className="divide-y border-y">
                    {columns.map((column) => (
                        <ColumnRow key={column.name} column={column} />
                    ))}
                </ul>
                <Separator />
                <div className="flex flex-col gap-3">
                    <h3 className="text-sm font-semibold">Add a column</h3>
                    <ActionForm
                        action={addLogColumn}
                        fields={newColumnFields}
                        values={{ type: "text", visibility: "everyone" }}
                        columns={2}
                        submitLabel="Add column"
                        onSuccess={(state) => state.message && toast.success(state.message)}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ColumnRow({ column }: { column: LogColumn }) {
    const [state, setOptimistic] = useOptimistic(
        column,
        (current, change: ColumnChange): LogColumn => ({
            ...current,
            ...(change.label !== undefined && {
                label: change.label.trim() || current.defaultLabel || current.label,
            }),
            ...(change.hidden !== undefined && { hidden: change.hidden }),
            ...(change.studentVisible !== undefined && { adminOnly: !change.studentVisible }),
        }),
    );
    const [, startTransition] = useTransition();
    const save = (change: ColumnChange) =>
        startTransition(async () => {
            setOptimistic(change);
            const result = await updateLogColumn(column.name, change);
            if (!result.ok) toast.error(result.error);
        });

    return (
        <li className={cn("flex flex-wrap items-center gap-2 py-2", state.hidden && "opacity-60")}>
            <FieldIcon type={state.type} />
            <Input
                // Remounts with the saved name, so a rejected rename snaps back.
                key={column.label}
                defaultValue={column.label}
                placeholder={column.defaultLabel}
                maxLength={MAX_COLUMN_LABEL}
                aria-label={`Name of the ${column.label} column`}
                className="h-8 min-w-0 flex-1 basis-40"
                onKeyDown={(event) => {
                    if (event.key === "Enter") event.currentTarget.blur();
                    if (event.key === "Escape") {
                        event.currentTarget.value = column.label;
                        event.currentTarget.blur();
                    }
                }}
                onBlur={(event) => {
                    const label = event.currentTarget.value;
                    if (label.trim() !== column.label) save({ label });
                }}
            />
            <div className="flex items-center gap-1">
                {state.custom ? (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        aria-pressed={!state.adminOnly}
                        title="Choose whether students see this column"
                        onClick={() => save({ studentVisible: state.adminOnly })}
                    >
                        {state.adminOnly ? <Lock /> : <Users />}
                        {state.adminOnly ? "Mentor only" : "Student sees"}
                    </Button>
                ) : (
                    state.adminOnly && (
                        <Badge variant="outline" className="text-muted-foreground">
                            <Lock /> Mentor only
                        </Badge>
                    )
                )}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`${state.hidden ? "Show" : "Hide"} ${state.label}`}
                    title={state.hidden ? "Hidden: select to show" : "Shown: select to hide"}
                    onClick={() => save({ hidden: !state.hidden })}
                >
                    {state.hidden ? <EyeOff /> : <Eye />}
                </Button>
                {state.custom && (
                    <ConfirmAction
                        title={`Delete the “${state.label}” column?`}
                        description="Its values are deleted from every student's log. To keep them, hide the column instead."
                        confirmLabel="Delete column"
                        action={deleteLogColumn.bind(null, column.name)}
                        trigger={
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Delete ${state.label}`}
                                className="text-muted-foreground hover:text-destructive"
                            >
                                <Trash2 />
                            </Button>
                        }
                    />
                )}
            </div>
        </li>
    );
}
