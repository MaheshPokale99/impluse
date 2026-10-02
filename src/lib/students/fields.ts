import { accountFields } from "@/lib/auth/fields";
import type { LogColumnRow, Role, StudentEntry, StudentProfile } from "@/lib/db/schema";
import type { FieldOption, FormFieldDef, FormSection } from "@/lib/forms";

type ProfileKey = Exclude<keyof StudentProfile, "userId" | "studentNumber" | "updatedAt">;
export type StudentKey = ProfileKey | "name" | "email" | "phone";
export type EntryKey = Exclude<keyof StudentEntry, "id" | "studentId" | "updatedAt" | "custom">;

type Visibility = {
    studentEditable?: boolean;
};

export type StudentField = FormFieldDef &
    Visibility & { name: StudentKey; group: "contact" | "enrolment" | "background" };

export type EntryField = FormFieldDef &
    Visibility & {
        name: EntryKey;
        adminOnly?: boolean;
    };

export type StudentRecord = StudentProfile & {
    id: string;
    name: string;
    email: string;
    phone: string | null;
};
export type EntryRecord = StudentEntry;

const levels = ["Weak", "Average", "Good", "Excellent"] as const;

export const studentOptions = {
    batch: ["Class 11", "Class 12", "Dropper", "Foundation"],
    studentStatus: ["Active", "On Hold", "Inactive", "Completed"],
    targetExam: ["JEE Main", "JEE Advanced", "NEET", "MHT-CET", "Boards", "Other"],
    priority: ["High", "Medium", "Low"],
    performanceTrend: ["Improving", "Stable", "Declining"],
} as const;

/** Profile details. Only the mentor edits them; students see them read-only. */
export const studentFields: readonly StudentField[] = [
    { ...accountFields.name, name: "name", label: "Student Name", group: "contact" },
    { ...accountFields.email, name: "email", group: "contact" },
    { ...accountFields.phone, name: "phone", group: "contact" },
    {
        name: "batch",
        label: "Batch",
        type: "select",
        options: studentOptions.batch,
        group: "enrolment",
    },
    {
        name: "studentStatus",
        label: "Student Status",
        type: "select",
        options: studentOptions.studentStatus,
        group: "enrolment",
    },
    {
        name: "targetExam",
        label: "Target Exam",
        type: "select",
        options: studentOptions.targetExam,
        group: "enrolment",
    },
    {
        name: "targetYear",
        label: "Target Year",
        type: "number",
        min: 2020,
        max: 2040,
        placeholder: "e.g. 2027",
        group: "enrolment",
    },
    { name: "joiningDate", label: "Joining Date", type: "date", group: "enrolment" },
    {
        name: "parentName",
        label: "Parent Name",
        type: "text",
        max: 120,
        group: "background",
    },
    {
        name: "schoolCollege",
        label: "School/College",
        type: "text",
        max: 160,
        group: "background",
    },
];

const percent = {
    type: "number",
    min: 0,
    max: 100,
    step: 0.1,
    unit: "%",
    studentEditable: true,
} as const;
const level = (name: EntryKey, label: string): EntryField => ({
    name,
    label,
    type: "select",
    options: levels,
    adminOnly: true,
});

export const entryDateField: EntryField = {
    name: "date",
    label: "Date",
    type: "date",
    required: true,
};

export const entryFields: readonly EntryField[] = [
    {
        name: "priority",
        label: "Priority",
        type: "select",
        options: studentOptions.priority,
        adminOnly: true,
    },
    level("overallLevel", "Overall Level"),
    level("physicsLevel", "Physics Level"),
    level("chemistryLevel", "Chemistry Level"),
    level("mathsBioLevel", "Maths/Bio Level"),
    { name: "averageScore", label: "Average Score %", ...percent },
    { name: "lastTestScore", label: "Last Test %", ...percent },
    { name: "dppCompletion", label: "DPP Completion %", ...percent },
    {
        name: "studyHours",
        label: "Study Hours",
        type: "number",
        min: 0,
        max: 24,
        step: 0.5,
        studentEditable: true,
    },
    {
        name: "backlogChapters",
        label: "Backlog Chapters",
        type: "number",
        min: 0,
        max: 500,
        studentEditable: true,
    },
    {
        name: "performanceTrend",
        label: "Performance Trend",
        type: "select",
        options: studentOptions.performanceTrend,
        studentEditable: true,
    },
    { name: "callCount", label: "Call Count", type: "number", min: 0, max: 10000 },
    { name: "lastCallDate", label: "Last Call Date", type: "date" },
    { name: "nextCallDate", label: "Next Call Date", type: "date" },
    { name: "mentorNotes", label: "Mentor Notes", type: "textarea", adminOnly: true },
];

/** Values that describe a single day and so start empty on a new row. */
export const perDayKeys = new Set<EntryKey>(["mentorNotes", "studyHours"]);

export const contactKeys = new Set<StudentKey>(["name", "email", "phone"]);

