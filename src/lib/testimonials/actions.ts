"use server";

import { revalidatePath } from "next/cache";
import { asc, desc, eq, min } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { errorState, isUuid, parseForm, type ActionState } from "@/lib/forms";
import { testimonialFields, type TestimonialForm } from "./fields";

function toRow(data: TestimonialForm) {
    return {
        name: data.name,
        role: data.role,
        quote: data.quote,
        highlight: data.highlight,
        rating: Number(data.rating),
        published: data.visibility === "published",
    };
}

function refresh() {
    revalidatePath("/");
    revalidatePath("/dashboard/testimonials");
}

export async function createTestimonial(_: ActionState, formData: FormData): Promise<ActionState> {
    await requireAdmin();
    const parsed = parseForm<TestimonialForm>(testimonialFields, formData);
    if (parsed.state) return parsed.state;
    const [{ first }] = await db()
        .select({ first: min(testimonials.position) })
        .from(testimonials);
    await db()
        .insert(testimonials)
        .values({ ...toRow(parsed.data), position: (first ?? 1) - 1 });
    refresh();
    return { status: "success", message: "Testimonial added." };
}

export async function updateTestimonial(
    id: string,
    _: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();
    if (!isUuid(id)) return errorState("Testimonial not found.");
    const parsed = parseForm<TestimonialForm>(testimonialFields, formData);
    if (parsed.state) return parsed.state;
    const [row] = await db()
        .update(testimonials)
        .set(toRow(parsed.data))
        .where(eq(testimonials.id, id))
        .returning({ id: testimonials.id });
    if (!row) return errorState("Testimonial not found.");
    refresh();
    return { status: "success", message: "Testimonial saved." };
}

export async function setTestimonialPublished(id: string, published: boolean) {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db().update(testimonials).set({ published }).where(eq(testimonials.id, id));
    refresh();
}

export async function moveTestimonial(id: string, direction: "up" | "down") {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db().transaction(async (tx) => {
        const rows = await tx
            .select({ id: testimonials.id, position: testimonials.position })
            .from(testimonials)
            .orderBy(asc(testimonials.position), desc(testimonials.createdAt));
        const from = rows.findIndex((row) => row.id === id);
        const to = direction === "up" ? from - 1 : from + 1;
        if (from === -1 || to < 0 || to >= rows.length) return;
        [rows[from], rows[to]] = [rows[to], rows[from]];
        for (const [position, row] of rows.entries()) {
            if (row.position === position) continue;
            await tx.update(testimonials).set({ position }).where(eq(testimonials.id, row.id));
        }
    });
    refresh();
}

export async function deleteTestimonial(id: string) {
    await requireAdmin();
    if (!isUuid(id)) return;
    await db().delete(testimonials).where(eq(testimonials.id, id));
    refresh();
}
