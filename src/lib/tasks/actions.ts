"use server";

import { refresh } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { requireUser, type CurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { errorState, isUuid, parseForm, type ActionState } from "@/lib/forms";
import { listStudentOptions } from "@/lib/students/queries";
import { taskFields } from "./fields";

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

export async function createTask(_: ActionState, formData: FormData): Promise<ActionState> {
    const viewer = await requireUser();
    const students = viewer.role === "admin" ? await listStudentOptions() : undefined;
    const parsed = parseForm<TaskInput>(taskFields(students), formData);
    if (parsed.state) return parsed.state;

    const { studentId, ...task } = parsed.data;
    await db()
        .insert(tasks)
        .values({ ...task, studentId: studentId ?? viewer.id, createdById: viewer.id });
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

    const updated = await db()
        .update(tasks)
        .set(parsed.data)
        .where(editable(viewer, id))
        .returning({ id: tasks.id });
    if (updated.length === 0) return errorState("You can't edit this task.");
    refresh();
    return { status: "success", message: "Task updated." };
}

export async function toggleTask(id: string) {
    const viewer = await requireUser();
    if (!isUuid(id)) return;
    await db()
        .update(tasks)
        .set({ completedAt: sql`case when ${tasks.completedAt} is null then now() else null end` })
        .where(toggleable(viewer, id));
    refresh();
}

export async function deleteTask(id: string) {
    const viewer = await requireUser();
    if (!isUuid(id)) return;
    await db().delete(tasks).where(editable(viewer, id));
    refresh();
}
