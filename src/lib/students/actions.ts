"use server";

import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq } from "drizzle-orm";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { profileFields } from "@/lib/auth/fields";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { todayInIndia } from "@/lib/dates";
import { db, isUniqueViolation } from "@/lib/db";
import { studentEntries, studentProfiles, users } from "@/lib/db/schema";
import { sendWelcomeEmail } from "@/lib/email";
import {
    echoValues,
    errorState,
    isUuid,
    parseForm,
    parseValue,
    type ActionState,
} from "@/lib/forms";
import {
    canEdit,
    contactKeys,
    createStudentSections,
    entryFields,
    findEntryField,
    findStudentField,
    perDayKeys,
} from "./fields";

type ProfileValues = Partial<typeof studentProfiles.$inferInsert>;
type UserValues = Partial<typeof users.$inferInsert>;
type EntryValues = Partial<typeof studentEntries.$inferInsert>;

export type FieldUpdateResult = { ok: true } | { ok: false; error: string };

const createFields = createStudentSections.flatMap((section) => section.fields);
const duplicateEmail = "An account with this email already exists.";
const notAllowed: FieldUpdateResult = { ok: false, error: "You can't change this field." };

export async function createStudent(_: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const parsed = parseForm<ProfileValues & { name: string; email: string; phone: string | null }>(
        createFields,
        formData,
    );
    if (parsed.state) return parsed.state;

    const { name, email, phone, ...profile } = parsed.data;
    const password = generatePassword();
    let userId: string;
    try {
        const passwordHash = await hashPassword(password);
        userId = await db().transaction(async (tx) => {
            const [user] = await tx
                .insert(users)
                .values({ name, email, phone, passwordHash, role: "student" })
                .returning({ id: users.id });
            await tx.insert(studentProfiles).values({ ...profile, userId: user.id });
            return user.id;
        });
    } catch (error) {
        if (!isUniqueViolation(error)) throw error;
        return errorState(
            "Please fix the highlighted fields.",
            { email: [duplicateEmail] },
            echoValues(createFields, formData),
        );
    }
    revalidatePath("/dashboard", "layout");

    try {
        await sendWelcomeEmail({ name, email }, password);
    } catch (error) {
        console.error(error);
        return errorState(
            `${name}'s account was created, but the email couldn't be sent. Share these login details with them: ${email} / ${password}`,
        );
    }
    redirect(`/dashboard/students/${userId}`);
}

export async function updateStudentField(
    studentId: string,
    key: string,
    raw: string,
): Promise<FieldUpdateResult> {
    const viewer = await requireUser();
    const field = findStudentField(key);
    if (!field || !isUuid(studentId) || !canEdit(viewer.role, viewer.id === studentId, field)) {
        return notAllowed;
    }
    const parsed = parseValue(field, raw);
    if (!parsed.ok) return parsed;

    const change = { [field.name]: parsed.value };
    try {
        if (contactKeys.has(field.name)) {
            await db()
                .update(users)
                .set(change as UserValues)
                .where(and(eq(users.id, studentId), eq(users.role, "student")));
        } else {
            await db()
                .update(studentProfiles)
                .set(change as ProfileValues)
                .where(eq(studentProfiles.userId, studentId));
        }
    } catch (error) {
        if (isUniqueViolation(error)) return { ok: false, error: duplicateEmail };
        throw error;
    }
    refresh();
    return { ok: true };
}

export async function addEntry(studentId: string): Promise<FieldUpdateResult> {
    await requireAdmin();
    if (!isUuid(studentId)) return { ok: false, error: "Student not found." };
    const [previous] = await db()
        .select()
        .from(studentEntries)
        .where(eq(studentEntries.studentId, studentId))
        .orderBy(desc(studentEntries.date))
        .limit(1);
    const carried = Object.fromEntries(
        entryFields
            .filter((field) => previous && !perDayKeys.has(field.name))
            .map((field) => [field.name, previous[field.name]]),
    ) as EntryValues;
    try {
        await db()
            .insert(studentEntries)
            .values({ ...carried, studentId, date: todayInIndia() });
    } catch (error) {
        if (isUniqueViolation(error)) return { ok: false, error: "Today's row already exists." };
        throw error;
    }
    refresh();
    return { ok: true };
}

/** Saves one cell of the daily log. */
export async function updateEntryField(
    entryId: string,
    key: string,
    raw: string,
): Promise<FieldUpdateResult> {
    const viewer = await requireUser();
    const field = findEntryField(key);
    const admin = viewer.role === "admin";
    // Students may only change fields marked editable, and only on their own rows.
    if (!field || !isUuid(entryId) || !canEdit(viewer.role, true, field)) return notAllowed;

    const parsed = parseValue(field, raw);
    if (!parsed.ok) return parsed;
    try {
        // Ownership is checked in the WHERE clause: one database round trip.
        const updated = await db()
            .update(studentEntries)
            .set({ [field.name]: parsed.value } as EntryValues)
            .where(
                admin
                    ? eq(studentEntries.id, entryId)
                    : and(eq(studentEntries.id, entryId), eq(studentEntries.studentId, viewer.id)),
            )
            .returning({ id: studentEntries.id });
        if (updated.length === 0) return notAllowed;
    } catch (error) {
        if (isUniqueViolation(error)) {
            return { ok: false, error: "There's already a row for that date." };
        }
        throw error;
    }
    refresh();
    return { ok: true };
}

export async function deleteEntry(entryId: string) {
    await requireAdmin();
    if (!isUuid(entryId)) return;
    await db().delete(studentEntries).where(eq(studentEntries.id, entryId));
    refresh();
}

export async function deleteStudent(id: string) {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db()
        .delete(users)
        .where(and(eq(users.id, id), eq(users.role, "student")));
    revalidatePath("/dashboard", "layout");
    redirect("/dashboard");
}

export async function updateAccount(_: ActionState, formData: FormData): Promise<ActionState> {
    const admin = await requireAdmin();
    const parsed = parseForm<{ name: string; phone: string | null }>(profileFields, formData);
    if (parsed.state) return parsed.state;
    await db().update(users).set(parsed.data).where(eq(users.id, admin.id));
    refresh();
    return { status: "success", message: "Profile updated." };
}
