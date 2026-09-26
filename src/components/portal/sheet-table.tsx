import type { KeyboardEvent, KeyboardEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import type { FieldType } from "@/lib/forms";

const widths: Record<FieldType, number> = {
    textarea: 280,
    text: 190,
    email: 220,
    tel: 160,
    select: 150,
    date: 150,
    number: 140,
    password: 0,
};

export const sheetColumnWidth = (type?: FieldType) => (type ? widths[type] : 130);

export function SheetScrollArea({
    children,
    label,
    onKeyDownCapture,
}: {
    children: ReactNode;
    label: string;
    onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>;
}) {
    return (
        <ScrollArea
            aria-label={label}
            role="region"
            onKeyDownCapture={onKeyDownCapture}
            className="overflow-hidden [&>[data-slot=scroll-area-viewport]]:max-h-[70vh]"
        >
            {/* Room below the last row so the overlay scrollbar never covers it. */}
            <div className="pb-2">{children}</div>
            <ScrollBar orientation="horizontal" />
        </ScrollArea>
    );
}

export const sheetTableClass = "w-max min-w-full border-separate border-spacing-0 text-sm";

export const sheetHeadClass = (first: boolean) =>
    cn(
        "sticky top-0 z-20 h-9 border-y border-r bg-background p-0 text-xs font-normal text-muted-foreground last:border-r-0",
        first && "left-0 z-30",
    );

export const sheetCellClass = (first: boolean) =>
    cn(
        "h-9 border-r border-b bg-background p-0 last:border-r-0",
        first && "sticky left-0 z-10 shadow-[1px_0_0_var(--border)]",
    );

const arrows: Record<string, [number, number]> = {
    ArrowUp: [-1, 0],
    ArrowDown: [1, 0],
    ArrowLeft: [0, -1],
    ArrowRight: [0, 1],
};

export function moveFocus(event: KeyboardEvent<HTMLElement>) {
    const delta = arrows[event.key];
    const target = event.target as HTMLElement;
    const cell = target.closest<HTMLElement>("[data-row]");
    if (!delta || !target.matches("[data-cell]") || !cell) return;
    const grid = event.currentTarget;
    let row = Number(cell.dataset.row) + delta[0];
    let col = Number(cell.dataset.col) + delta[1];
    while (grid.querySelector(`[data-row="${row}"][data-col="${col}"]`)) {
        const next = grid.querySelector<HTMLElement>(
            `[data-row="${row}"][data-col="${col}"] [data-cell]`,
        );
        if (next) {
            event.preventDefault();
            event.stopPropagation();
            next.focus();
            next.scrollIntoView({ block: "nearest", inline: "nearest" });
            return;
        }
        row += delta[0];
        col += delta[1];
    }
}
