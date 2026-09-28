"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const PAGE_SIZE = 30;

/** Splits rows into pages. The page stays in range when rows are removed. */
export function usePages<T>(rows: readonly T[], pageSize = PAGE_SIZE) {
    const [requested, setPage] = useState(0);
    const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
    const page = Math.min(requested, pageCount - 1);
    const start = page * pageSize;
    return {
        page,
        pageCount,
        setPage,
        start,
        rows: rows.slice(start, start + pageSize),
        total: rows.length,
        pageSize,
    };
}

/** "1–30 of 95" with previous/next buttons; hidden when everything fits on one page. */
export function Pager({
    page,
    pageCount,
    setPage,
    start,
    rows,
    total,
    label,
}: Pick<
    ReturnType<typeof usePages>,
    "page" | "pageCount" | "setPage" | "start" | "rows" | "total"
> & { label: string }) {
    if (pageCount <= 1) return null;
    return (
        <nav
            aria-label={`${label} pages`}
            className="flex items-center justify-end gap-2 text-xs text-muted-foreground"
        >
            <span className="tabular-nums" aria-live="polite">
                {start + 1}–{start + rows.length} of {total}
            </span>
            <Button
                variant="outline"
                size="icon-sm"
                aria-label="Previous page"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
            >
                <ChevronLeft />
            </Button>
            <span className="tabular-nums">
                Page {page + 1} of {pageCount}
            </span>
            <Button
                variant="outline"
                size="icon-sm"
                aria-label="Next page"
                disabled={page >= pageCount - 1}
                onClick={() => setPage(page + 1)}
            >
                <ChevronRight />
            </Button>
        </nav>
    );
}
