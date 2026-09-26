import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { passwordResetTokens } from "@/lib/db/schema";

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createPasswordToken(userId: string, ttlHours: number) {
    const token = randomBytes(32).toString("base64url");
    await db().delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await db()
        .insert(passwordResetTokens)
        .values({
            tokenHash: hashToken(token),
            userId,
            expiresAt: new Date(Date.now() + ttlHours * 60 * 60 * 1000),
        });
    return token;
}

/** Deletes the token and returns its user ID when the token is valid and unexpired. */
export async function consumePasswordToken(token: string) {
    const [row] = await db()
        .delete(passwordResetTokens)
        .where(
            and(
                eq(passwordResetTokens.tokenHash, hashToken(token)),
                gt(passwordResetTokens.expiresAt, new Date()),
            ),
        )
        .returning({ userId: passwordResetTokens.userId });
    return row?.userId ?? null;
}
