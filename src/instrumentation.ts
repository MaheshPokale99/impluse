/** Runs once when the server starts: makes sure the admin from .env exists. */
export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs") return;
    try {
        const { ensureAdmin } = await import("@/lib/auth/bootstrap");
        await ensureAdmin();
    } catch (error) {
        // Never block the site from starting; the admin is retried on the next start.
        console.error("[admin] Could not check the admin account:", error);
    }
}
