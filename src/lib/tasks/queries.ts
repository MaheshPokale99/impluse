import "server-only";
import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { requireUser, type CurrentUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { studentProfiles, tasks, users, type Task } from "@/lib/db/schema";

/** Students can edit or delete tasks they created; mentor-assigned tasks can only be completed. */
export const canEditTask = (viewer: CurrentUser, task: Pick<Task, "createdById">) =>
    viewer.role === "admin" || task.createdById === viewer.id;

export async function listTasks(studentId?: string) {
    const viewer = await requireUser();
    const owner = viewer.role === "admin" ? studentId : viewer.id;
    const rows = await db()
        .select({ ...getTableColumns(tasks), studentName: users.name })
        .from(tasks)
        .innerJoin(users, eq(users.id, tasks.studentId))
        .where(owner ? eq(tasks.studentId, owner) : undefined)
        .orderBy(
            sql`${tasks.completedAt} is not null`,
            sql`${tasks.dueDate} asc nulls last`,
            desc(tasks.createdAt),
        );
    return rows.map((task) => ({
        ...task,
        assignedByMentor: task.createdById !== task.studentId,
        canEdit: canEditTask(viewer, task),
    }));
}

export type TaskRow = Awaited<ReturnType<typeof listTasks>>[number];

export async function getTaskProgress(studentId?: string) {
    const viewer = await requireUser();
    const owner = viewer.role === "admin" ? studentId : viewer.id;
    return db()
        .select({
            studentId: users.id,
            name: users.name,
            studentNumber: studentProfiles.studentNumber,
            total: count(tasks.id),
            done: count(tasks.completedAt),
            overdue: count(
                sql`case when ${tasks.completedAt} is null and ${tasks.dueDate} < current_date then 1 end`,
            ),
            doneThisWeek: count(
                sql`case when ${tasks.completedAt} >= now() - interval '7 days' then 1 end`,
            ),
        })
        .from(users)
        .innerJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .leftJoin(tasks, eq(tasks.studentId, users.id))
        .where(owner ? eq(users.id, owner) : undefined)
        .groupBy(users.id, studentProfiles.studentNumber)
        .orderBy(users.name);
}

export type TaskProgress = Awaited<ReturnType<typeof getTaskProgress>>[number];
