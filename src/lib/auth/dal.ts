import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword } from "./password";
import { readSession } from "./session";

/** The signed-in user, checked against the database once per request. */
export const getCurrentUser = cache(async () => {
    const session = await readSession();
    if (!session) return null;
    const [user] = await db()
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
            role: users.role,
            sessionVersion: users.sessionVersion,
        })
        .from(users)
        .where(eq(users.id, session.userId));
    if (!user || user.sessionVersion !== session.version) return null;
    return { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role };
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

export async function requireUser() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");
    return user;
}

export async function requireAdmin() {
    const user = await requireUser();
    if (user.role !== "admin") redirect("/dashboard");
    return user;
}

/** Sets a new password and signs out every existing session for that user. */
export async function updatePassword(userId: string, password: string) {
    const [row] = await db()
        .update(users)
        .set({
            passwordHash: await hashPassword(password),
            sessionVersion: sql`${users.sessionVersion} + 1`,
        })
        .where(eq(users.id, userId))
        .returning({ userId: users.id, role: users.role, version: users.sessionVersion });
    return row;
}
