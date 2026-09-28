import type { FormFieldDef } from "@/lib/forms";

export const ADMISSIONS_FALLBACK_NAME = "New admissions";

export const sectionFields: FormFieldDef[] = [
    {
        name: "name",
        label: "Section name",
        type: "text",
        required: true,
        max: 60,
        placeholder: "e.g. Class 12 · Batch A",
    },
];
