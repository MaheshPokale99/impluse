"use server";

import { redirect } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sendPasswordResetEmail } from "@/lib/email";
import { errorState, parseForm, type ActionState } from "@/lib/forms";
import { requireUser, updatePassword } from "./dal";
import { accountFields, changePasswordFields, loginFields } from "./fields";
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
        if (user) await sendPasswordResetEmail(user, await createPasswordToken(user.id, 1));
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
