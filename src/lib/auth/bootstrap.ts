import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { hashPassword } from "./password";

/**
 * Creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD when that account doesn't exist yet.
 * An existing account keeps its password (change it from the Profile page) and is made admin.
 */
export async function ensureAdmin() {
    const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = env();
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) return;
    const email = ADMIN_EMAIL.toLowerCase();

    const [existing] = await db()
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.email, email));
    if (!existing) {
        await db()
            .insert(users)
            .values({
                name: ADMIN_NAME,
                email,
                passwordHash: await hashPassword(ADMIN_PASSWORD),
                role: "admin",
            })
            .onConflictDoNothing({ target: users.email });
        console.info(`[admin] Created admin account ${email}`);
    } else if (existing.role !== "admin") {
        await db().update(users).set({ role: "admin" }).where(eq(users.id, existing.id));
        console.info(`[admin] ${email} is now an admin`);
    }
}
