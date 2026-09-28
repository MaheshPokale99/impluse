"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, isNull, notExists, type SQL } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { sections, studentProfiles, users } from "@/lib/db/schema";
import { errorState, isUuid, parseForm, type ActionState } from "@/lib/forms";
import { sectionFields } from "./fields";

async function addSection(formData: FormData, moveStudents?: SQL): Promise<ActionState> {
    await requireAdmin();
    const parsed = parseForm<{ name: string }>(sectionFields, formData);
    if (parsed.state) return parsed.state;
    const { name } = parsed.data;
    await db().transaction(async (tx) => {
        const [section] = await tx.insert(sections).values({ name }).returning({ id: sections.id });
        if (moveStudents) {
            await tx.update(studentProfiles).set({ sectionId: section.id }).where(moveStudents);
        }
    });
    revalidatePath("/dashboard", "layout");
    return { status: "success", message: `Section "${name}" added.` };
}

export async function createSection(_: ActionState, formData: FormData): Promise<ActionState> {
    return addSection(formData);
}

export async function createSectionWithStudent(
    studentId: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    if (!isUuid(studentId)) return errorState("Student not found.");
    return addSection(formData, eq(studentProfiles.userId, studentId));
}

export async function nameUnsortedStudents(
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    return addSection(
        formData,
        and(
            isNull(studentProfiles.sectionId),
            inArray(
                studentProfiles.userId,
                db().select({ id: users.id }).from(users).where(eq(users.status, "active")),
            ),
        ),
    );
}

/** Renames any section, including "New admissions". */
export async function renameSection(
    id: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();
    const parsed = parseForm<{ name: string }>(sectionFields, formData);
    if (parsed.state) return parsed.state;
    if (!isUuid(id)) return errorState("Section not found.");
    await db().update(sections).set({ name: parsed.data.name }).where(eq(sections.id, id));
    revalidatePath("/dashboard", "layout");
    return { status: "success", message: "Section renamed." };
}

export async function deleteSection(id: string) {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db()
        .delete(sections)
        .where(
            and(
                eq(sections.id, id),
                eq(sections.admissions, false),
                notExists(
                    db()
                        .select({ id: studentProfiles.userId })
                        .from(studentProfiles)
                        .where(eq(studentProfiles.sectionId, sections.id)),
                ),
            ),
        );
    revalidatePath("/dashboard", "layout");
}
