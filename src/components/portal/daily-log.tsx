"use client";

import { useMemo, useTransition } from "react";
import { CalendarDays, Check, NotebookPen, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { todayInIndia } from "@/lib/dates";
import type { Role } from "@/lib/db/schema";
import { addEntry, deleteEntry, updateEntryField } from "@/lib/students/actions";
import { canEdit, entryDateField, type EntryRecord, type LogColumn } from "@/lib/students/fields";
import { ConfirmAction } from "./dialogs";
import { EditableValue } from "./editable-value";
import { Pager, usePages } from "./pager";
import {
    moveFocus,
    sheetCellClass,
    sheetColumnWidth,
    sheetHeadClass,
    SheetScrollArea,
    sheetTableClass,
} from "./sheet-table";
import { useOptimisticEdits } from "./use-optimistic-edits";
import { FieldIcon } from "./values";

/**
 * "New" for the daily log: adds today's row (dated automatically, starting from the previous
 * day's values). Disabled once today's row exists, so a day is never logged twice.
 */
export function AddTodayButton({ studentId, hasToday }: { studentId: string; hasToday: boolean }) {
    const [adding, startAdding] = useTransition();
    return (
        <Button
            size="sm"
            variant={hasToday ? "outline" : "default"}
            disabled={hasToday || adding}
            onClick={() =>
                startAdding(async () => {
                    const result = await addEntry(studentId);
                    if (result.ok) toast.success("Today's row added.");
                    else toast.error(result.error);
                })
            }
        >
            {hasToday ? <Check /> : <Plus />}
            {hasToday ? "Today logged" : adding ? "Adding…" : "New day"}
        </Button>
    );
}

/**
 * A student's daily log: one row per day, newest first, 30 days per page, every cell editable
 * in place. `fields` are the columns to show (built-in and the mentor's own, see `LogColumn`).
 */
export function DailyLog({
    studentId,
    entries,
    fields,
    role,
    viewerId,
}: {
    studentId: string;
    entries: EntryRecord[];
    fields: readonly LogColumn[];
    role: Role;
    viewerId: string;
}) {
    const admin = role === "admin";
    const isOwn = viewerId === studentId;
    // Custom column values sit next to the built-in ones, so every cell reads `row[column]`.
    const rows = useMemo(
        () =>
            entries.map((entry): EntryRecord & Record<string, unknown> => ({
                ...entry.custom,
                ...entry,
            })),
        [entries],
    );
    const { records, save, saving } = useOptimisticEdits(rows, updateEntryField);
    const pages = usePages(records);
    const today = todayInIndia();

    if (records.length === 0) {
        return (
            <Empty className="border-y">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <NotebookPen />
                    </EmptyMedia>
                    <EmptyTitle>No daily entries yet</EmptyTitle>
                    <EmptyDescription>
                        {admin
                            ? "Select New day to start tracking scores, levels and calls day by day."
                            : "Your mentor will add your progress here day by day."}
                    </EmptyDescription>
                </EmptyHeader>
                {admin && (
                    <EmptyContent>
                        <AddTodayButton studentId={studentId} hasToday={false} />
                    </EmptyContent>
                )}
            </Empty>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <SheetScrollArea label="Daily log" onKeyDownCapture={moveFocus}>
                <table className={sheetTableClass}>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead
                                className={`${sheetHeadClass(true)} w-32 min-w-32 sm:w-44 sm:min-w-44`}
                            >
                                <span className="flex items-center gap-1.5 px-3">
                                    <CalendarDays className="size-3.5" aria-hidden />
                                    Date
                                </span>
                            </TableHead>
                            {fields.map((field) => {
                                const width = sheetColumnWidth(field.type);
                                return (
                                    <TableHead
                                        key={field.name}
                                        style={{ width, minWidth: width }}
                                        className={sheetHeadClass(false)}
                                    >
                                        <span className="flex items-center gap-1.5 px-3">
                                            <FieldIcon type={field.type} />
                                            <span className="truncate">{field.label}</span>
                                        </span>
                                    </TableHead>
                                );
                            })}
                            {admin && (
                                <TableHead
                                    className={sheetHeadClass(false)}
                                    style={{ width: 48, minWidth: 48 }}
                                >
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pages.rows.map((entry, rowIndex) => (
                            <TableRow
                                key={entry.id}
                                className="group/row border-0 hover:bg-transparent"
                            >
                                <TableCell
                                    data-row={rowIndex}
                                    data-col={0}
                                    className={sheetCellClass(true)}
                                >
                                    <div className="flex h-full items-center">
                                        <div
                                            className={cn(
                                                "h-full min-w-0 flex-1",
                                                entry.date === today &&
                                                    "font-semibold text-primary sm:font-normal sm:text-foreground",
                                            )}
                                        >
                                            <EditableValue
                                                field={entryDateField}
                                                value={entry.date}
                                                editable={admin}
                                                onSave={(value) => save(entry.id, "date", value)}
                                            />
                                        </div>
                                        {entry.date === today && (
                                            <Badge className="mr-2 hidden shrink-0 sm:inline-flex">
                                                Today
                                            </Badge>
                                        )}
                                    </div>
                                </TableCell>
                                {fields.map((field, index) => (
                                    <TableCell
                                        key={field.name}
                                        data-row={rowIndex}
                                        data-col={index + 1}
                                        className={sheetCellClass(false)}
                                    >
                                        <EditableValue
                                            field={field}
                                            value={entry[field.name]}
                                            editable={canEdit(role, isOwn, field)}
                                            onSave={(value) => save(entry.id, field.name, value)}
                                        />
                                    </TableCell>
                                ))}
                                {admin && (
                                    <TableCell className={sheetCellClass(false)}>
                                        <div className="flex h-full items-center justify-center">
                                            <ConfirmAction
                                                title="Delete this row?"
                                                description="This day's entry will be removed from the log permanently."
                                                confirmLabel="Delete row"
                                                action={deleteEntry.bind(null, entry.id)}
                                                trigger={
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        aria-label="Delete this row"
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                }
                                            />
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </table>
            </SheetScrollArea>
            <p
                className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"
                aria-live="polite"
            >
                <span>
                    {records.length} {records.length === 1 ? "day" : "days"} logged
                    {(admin || fields.some((field) => field.studentEditable)) && (
                        <>
                            {" · Select a cell to edit"}
                            <span className="hidden sm:inline">
                                . Arrow keys move between cells
                            </span>
                            .
                        </>
                    )}
                </span>
                <span>{saving ? "Saving…" : "All changes saved"}</span>
            </p>
            <Pager {...pages} label="Daily log" />
        </div>
    );
}
