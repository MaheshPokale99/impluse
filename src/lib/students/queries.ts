import "server-only";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { studentEntries, studentProfiles, users } from "@/lib/db/schema";
import { isUuid } from "@/lib/forms";
import { entryView, formatStudentId, type EntryRecord, type StudentRecord } from "./fields";

export const studentQuery = () =>
    db()
        .select({
            ...getTableColumns(studentProfiles),
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
        })
        .from(users)
        .innerJoin(studentProfiles, eq(studentProfiles.userId, users.id));

export async function listStudents() {
    await requireAdmin();
    const latest = db()
        .selectDistinctOn([studentEntries.studentId])
        .from(studentEntries)
        .orderBy(studentEntries.studentId, desc(studentEntries.date))
        .as("latest");
    const rows = await db()
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            studentNumber: studentProfiles.studentNumber,
            batch: studentProfiles.batch,
            studentStatus: studentProfiles.studentStatus,
            targetExam: studentProfiles.targetExam,
            targetYear: studentProfiles.targetYear,
            lastEntryDate: latest.date,
            priority: latest.priority,
            averageScore: latest.averageScore,
            lastTestScore: latest.lastTestScore,
            nextCallDate: latest.nextCallDate,
        })
        .from(users)
        .innerJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .leftJoin(latest, eq(latest.studentId, users.id))
        .orderBy(studentProfiles.studentNumber);
    return rows;
}

export type StudentSummary = Awaited<ReturnType<typeof listStudents>>[number];

export async function getStudent(id: string): Promise<StudentRecord | null> {
    const viewer = await requireUser();
    if (!isUuid(id) || (viewer.role !== "admin" && viewer.id !== id)) return null;
    const [record] = await studentQuery().where(eq(users.id, id));
    return record ?? null;
}

export async function listEntries(studentId: string): Promise<EntryRecord[]> {
    const viewer = await requireUser();
    if (!isUuid(studentId) || (viewer.role !== "admin" && viewer.id !== studentId)) return [];
    const rows = await db()
        .select()
        .from(studentEntries)
        .where(eq(studentEntries.studentId, studentId))
        .orderBy(desc(studentEntries.date));
    return rows.map((row) => entryView(row, viewer.role));
}

export async function listStudentOptions() {
    await requireAdmin();
    const rows = await db()
        .select({ value: users.id, name: users.name, studentNumber: studentProfiles.studentNumber })
        .from(users)
        .innerJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .orderBy(users.name);
    return rows.map((row) => ({
        value: row.value,
        name: row.name,
        label: `${row.name} (${formatStudentId(row.studentNumber)})`,
    }));
}
