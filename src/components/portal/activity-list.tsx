"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { markNotificationsRead } from "@/lib/notifications/actions";
import type { NotificationRow } from "@/lib/notifications/queries";
import { formatDate } from "./values";

/**
 * Notifications, newest first. Items that were unread when the page opened stay highlighted
 * while it is open; they are marked as read in the background, which clears the sidebar count.
 * `studentId` limits the marking to one student (a mentor viewing that student's page).
 */
export function ActivityList({
    items,
    studentId,
    emptyText,
}: {
    items: Pick<NotificationRow, "id" | "message" | "href" | "readAt" | "createdAt">[];
    studentId?: string;
    emptyText: string;
}) {
    const [fresh] = useState(
        () => new Set(items.filter((item) => !item.readAt).map((item) => item.id)),
    );
    useEffect(() => {
        if (fresh.size > 0) void markNotificationsRead(studentId);
    }, [fresh, studentId]);

    if (items.length === 0) {
        return (
            <Empty className="border-y">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Bell />
                    </EmptyMedia>
                    <EmptyTitle>Nothing new</EmptyTitle>
                    <EmptyDescription>{emptyText}</EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    return (
        <ul className="divide-y border-y">
            {items.map((item) => {
                const unread = fresh.has(item.id);
                const body = (
                    <>
                        <span
                            className={cn(
                                "mt-1.5 size-2 shrink-0 rounded-full",
                                unread ? "bg-primary" : "bg-transparent",
                            )}
                            aria-hidden
                        />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className={cn("text-sm", unread && "font-medium")}>
                                {unread && <span className="sr-only">New: </span>}
                                {item.message}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatDate(item.createdAt)}
                            </span>
                        </span>
                        {item.href && (
                            <ChevronRight
                                className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                                aria-hidden
                            />
                        )}
                    </>
                );
                const className = cn(
                    "flex items-start gap-3 px-1 py-3",
                    unread && "bg-primary/5",
                    item.href && "outline-none hover:bg-muted focus-visible:bg-muted",
                );
                return (
                    <li key={item.id}>
                        {item.href ? (
                            <Link prefetch={false} href={item.href} className={className}>
                                {body}
                            </Link>
                        ) : (
                            <div className={className}>{body}</div>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
