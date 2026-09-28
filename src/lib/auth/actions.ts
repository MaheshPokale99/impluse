"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db, isUniqueViolation } from "@/lib/db";
import { studentProfiles, users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { echoValues, errorState, parseForm, type ActionState } from "@/lib/forms";
import { notify } from "@/lib/notifications/notify";
import { studentOptions } from "@/lib/students/fields";
import { requireUser, updatePassword } from "./dal";
import {
    accountFields,
    changePasswordFields,
    loginFields,
    signupFields,
    signupProfileFields,
} from "./fields";
import { hashPassword, needsRehash, verifyPassword } from "./password";
import { createSession, deleteSession } from "./session";
import { consumePasswordToken, createPasswordToken } from "./tokens";

const findUserByEmail = async (email: string) =>
    (await db().select().from(users).where(eq(users.email, email)))[0];

// Shown when the database can't be reached (for example, a connection or credentials problem).
const unavailable = "We can't reach the server right now. Please try again in a few minutes.";

export async function login(_: ActionState, formData: FormData): Promise<ActionState> {
    const parsed = parseForm<{ email: string; password: string }>(loginFields, formData);
    if (parsed.state) return parsed.state;

    const { email, password } = parsed.data;
    let user: Awaited<ReturnType<typeof findUserByEmail>>;
    try {
        user = await findUserByEmail(email);
    } catch (error) {
        console.error(error);
        return errorState(unavailable, undefined, { email });
    }
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
        return errorState("Incorrect email or password.", undefined, { email });
    }
    if (user.status === "pending") {
        return errorState(
            "Your registration is waiting for your mentor's approval. You'll get an email once it's approved.",
            undefined,
            { email },
        );
    }
    if (needsRehash(user.passwordHash)) {
        // Upgrade older hashes after the response, so signing in isn't slowed down.
        const userId = user.id;
        after(async () => {
            await db()
                .update(users)
                .set({ passwordHash: await hashPassword(password) })
                .where(eq(users.id, userId));
        });
    }
    await createSession({ userId: user.id, role: user.role, version: user.sessionVersion });
    redirect("/dashboard");
}

/**
 * A student asks to join from the sign-up page. The account starts as `pending` (it can't sign
 * in) and waits in "New admissions" until a mentor approves it.
 */
export async function signup(_: ActionState, formData: FormData): Promise<ActionState> {
    const fields = [...signupFields, ...signupProfileFields(studentOptions.targetExam)];
    const parsed = parseForm<{
        name: string;
        email: string;
        phone: string;
        password: string;
        targetExam: string | null;
        targetYear: number | null;
        schoolCollege: string | null;
    }>(fields, formData);
    if (parsed.state) return parsed.state;

    const { name, email, phone, password, ...profile } = parsed.data;
    let userId: string;
    try {
        const passwordHash = await hashPassword(password);
        userId = await db().transaction(async (tx) => {
            const [user] = await tx
                .insert(users)
                .values({ name, email, phone, passwordHash, role: "student", status: "pending" })
                .returning({ id: users.id });
            await tx.insert(studentProfiles).values({ ...profile, userId: user.id });
            return user.id;
        });
    } catch (error) {
        if (isUniqueViolation(error)) {
            return errorState(
                "Please fix the highlighted fields.",
                { email: ["An account with this email already exists. Try signing in."] },
                echoValues(fields, formData),
            );
        }
        console.error(error);
        return errorState(unavailable, undefined, echoValues(fields, formData));
    }
    notify({
        audience: "admin",
        studentId: userId,
        message: `${name} (${email}) signed up and is waiting for your approval.`,
        href: "/dashboard/admissions",
    });
    revalidatePath("/dashboard", "layout");
    return {
        status: "success",
        message:
            "Thanks! Your request was sent to your mentor. You'll get an email once it's approved, then you can sign in.",
    };
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}

export async function requestPasswordReset(
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const parsed = parseForm<{ email: string }>([accountFields.email], formData);
    if (parsed.state) return parsed.state;

    try {
        const user = await findUserByEmail(parsed.data.email);
        if (user?.status === "active")
            await sendPasswordResetEmail(user, await createPasswordToken(user.id, 1));
    } catch (error) {
        console.error(error);
        return errorState(unavailable, undefined, { email: parsed.data.email });
    }
    return {
        status: "success",
        message: "If an account exists for that email, a reset link is on its way.",
    };
}

export async function resetPassword(
    token: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const parsed = parseForm<{ password: string }>([accountFields.newPassword], formData);
    if (parsed.state) return parsed.state;

    let updated: Awaited<ReturnType<typeof updatePassword>>;
    try {
        const userId = await consumePasswordToken(token);
        if (!userId) return errorState("This link is invalid or has expired. Request a new one.");
        updated = await updatePassword(userId, parsed.data.password);
    } catch (error) {
        console.error(error);
        return errorState(unavailable);
    }
    await createSession(updated);
    redirect("/dashboard");
}

export async function changePassword(_: ActionState, formData: FormData): Promise<ActionState> {
    const user = await requireUser();
    const parsed = parseForm<{ currentPassword: string; password: string }>(
        changePasswordFields,
        formData,
    );
    if (parsed.state) return parsed.state;

    const [{ passwordHash }] = await db()
        .select({ passwordHash: users.passwordHash })
        .from(users)
        .where(eq(users.id, user.id));
    if (!(await verifyPassword(parsed.data.currentPassword, passwordHash))) {
        return errorState("Please fix the highlighted fields.", {
            currentPassword: ["Current password is incorrect."],
        });
    }
    // Other devices are signed out; this one gets a fresh session.
    await createSession(await updatePassword(user.id, parsed.data.password));
    return { status: "success", message: "Password updated." };
}
