import "server-only";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { Role } from "@/lib/db/schema";
import { env } from "@/lib/env";

export const SESSION_COOKIE = "iv_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const RENEW_AFTER_SECONDS = 60 * 60 * 24;

export const sessionCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
} as const;

export type SessionPayload = { userId: string; role: Role; version: number };

const secretKey = () => new TextEncoder().encode(env().SESSION_SECRET);

const sign = ({ userId, role, version }: SessionPayload) =>
    new SignJWT({ userId, role, version })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime(`${MAX_AGE_SECONDS}s`)
        .sign(secretKey());

async function verify(token: string | undefined) {
    if (!token) return null;
    try {
        const { payload } = await jwtVerify<SessionPayload>(token, secretKey(), {
            algorithms: ["HS256"],
        });
        return payload;
    } catch {
        return null;
    }
}

export async function createSession(payload: SessionPayload) {
    (await cookies()).set(SESSION_COOKIE, await sign(payload), sessionCookieOptions);
}

export async function readSession(): Promise<SessionPayload | null> {
    return verify((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function renewSessionToken(token: string) {
    const payload = await verify(token);
    if (!payload?.iat || Date.now() / 1000 - payload.iat < RENEW_AFTER_SECONDS) return null;
    return sign(payload);
}

export async function deleteSession() {
    (await cookies()).delete(SESSION_COOKIE);
}
