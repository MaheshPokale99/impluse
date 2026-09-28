"use client";

import { createContext, use, type ReactNode } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const UnreadContext = createContext(0);

export function UnreadProvider({ count, children }: { count: number; children: ReactNode }) {
    return <UnreadContext value={count}>{children}</UnreadContext>;
}

export function HeaderNotifications() {
    const count = use(UnreadContext);
    return (
        <Button asChild variant="ghost" size="icon-sm" className="relative ml-auto md:hidden">
            <Link
                prefetch={false}
                href="/dashboard/notifications"
                aria-label={count ? `Notifications, ${count} unread` : "Notifications"}
            >
                <Bell />
                {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </Link>
        </Button>
    );
}
