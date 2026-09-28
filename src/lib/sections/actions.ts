"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { sections } from "@/lib/db/schema";
import { errorState, isUuid, parseForm, type ActionState } from "@/lib/forms";
import { sectionFields } from "./fields";

export async function createSection(_: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const parsed = parseForm<{ name: string }>(sectionFields, formData);
    if (parsed.state) return parsed.state;
    await db().insert(sections).values({ name: parsed.data.name });
    revalidatePath("/dashboard", "layout");
    return { status: "success", message: `Section "${parsed.data.name}" added.` };
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

/** Deletes a section; its students stay and move to "No section". */
export async function deleteSection(id: string) {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db()
        .delete(sections)
        .where(and(eq(sections.id, id), eq(sections.admissions, false)));
    revalidatePath("/dashboard", "layout");
}
