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

export const reviewFields: FormFieldDef[] = [
    {
        name: "reviewNote",
        label: "What needs to change?",
        type: "textarea",
        required: true,
        max: 1000,
        placeholder: "e.g. Solve questions 11–20 as well and show your working.",
    },
];
