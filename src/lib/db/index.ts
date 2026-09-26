import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "./schema";

/**
 * Connects to Postgres, including Supabase. Supabase's transaction pooler (port 6543) can't
 * use prepared statements, and `pgbouncer=true` is a Prisma-only flag the driver would reject.
 */
function connect(url: string) {
    const parsed = new URL(url);
    const transactionPooler =
        parsed.port === "6543" || parsed.searchParams.get("pgbouncer") === "true";
    parsed.searchParams.delete("pgbouncer");
    return postgres(parsed.toString(), { max: 10, prepare: !transactionPooler });
}

const createDb = () =>
    drizzle({ client: connect(env().DATABASE_URL), schema, casing: "snake_case" });

// Created on first query (so builds don't need DATABASE_URL) and reused across hot reloads.
const globalForDb = globalThis as unknown as { db?: ReturnType<typeof createDb> };
export const db = () => (globalForDb.db ??= createDb());

/** True when a query failed on a unique constraint, such as a duplicate email. */
export function isUniqueViolation(error: unknown) {
    const cause = error instanceof Error && error.cause ? error.cause : error;
    return (cause as { code?: string } | null)?.code === "23505";
}
