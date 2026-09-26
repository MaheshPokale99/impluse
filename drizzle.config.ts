import { defineConfig } from "drizzle-kit";

try {
    process.loadEnvFile(".env.local");
} catch {
    // Fall back to variables already set in the environment (for example, in CI).
}

/**
 * Migrations need a session connection. With Supabase's transaction pooler (port 6543), use
 * the session pooler on the same host (port 5432) instead; drop the Prisma-only flag.
 */
function migrationUrl(value: string) {
    const url = new URL(value);
    if (url.hostname.endsWith(".pooler.supabase.com") && url.port === "6543") url.port = "5432";
    url.searchParams.delete("pgbouncer");
    return url.toString();
}

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/lib/db/schema.ts",
    out: "./drizzle",
    casing: "snake_case",
    dbCredentials: { url: migrationUrl(process.env.DATABASE_URL!) },
});
