import "server-only";
import { after } from "next/server";
import { and, eq, isNull } from "drizzle-orm";
import type { CurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { notifications, type Role } from "@/lib/db/schema";

type NewNotification = {
    audience: Role;
    studentId: string;
    actorId?: string;
    message: string;
    href?: string;
    groupKey?: string;
};

/** Where a change happened, so the notification links to the right page for each side. */
export type Area = "profile" | "log" | "tasks";

async function write(notification: NewNotification) {
    const { audience, studentId, groupKey } = notification;
    if (groupKey) {
        // Repeated edits of the same thing update the unread notification instead of adding more.
        const merged = await db()
            .update(notifications)
            .set({ ...notification, createdAt: new Date() })
            .where(
                and(
                    eq(notifications.audience, audience),
                    eq(notifications.studentId, studentId),
                    eq(notifications.groupKey, groupKey),
                    isNull(notifications.readAt),
                ),
            )
            .returning({ id: notifications.id });
        if (merged.length > 0) return;
    }
    await db().insert(notifications).values(notification);
}

/** Saves a notification after the response is sent, so it never slows down the action. */
export function notify(notification: NewNotification) {
    after(() => write(notification).catch((error) => console.error("[notify]", error)));
}

/**
 * Tells the other side about a change to a student's data: a mentor's change goes to the
 * student ("Your mentor updated …"), a student's change goes to the mentors ("Riya updated …").
 */
export function notifyChange(
    actor: Pick<CurrentUser, "id" | "name" | "role">,
    studentId: string,
    action: string,
    { area, groupKey }: { area: Area; groupKey?: string },
) {
    const fromMentor = actor.role === "admin";
    notify({
        audience: fromMentor ? "student" : "admin",
        studentId,
        actorId: actor.id,
        message: `${fromMentor ? "Your mentor" : actor.name} ${action}`,
        href: fromMentor
            ? area === "tasks"
                ? "/dashboard/tasks"
                : "/dashboard"
            : `/dashboard/students/${studentId}`,
        groupKey: groupKey && `${groupKey}:${actor.id}`,
    });
}
