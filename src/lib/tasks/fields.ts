import type { FieldOption, FormFieldDef } from "@/lib/forms";

const baseFields: FormFieldDef[] = [
    {
        name: "title",
        label: "Task",
        type: "text",
        required: true,
        max: 200,
        wide: true,
        placeholder: "e.g. Revise organic chemistry, chapter 3",
    },
    {
        name: "description",
        label: "Details",
        type: "textarea",
        max: 2000,
        wide: true,
        placeholder: "Add details (optional)",
    },
    { name: "dueDate", label: "Due date", type: "date" },
];

/** Admins pick the student a task is for; students always add tasks for themselves. */
export const taskFields = (students?: readonly FieldOption[]): FormFieldDef[] =>
    students
        ? [
              {
                  name: "studentId",
                  label: "Student",
                  type: "select",
                  options: students,
                  required: true,
              },
              ...baseFields,
          ]
        : baseFields;

export type ReviewDecision = "approved" | "changes_requested" | "note";

export const reviewDecisions: { value: ReviewDecision; label: string }[] = [
    { value: "approved", label: "Approve" },
    { value: "changes_requested", label: "Ask for changes" },
    { value: "note", label: "Just add a note" },
];

export const reviewFields: FormFieldDef[] = [
    { name: "decision", label: "Review", type: "select", options: reviewDecisions, required: true },
    {
        name: "reviewNote",
        label: "Note for the student",
        type: "textarea",
        max: 1000,
        wide: true,
        placeholder: "e.g. Good work. Next, solve questions 11–20 and show your working.",
    },
];
