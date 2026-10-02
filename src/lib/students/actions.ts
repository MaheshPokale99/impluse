"use server";

import { randomUUID } from "node:crypto";
import { refresh, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, desc, eq, gt, sql, type SQL } from "drizzle-orm";
import type { PgUpdateSetSource } from "drizzle-orm/pg-core";
import { requireAdmin, requireUser } from "@/lib/auth/dal";
import { profileFields } from "@/lib/auth/fields";
import { generatePassword, hashPassword } from "@/lib/auth/password";
import { formatDay, todayInIndia } from "@/lib/dates";
import { db, isUniqueViolation } from "@/lib/db";
import { logColumns, notifications, studentEntries, studentProfiles, users } from "@/lib/db/schema";
import { sendApprovalEmail, sendWelcomeEmail } from "@/lib/email";
import {
    echoValues,
    errorState,
    isUuid,
    parseForm,
    parseValue,
    type ActionState,
} from "@/lib/forms";
import { notify, notifyChange } from "@/lib/notifications/notify";
import { listSectionOptions } from "@/lib/sections/queries";
import {
    approvalFields,
    canEdit,
    contactKeys,
    createStudentSections,
    entryDateField,
    entryFields,
    findStudentField,
    MAX_COLUMN_LABEL,
    newColumnFields,
    perDayKeys,
    sectionField,
    type CustomColumnType,
} from "./fields";
import { getLogColumns } from "./queries";

type ProfileValues = Partial<typeof studentProfiles.$inferInsert>;
type UserValues = Partial<typeof users.$inferInsert>;
type EntryValues = Partial<typeof studentEntries.$inferInsert>;

export type FieldUpdateResult = { ok: true } | { ok: false; error: string };

const duplicateEmail = "An account with this email already exists.";
const notAllowed: FieldUpdateResult = { ok: false, error: "You can't change this field." };

