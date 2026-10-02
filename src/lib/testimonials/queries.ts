import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";

export async function listTestimonials() {
    await requireAdmin();
    return db()
        .select()
        .from(testimonials)
        .orderBy(asc(testimonials.position), desc(testimonials.createdAt));
}

export async function listPublishedTestimonials() {
    return db()
        .select({
            id: testimonials.id,
            name: testimonials.name,
            role: testimonials.role,
            quote: testimonials.quote,
            highlight: testimonials.highlight,
            rating: testimonials.rating,
        })
        .from(testimonials)
        .where(eq(testimonials.published, true))
        .orderBy(asc(testimonials.position), desc(testimonials.createdAt))
        .limit(24);
}

export type PublicTestimonial = Awaited<ReturnType<typeof listPublishedTestimonials>>[number];