/** The student's sidebar section. Its options are the mentor's sections, loaded at runtime. */
export const sectionField = (sections: readonly FieldOption[]): StudentField => ({
    name: "sectionId",
    label: "Section",
    type: "select",
    options: sections,
    group: "enrolment",
});

/** Asked when a mentor approves a sign-up request. */
export const approvalFields = (sections: readonly FieldOption[]): FormFieldDef[] => [
    { name: "sectionId", label: "Add to section", type: "select", options: sections },
    { name: "batch", label: "Batch", type: "select", options: studentOptions.batch },
];

export const findStudentField = (name: string) => studentFields.find((f) => f.name === name);
export const findEntryField = (name: string) =>
    name === entryDateField.name ? entryDateField : entryFields.find((f) => f.name === name);

export const canEdit = (role: Role, isOwn: boolean, field: Visibility) =>
    role === "admin" || (isOwn && Boolean(field.studentEditable));

/**
 * A daily-log column as shown in the table: a built-in field (possibly renamed or hidden by
 * the mentor) or one of the mentor's own columns, whose values live in `entry.custom`.
 */
export type LogColumn = FormFieldDef & {
    name: string;
    custom: boolean;
    hidden: boolean;
    adminOnly: boolean;
    studentEditable: boolean;
    /** Built-in columns: the original name, restored when a rename is cleared. */
    defaultLabel?: string;
};

export type CustomColumnType = NonNullable<LogColumnRow["type"]>;

export const customColumnTypes: { value: CustomColumnType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "date", label: "Date" },
    { value: "textarea", label: "Long text" },
];

const customTypeLimits: Record<CustomColumnType, Partial<FormFieldDef>> = {
    text: { max: 200 },
    number: { min: -1_000_000_000, max: 1_000_000_000, step: 0.01 },
    date: {},
    textarea: { max: 5000 },
};

export const MAX_COLUMN_LABEL = 60;

export const newColumnFields: FormFieldDef[] = [
    {
        name: "label",
        label: "Column name",
        type: "text",
        required: true,
        max: MAX_COLUMN_LABEL,
        placeholder: "e.g. Mock test rank",
    },
    { name: "type", label: "Type", type: "select", options: customColumnTypes, required: true },
    {
        name: "visibility",
        label: "Student access",
        type: "select",
        required: true,
        options: [
            { value: "everyone", label: "Student can see and edit" },
            { value: "view", label: "Student can only see" },
            { value: "mentor", label: "Mentor only" },
        ],
    },
];

/** Combines the built-in fields with the mentor's column settings (renames, hidden, custom). */
export function resolveLogColumns(rows: readonly LogColumnRow[]): LogColumn[] {
    const settings = new Map(rows.map((row) => [row.key, row]));
    const builtIn = entryFields.map((field): LogColumn => {
        const row = settings.get(field.name);
        const adminOnly = Boolean(field.adminOnly);
        return {
            ...field,
            label: row?.label || field.label,
            defaultLabel: field.label,
            custom: false,
            hidden: row?.hidden ?? false,
            adminOnly,
            studentEditable: !adminOnly && (row?.studentEditable ?? Boolean(field.studentEditable)),
        };
    });
    const custom = rows
        .filter((row) => row.custom)
        .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((row): LogColumn => {
            const type = row.type ?? "text";
            return {
                ...customTypeLimits[type],
                name: row.key,
                label: row.label || "Untitled",
                type,
                custom: true,
                hidden: row.hidden,
                adminOnly: !row.studentVisible,
                studentEditable: row.studentVisible && (row.studentEditable ?? true),
            };
        });
    return [...builtIn, ...custom];
}

/** Columns shown in the table: never hidden ones, and for students never mentor-only ones. */
export const visibleColumns = (columns: readonly LogColumn[], role: Role) =>
    columns.filter((column) => !column.hidden && (role === "admin" || !column.adminOnly));

/** Removes mentor-only values before a row reaches a student. */
export function entryView(entry: EntryRecord, role: Role, columns: readonly LogColumn[]) {
    if (role === "admin") return entry;
    const copy: EntryRecord = { ...entry, custom: {} };
    for (const column of columns) {
        const hide = column.adminOnly || (column.custom && column.hidden);
        if (column.custom && !hide) copy.custom[column.name] = entry.custom[column.name] ?? null;
        if (!column.custom && hide) Object.assign(copy, { [column.name]: null });
    }
    return copy;
}

export const createStudentSections = (sections: readonly FieldOption[]): FormSection[] => [
    {
        title: "Contact",
        fields: studentFields.filter((f) => f.group === "contact"),
    },
    {
        title: "Enrolment",
        fields: [sectionField(sections), ...studentFields.filter((f) => f.group === "enrolment")],
    },
];

export const formatStudentId = (studentNumber: number) =>
    `IV-${String(studentNumber).padStart(3, "0")}`;