export async function createStudent(_: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const createFields = createStudentSections(await listSectionOptions()).flatMap(
        (section) => section.fields,
    );
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

/** Saves one profile property. Only mentors edit profiles (see `studentFields`). */
export async function updateStudentField(
    studentId: string,
    key: string,
    raw: string,
): Promise<FieldUpdateResult> {
    const viewer = await requireUser();
    const field =
        key === "sectionId" && viewer.role === "admin"
            ? sectionField(await listSectionOptions())
            : findStudentField(key);
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
    if (field.name === "sectionId") {
        // The sidebar groups students by section.
        revalidatePath("/dashboard", "layout");
    } else {
        notifyChange(viewer, studentId, `updated ${field.label} on your profile`, {
            area: "profile",
            groupKey: `profile:${field.name}`,
        });
    }
    refresh();
    return { ok: true };
}

export async function addEntry(studentId: string): Promise<FieldUpdateResult> {
    const viewer = await requireUser();
    const admin = viewer.role === "admin";
    if (!isUuid(studentId) || (!admin && viewer.id !== studentId)) {
        return { ok: false, error: "Student not found." };
    }
    const [[previous], columns] = await Promise.all([
        db()
            .select()
            .from(studentEntries)
            .where(eq(studentEntries.studentId, studentId))
            .orderBy(desc(studentEntries.date))
            .limit(1),
        getLogColumns(),
    ]);
    const carried = Object.fromEntries(
        entryFields
            .filter((field) => previous && !perDayKeys.has(field.name))
            .map((field) => [field.name, previous[field.name]]),
    ) as EntryValues;
    // Custom columns carry over too, except long text (notes about one day).
    const custom = Object.fromEntries(
        columns
            .filter((column) => previous && column.custom && column.type !== "textarea")
            .map((column) => [column.name, previous.custom[column.name] ?? null]),
    );
    const date = todayInIndia();
    try {
        await db()
            .insert(studentEntries)
            .values({ ...carried, custom, studentId, date });
    } catch (error) {
        if (isUniqueViolation(error)) return { ok: false, error: "Today's row already exists." };
        throw error;
    }
    notifyChange(
        viewer,
        studentId,
        `added ${admin ? "your" : "their"} daily log for ${formatDay(date)}`,
        { area: "log" },
    );
    refresh();
    return { ok: true };
}

/** Saves one cell of the daily log, in a built-in column or one of the mentor's own. */
export async function updateEntryField(
    entryId: string,
    key: string,
    raw: string,
): Promise<FieldUpdateResult> {
    const viewer = await requireUser();
    const admin = viewer.role === "admin";
    const column =
        key === entryDateField.name
            ? entryDateField
            : (await getLogColumns()).find((candidate) => candidate.name === key);
    // Students may only change fields marked editable, and only on their own rows.
    if (
        !column ||
        !isUuid(entryId) ||
        !canEdit(viewer.role, true, column) ||
        (!admin && "hidden" in column && column.hidden)
    ) {
        return notAllowed;
    }

    const parsed = parseValue(column, raw);
    if (!parsed.ok) return parsed;
    const ownRow = admin
        ? eq(studentEntries.id, entryId)
        : and(eq(studentEntries.id, entryId), eq(studentEntries.studentId, viewer.id));
    const change: PgUpdateSetSource<typeof studentEntries> =
        "custom" in column && column.custom
            ? {
                  custom: sql`${studentEntries.custom} || ${JSON.stringify({ [key]: parsed.value })}::jsonb`,
              }
            : { [key]: parsed.value };
    let updated: { studentId: string; date: string } | undefined;
    try {
        if (key === "lastCallDate") {
            updated = await logCallDate(ownRow, parsed.value as string | null);
        } else {
            // Ownership is checked in the WHERE clause: one database round trip.
            [updated] = await db()
                .update(studentEntries)
                .set(change)
                .where(ownRow)
                .returning({ studentId: studentEntries.studentId, date: studentEntries.date });
        }
        if (!updated) return notAllowed;
    } catch (error) {
        if (isUniqueViolation(error)) {
            return { ok: false, error: "There's already a row for that date." };
        }
        throw error;
    }
    // Students never hear about mentor-only columns.
    if (!(admin && column.adminOnly)) {
        notifyChange(
            viewer,
            updated.studentId,
            `updated ${column.label} in the daily log for ${formatDay(updated.date)}`,
            { area: "log", groupKey: `entry:${entryId}:${key}` },
        );
    }
    refresh();
    return { ok: true };
}

async function logCallDate(ownRow: SQL | undefined, lastCallDate: string | null) {
    return db().transaction(async (tx) => {
        const [before] = await tx
            .select({ lastCallDate: studentEntries.lastCallDate })
            .from(studentEntries)
            .where(ownRow)
            .for("update");
        if (!before) return undefined;
        const newCall =
            lastCallDate !== null &&
            (before.lastCallDate === null || lastCallDate > before.lastCallDate);
        const addCall = sql`coalesce(${studentEntries.callCount}, 0) + 1`;
        const [row] = await tx
            .update(studentEntries)
            .set(newCall ? { lastCallDate, callCount: addCall } : { lastCallDate })
            .where(ownRow)
            .returning({ studentId: studentEntries.studentId, date: studentEntries.date });
        if (newCall) {
            await tx
                .update(studentEntries)
                .set({ callCount: addCall })
                .where(
                    and(
                        eq(studentEntries.studentId, row.studentId),
                        gt(studentEntries.date, row.date),
                    ),
                );
        }
        return row;
    });
}

export async function deleteEntry(entryId: string) {
    const viewer = await requireAdmin();
    if (!isUuid(entryId)) return;
    const [deleted] = await db()
        .delete(studentEntries)
        .where(eq(studentEntries.id, entryId))
        .returning({ studentId: studentEntries.studentId, date: studentEntries.date });
    if (deleted) {
        notifyChange(
            viewer,
            deleted.studentId,
            `removed your daily log for ${formatDay(deleted.date)}`,
            { area: "log" },
        );
    }
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

// Admissions: sign-up requests wait in "New admissions" until a mentor approves them.

export async function approveStudent(
    id: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const viewer = await requireAdmin();
    const parsed = parseForm<{ sectionId: string | null; batch: string | null }>(
        approvalFields(await listSectionOptions()),
        formData,
    );
    if (parsed.state) return parsed.state;
    if (!isUuid(id)) return errorState("This request no longer exists.");

    const student = await db().transaction(async (tx) => {
        const [approved] = await tx
            .update(users)
            .set({ status: "active" })
            .where(and(eq(users.id, id), eq(users.status, "pending")))
            .returning({ name: users.name, email: users.email });
        if (!approved) return null;
        await tx
            .update(studentProfiles)
            .set({
                ...parsed.data,
                studentStatus: "Active",
                joiningDate: sql`coalesce(${studentProfiles.joiningDate}, ${todayInIndia()})`,
            })
            .where(eq(studentProfiles.userId, id));
        // The request has been handled, so its notification is done too.
        await tx
            .update(notifications)
            .set({ readAt: new Date() })
            .where(and(eq(notifications.audience, "admin"), eq(notifications.studentId, id)));
        return approved;
    });
    if (!student) return errorState("This request was already handled.");
    revalidatePath("/dashboard", "layout");

    notify({
        audience: "student",
        studentId: id,
        actorId: viewer.id,
        message: "Welcome! Your mentor approved your registration.",
        href: "/dashboard",
    });
    try {
        await sendApprovalEmail(student);
    } catch (error) {
        console.error(error);
        return {
            status: "success",
            message: `${student.name} is approved, but the email couldn't be sent. Let them know they can sign in now.`,
        };
    }
    return { status: "success", message: `${student.name} is approved and was emailed.` };
}

/** Declines a sign-up request and deletes it. */
export async function declineStudent(id: string) {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db()
        .delete(users)
        .where(and(eq(users.id, id), eq(users.status, "pending")));
    revalidatePath("/dashboard", "layout");
}

// Daily-log columns: the mentor can rename or hide any column and add their own.

export async function addLogColumn(_: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const parsed = parseForm<{
        label: string;
        type: CustomColumnType;
        visibility: "everyone" | "view" | "mentor";
    }>(newColumnFields, formData);
    if (parsed.state) return parsed.state;
    const { label, type, visibility } = parsed.data;
    await db()
        .insert(logColumns)
        .values({
            key: `c_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
            label,
            type,
            custom: true,
            studentVisible: visibility !== "mentor",
            studentEditable: visibility === "everyone",
        });
    refresh();
    return { status: "success", message: `Column "${label}" added.` };
}

export type ColumnChange = {
    label?: string;
    hidden?: boolean;
    studentVisible?: boolean;
    studentEditable?: boolean;
};

/**
 * Renames, hides or shows a column. Hiding only removes it from the table; its values stay
 * saved and come back when it's shown again. An empty name restores a built-in column's name.
 */
export async function updateLogColumn(
    key: string,
    change: ColumnChange,
): Promise<FieldUpdateResult> {
    await requireAdmin();
    const column = (await getLogColumns()).find((candidate) => candidate.name === key);
    if (!column) return { ok: false, error: "Column not found." };

    const values: Partial<typeof logColumns.$inferInsert> = {};
    if (change.label !== undefined) {
        const label = change.label.trim();
        if (label.length > MAX_COLUMN_LABEL) {
            return { ok: false, error: `Keep the name under ${MAX_COLUMN_LABEL} characters.` };
        }
        if (!label && column.custom) return { ok: false, error: "Give the column a name." };
        values.label = label || null;
    }
    if (typeof change.hidden === "boolean") values.hidden = change.hidden;
    if (typeof change.studentVisible === "boolean" && column.custom) {
        values.studentVisible = change.studentVisible;
    }
    if (typeof change.studentEditable === "boolean" && (column.custom || !column.adminOnly)) {
        values.studentEditable = change.studentEditable;
    }
    if (Object.keys(values).length === 0) return { ok: true };

    await db()
        .insert(logColumns)
        .values({ key, ...values })
        .onConflictDoUpdate({ target: logColumns.key, set: values });
    refresh();
    return { ok: true };
}

/** Deletes one of the mentor's own columns together with its values. */
export async function deleteLogColumn(key: string) {
    await requireAdmin();
    await db().transaction(async (tx) => {
        const [deleted] = await tx
            .delete(logColumns)
            .where(and(eq(logColumns.key, key), eq(logColumns.custom, true)))
            .returning({ key: logColumns.key });
        if (!deleted) return;
        await tx
            .update(studentEntries)
            .set({ custom: sql`${studentEntries.custom} - ${key}::text` })
            .where(sql`${studentEntries.custom} ? ${key}`);
    });
    refresh();
}
