import "server-only";
import * as z from "zod";

// `KEY=` in a .env file means "not set".
const optional = <T extends z.ZodType>(schema: T) =>
    z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const schema = z.object({
    DATABASE_URL: z.url(),
    SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),
    RESEND_API_KEY: optional(z.string()),
    EMAIL_FROM: z.string().default("ImpulseVidya <onboarding@resend.dev>"),
    ADMIN_NAME: z.string().default("Admin"),
    ADMIN_EMAIL: optional(z.email()),
    ADMIN_PASSWORD: optional(z.string().min(8, "ADMIN_PASSWORD must be at least 8 characters")),
});

let cached: z.infer<typeof schema> | undefined;

// Parsed on first use so builds that never touch the database don't need the secrets.
export function env() {
    cached ??= schema.parse(process.env);
    return cached;
}
