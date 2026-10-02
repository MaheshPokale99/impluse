"use client";

import { useTransition } from "react";
import {
    ArrowDown,
    ArrowUp,
    Eye,
    EyeOff,
    MessageSquareQuote,
    Pencil,
    Star,
    Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import type { Testimonial } from "@/lib/db/schema";
import {
    createTestimonial,
    deleteTestimonial,
    moveTestimonial,
    setTestimonialPublished,
    updateTestimonial,
} from "@/lib/testimonials/actions";
import { newTestimonialValues, testimonialFields } from "@/lib/testimonials/fields";
import { ConfirmAction, FormDialog } from "./dialogs";
import { initials } from "./values";

export function AddTestimonialButton({ label = "Add testimonial" }: { label?: string }) {
    return (
        <FormDialog
            title="Add a testimonial"
            description="It appears in the Student stories section of the website when it's set to show."
            action={createTestimonial}
            fields={testimonialFields}
            values={newTestimonialValues}
            columns={2}
            submitLabel="Add testimonial"
            trigger={
                <Button>
                    <MessageSquareQuote /> {label}
                </Button>
            }
        />
    );
}

function Stars({ rating }: { rating: number }) {
    return (
        <span className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }, (_, index) => (
                <Star
                    key={index}
                    aria-hidden
                    className={cn(
                        "size-3.5",
                        index < rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/40",
                    )}
                />
            ))}
        </span>
    );
}

function TestimonialRow({
    testimonial,
    first,
    last,
}: {
    testimonial: Testimonial;
    first: boolean;
    last: boolean;
}) {
    const [pending, startTransition] = useTransition();
    const run = (action: () => Promise<void>, message?: string) =>
        startTransition(async () => {
            await action();
            if (message) toast.success(message);
        });

    return (
        <li className={cn("flex flex-col gap-3 py-4 sm:flex-row", pending && "opacity-60")}>
            <div className="flex min-w-0 flex-1 items-start gap-3">
                <Avatar className="size-9">
                    <AvatarFallback className="text-xs">
                        {initials(testimonial.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="font-medium">{testimonial.name}</span>
                        {testimonial.role && (
                            <span className="text-sm text-muted-foreground">
                                {testimonial.role}
                            </span>
                        )}
                        {testimonial.published ? (
                            <Badge className="bg-success/10 text-success">On website</Badge>
                        ) : (
                            <Badge variant="secondary">Hidden</Badge>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Stars rating={testimonial.rating} />
                        {testimonial.highlight && (
                            <Badge variant="outline">{testimonial.highlight}</Badge>
                        )}
                    </div>
                    <p className="line-clamp-3 text-sm break-words text-muted-foreground">
                        “{testimonial.quote}”
                    </p>
                </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-start gap-1.5 pl-12 sm:pl-0">
                <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Move up"
                    title="Move up"
                    disabled={first || pending}
                    onClick={() => run(() => moveTestimonial(testimonial.id, "up"))}
                >
                    <ArrowUp />
                </Button>
                <Button
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Move down"
                    title="Move down"
                    disabled={last || pending}
                    onClick={() => run(() => moveTestimonial(testimonial.id, "down"))}
                >
                    <ArrowDown />
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                        run(
                            () => setTestimonialPublished(testimonial.id, !testimonial.published),
                            testimonial.published
                                ? "Hidden from the website."
                                : "Now showing on the website.",
                        )
                    }
                >
                    {testimonial.published ? <EyeOff /> : <Eye />}
                    {testimonial.published ? "Hide" : "Show"}
                </Button>
                <FormDialog
                    title={`Edit ${testimonial.name}'s testimonial`}
                    action={updateTestimonial.bind(null, testimonial.id)}
                    fields={testimonialFields}
                    values={{
                        name: testimonial.name,
                        role: testimonial.role ?? "",
                        quote: testimonial.quote,
                        highlight: testimonial.highlight ?? "",
                        rating: String(testimonial.rating),
                        visibility: testimonial.published ? "published" : "hidden",
                    }}
                    columns={2}
                    submitLabel="Save changes"
                    trigger={
                        <Button size="sm" variant="outline" disabled={pending}>
                            <Pencil /> Edit
                        </Button>
                    }
                />
                <ConfirmAction
                    title={`Delete ${testimonial.name}'s testimonial?`}
                    description="It is removed from the website and can't be restored. Hide it instead if you might want it back."
                    confirmLabel="Delete"
                    action={async () => {
                        await deleteTestimonial(testimonial.id);
                        toast.success("Testimonial deleted.");
                    }}
                    trigger={
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            aria-label="Delete"
                            title="Delete"
                            disabled={pending}
                            className="text-muted-foreground hover:text-destructive"
                        >
                            <Trash2 />
                        </Button>
                    }
                />
            </div>
        </li>
    );
}

export function TestimonialList({ testimonials }: { testimonials: Testimonial[] }) {
    if (testimonials.length === 0) {
        return (
            <Empty className="border-y">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <MessageSquareQuote />
                    </EmptyMedia>
                    <EmptyTitle>No testimonials yet</EmptyTitle>
                    <EmptyDescription>
                        Add what students and parents say about the guidance. The Student stories
                        section appears on the website once at least one is set to show.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <AddTestimonialButton label="Add the first one" />
                </EmptyContent>
            </Empty>
        );
    }

    return (
        <ul className="divide-y border-y">
            {testimonials.map((testimonial, index) => (
                <TestimonialRow
                    key={testimonial.id}
                    testimonial={testimonial}
                    first={index === 0}
                    last={index === testimonials.length - 1}
                />
            ))}
        </ul>
    );
}
