"use server";

import { refresh } from "next/cache";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { requireAdmin, requireUser, type CurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { errorState, isUuid, parseForm, type ActionState } from "@/lib/forms";
import { notifyChange } from "@/lib/notifications/notify";
import { listStudentOptions } from "@/lib/students/queries";
import { reviewFields, taskFields } from "./fields";

type TaskInput = {
    studentId?: string;
    title: string;
    description: string | null;
    dueDate: string | null;
};

/** Tasks the viewer may edit or delete: all for mentors, only their own for students. */
const editable = (viewer: CurrentUser, id: string) =>
    viewer.role === "admin"
        ? eq(tasks.id, id)
        : and(eq(tasks.id, id), eq(tasks.createdById, viewer.id));

/** Tasks the viewer may tick off: all for mentors, any of their own tasks for students. */
const toggleable = (viewer: CurrentUser, id: string) =>
    viewer.role === "admin"
        ? eq(tasks.id, id)
        : and(eq(tasks.id, id), eq(tasks.studentId, viewer.id));

const changed = { studentId: tasks.studentId, title: tasks.title };

export async function createTask(_: ActionState, formData: FormData): Promise<ActionState> {
    const viewer = await requireUser();
    const students = viewer.role === "admin" ? await listStudentOptions() : undefined;
    const parsed = parseForm<TaskInput>(taskFields(students), formData);
    if (parsed.state) return parsed.state;

    const { studentId, ...task } = parsed.data;
    const [created] = await db()
        .insert(tasks)
        .values({ ...task, studentId: studentId ?? viewer.id, createdById: viewer.id })
        .returning(changed);
    notifyChange(viewer, created.studentId, `added a task: "${created.title}"`, {
        area: "tasks",
    });
    refresh();
    return { status: "success", message: "Task added." };
}

// Each write checks permission in its own WHERE clause: one database round trip per action.

export async function updateTask(
    id: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const viewer = await requireUser();
    const parsed = parseForm<TaskInput>(taskFields(), formData);
    if (parsed.state) return parsed.state;
    if (!isUuid(id)) return errorState("You can't edit this task.");

    const [updated] = await db()
        .update(tasks)
        .set(parsed.data)
        .where(editable(viewer, id))
        .returning(changed);
    if (!updated) return errorState("You can't edit this task.");
    notifyChange(viewer, updated.studentId, `edited the task "${updated.title}"`, {
        area: "tasks",
        groupKey: `task:${id}`,
    });
    refresh();
    return { status: "success", message: "Task updated." };
}

export async function toggleTask(id: string) {
    const viewer = await requireUser();
    if (!isUuid(id)) return;
    const [toggled] = await db()
        .update(tasks)
        .set({
            completedAt: sql`case when ${tasks.completedAt} is null then now() else null end`,
            // Ticking or unticking starts a new review. A mentor's own tick counts as approval.
            reviewStatus:
                viewer.role === "admin"
                    ? sql`case when ${tasks.completedAt} is null then 'approved'::review_status end`
                    : null,
            reviewedAt:
                viewer.role === "admin"
                    ? sql`case when ${tasks.completedAt} is null then now() end`
                    : null,
        })
        .where(toggleable(viewer, id))
        .returning({ ...changed, completedAt: tasks.completedAt });
    if (toggled) {
        const action = toggled.completedAt ? "completed" : "reopened";
        notifyChange(viewer, toggled.studentId, `${action} the task "${toggled.title}"`, {
            area: "tasks",
            groupKey: `task:${id}`,
        });
    }
    refresh();
}

export async function deleteTask(id: string) {
    const viewer = await requireUser();
    if (!isUuid(id)) return;
    const [deleted] = await db().delete(tasks).where(editable(viewer, id)).returning(changed);
    if (deleted) {
        notifyChange(viewer, deleted.studentId, `removed the task "${deleted.title}"`, {
            area: "tasks",
        });
    }
    refresh();
}

/** The mentor accepts a completed task. */
export async function approveTask(id: string) {
    const viewer = await requireAdmin();
    if (!isUuid(id)) return;
    const [approved] = await db()
        .update(tasks)
        .set({ reviewStatus: "approved", reviewedAt: new Date() })
        .where(and(eq(tasks.id, id), isNotNull(tasks.completedAt)))
        .returning(changed);
    if (approved) {
        notifyChange(viewer, approved.studentId, `approved your task "${approved.title}"`, {
            area: "tasks",
            groupKey: `task:${id}`,
        });
    }
    refresh();
}

/** The mentor sends a completed task back with a note; it returns to the student's to-do list. */
export async function requestTaskChanges(
    id: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const viewer = await requireAdmin();
    const parsed = parseForm<{ reviewNote: string }>(reviewFields, formData);
    if (parsed.state) return parsed.state;
    if (!isUuid(id)) return errorState("Task not found.");

    const [reviewed] = await db()
        .update(tasks)
        .set({
            reviewStatus: "changes_requested",
            reviewNote: parsed.data.reviewNote,
            reviewedAt: new Date(),
            completedAt: null,
        })
        .where(eq(tasks.id, id))
        .returning(changed);
    if (!reviewed) return errorState("Task not found.");
    notifyChange(
        viewer,
        reviewed.studentId,
        `asked for changes on "${reviewed.title}": ${parsed.data.reviewNote}`,
        { area: "tasks", groupKey: `task:${id}` },
    );
    refresh();
    return { status: "success", message: "Sent back to the student." };
}
