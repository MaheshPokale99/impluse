"use server";

import { refresh } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { isUuid } from "@/lib/forms";

/**
 * Marks the viewer's unread notifications as read: a mentor's for one student (or all),
 * a student's own. Refreshes the page only when something changed, to update the sidebar.
 */
export async function markNotificationsRead(studentId?: string) {
    const viewer = await requireUser();
    const admin = viewer.role === "admin";
    const owner = admin ? studentId : viewer.id;
    if (owner !== undefined && !isUuid(owner)) return;
    const updated = await db()
        .update(notifications)
        .set({ readAt: new Date() })
        .where(
            and(
                eq(notifications.audience, viewer.role),
                owner ? eq(notifications.studentId, owner) : undefined,
                isNull(notifications.readAt),
            ),
        )
        .returning({ id: notifications.id });
    if (updated.length > 0) refresh();
}
