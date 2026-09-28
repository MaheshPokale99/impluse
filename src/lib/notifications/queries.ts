import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";

/**
 * The viewer's notifications, newest first: for mentors, what students did (optionally one
 * student's); for a student, what the mentor changed on their account.
 */
export async function listNotifications({
    studentId,
    limit = 100,
}: { studentId?: string; limit?: number } = {}) {
    const viewer = await requireUser();
    const admin = viewer.role === "admin";
    const owner = admin ? studentId : viewer.id;
    return db()
        .select({
            id: notifications.id,
            studentId: notifications.studentId,
            studentName: users.name,
            message: notifications.message,
            href: notifications.href,
            readAt: notifications.readAt,
            createdAt: notifications.createdAt,
        })
        .from(notifications)
        .innerJoin(users, eq(users.id, notifications.studentId))
        .where(
            and(
                eq(notifications.audience, viewer.role),
                owner ? eq(notifications.studentId, owner) : undefined,
            ),
        )
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
}

export type NotificationRow = Awaited<ReturnType<typeof listNotifications>>[number];

/** Unread notifications for mentors, counted per student (shown next to names in the sidebar). */
export async function unreadByStudent() {
    await requireAdmin();
    const rows = await db()
        .select({ studentId: notifications.studentId, unread: count() })
        .from(notifications)
        .where(and(eq(notifications.audience, "admin"), isNull(notifications.readAt)))
        .groupBy(notifications.studentId);
    return Object.fromEntries(rows.map((row) => [row.studentId, row.unread]));
}

/** A student's own unread notifications. */
export async function unreadForStudent() {
    const viewer = await requireUser();
    const [row] = await db()
        .select({ unread: count() })
        .from(notifications)
        .where(
            and(
                eq(notifications.audience, "student"),
                eq(notifications.studentId, viewer.id),
                isNull(notifications.readAt),
            ),
        );
    return row?.unread ?? 0;
}
