import type { Metadata } from "next";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddTestimonialButton, TestimonialList } from "@/components/portal/testimonial-list";
import { PageIcon, PortalPage, Summary } from "@/components/portal/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { listTestimonials } from "@/lib/testimonials/queries";

export const metadata: Metadata = { title: "Testimonials" };

export default async function TestimonialsPage() {
    await requireAdmin();
    const testimonials = await listTestimonials();
    const live = testimonials.filter((testimonial) => testimonial.published).length;

    return (
        <PortalPage
            crumbs={[{ label: "Testimonials" }]}
            icon={<PageIcon icon={MessageSquareQuote} />}
            title="Testimonials"
            description="What students and parents say, shown in the Student stories section of the website. The order here is the order on the website."
            actions={
                <>
                    <Button variant="outline" asChild>
                        <Link prefetch={false} href="/#testimonials" target="_blank">
                            <ExternalLink /> View on website
                        </Link>
                    </Button>
                    <AddTestimonialButton />
                </>
            }
        >
            {testimonials.length > 0 && (
                <Summary
                    items={[
                        { icon: MessageSquareQuote, label: "Total", value: testimonials.length },
                        { icon: Eye, label: "On website", value: live },
                        { icon: EyeOff, label: "Hidden", value: testimonials.length - live },
                    ]}
                />
            )}
            <TestimonialList testimonials={testimonials} />
        </PortalPage>
    );
}
