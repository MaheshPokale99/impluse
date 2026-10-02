import type { FormFieldDef } from "@/lib/forms";

export const testimonialFields: FormFieldDef[] = [
    {
        name: "name",
        label: "Name",
        type: "text",
        required: true,
        max: 80,
        placeholder: "e.g. Aarav Sharma",
        autoComplete: "off",
    },
    {
        name: "role",
        label: "Role or class",
        type: "text",
        max: 80,
        placeholder: "e.g. Class 12 · JEE aspirant",
        autoComplete: "off",
    },
    {
        name: "quote",
        label: "Testimonial",
        type: "textarea",
        required: true,
        max: 600,
        placeholder: "What they said about the guidance, in their own words",
        hint: "Two to four sentences read best on the website.",
        wide: true,
    },
    {
        name: "highlight",
        label: "Highlight",
        type: "text",
        max: 60,
        placeholder: "e.g. Cleared JEE Main 2025",
        hint: "Optional. Shown as a small badge.",
        autoComplete: "off",
    },
    {
        name: "rating",
        label: "Rating",
        type: "select",
        required: true,
        options: [
            { value: "5", label: "5 stars" },
            { value: "4", label: "4 stars" },
            { value: "3", label: "3 stars" },
            { value: "2", label: "2 stars" },
            { value: "1", label: "1 star" },
        ],
    },
    {
        name: "visibility",
        label: "Visibility",
        type: "select",
        required: true,
        options: [
            { value: "published", label: "Show on website" },
            { value: "hidden", label: "Hidden" },
        ],
    },
];

export type TestimonialForm = {
    name: string;
    role: string | null;
    quote: string;
    highlight: string | null;
    rating: string;
    visibility: "published" | "hidden";
};

export const newTestimonialValues = { rating: "5", visibility: "published" };
