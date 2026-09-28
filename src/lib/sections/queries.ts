import "server-only";
import { cache } from "react";
import { asc, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { sections, studentProfiles, users } from "@/lib/db/schema";
import type { FieldOption } from "@/lib/forms";

/** Every section, the "New admissions" one first, then in the order they were created. */
export const listSections = cache(async () => {
    await requireAdmin();
    return db().select().from(sections).orderBy(desc(sections.admissions), asc(sections.createdAt));
});

/** Sections a student can be placed in (every section except "New admissions"). */
export async function listSectionOptions(): Promise<FieldOption[]> {
    const rows = await listSections();
    return rows.filter((row) => !row.admissions).map((row) => ({ value: row.id, label: row.name }));
}

/** Every student with their section and account status, for the sidebar. */
export async function listSidebarStudents() {
    await requireAdmin();
    return db()
        .select({
            id: users.id,
            name: users.name,
            status: users.status,
            sectionId: studentProfiles.sectionId,
        })
        .from(users)
        .innerJoin(studentProfiles, eq(studentProfiles.userId, users.id))
        .orderBy(asc(users.name));
}

export type SidebarStudent = Awaited<ReturnType<typeof listSidebarStudents>>[number];
