import { accountFields } from "@/lib/auth/fields";
import type { Role, StudentEntry, StudentProfile } from "@/lib/db/schema";
import type { FormFieldDef, FormSection } from "@/lib/forms";

type ProfileKey = Exclude<keyof StudentProfile, "userId" | "studentNumber" | "updatedAt">;
export type StudentKey = ProfileKey | "name" | "email" | "phone";
export type EntryKey = Exclude<keyof StudentEntry, "id" | "studentId" | "updatedAt">;

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

export const studentFields: readonly StudentField[] = [
    { ...accountFields.name, name: "name", label: "Student Name", group: "contact" },
    { ...accountFields.email, name: "email", group: "contact" },
    { ...accountFields.phone, name: "phone", group: "contact", studentEditable: true },
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
        studentEditable: true,
    },
    {
        name: "targetYear",
        label: "Target Year",
        type: "number",
        min: 2020,
        max: 2040,
        placeholder: "e.g. 2027",
        group: "enrolment",
        studentEditable: true,
    },
    { name: "joiningDate", label: "Joining Date", type: "date", group: "enrolment" },
    {
        name: "parentName",
        label: "Parent Name",
        type: "text",
        max: 120,
        group: "background",
        studentEditable: true,
    },
    {
        name: "schoolCollege",
        label: "School/College",
        type: "text",
        max: 160,
        group: "background",
        studentEditable: true,
    },
];

const percent = { type: "number", min: 0, max: 100, step: 0.1, unit: "%" } as const;
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
    { name: "backlogChapters", label: "Backlog Chapters", type: "number", min: 0, max: 500 },
    {
        name: "performanceTrend",
        label: "Performance Trend",
        type: "select",
        options: studentOptions.performanceTrend,
    },
    { name: "callCount", label: "Call Count", type: "number", min: 0, max: 10000 },
    { name: "lastCallDate", label: "Last Call Date", type: "date" },
    { name: "nextCallDate", label: "Next Call Date", type: "date" },
    { name: "mentorNotes", label: "Mentor Notes", type: "textarea", adminOnly: true },
];

/** Values that describe a single day and so start empty on a new row. */
export const perDayKeys = new Set<EntryKey>(["mentorNotes", "studyHours"]);

export const contactKeys = new Set<StudentKey>(["name", "email", "phone"]);

export const findStudentField = (name: string) => studentFields.find((f) => f.name === name);
export const findEntryField = (name: string) =>
    name === entryDateField.name ? entryDateField : entryFields.find((f) => f.name === name);

export const visibleEntryFields = (role: Role) =>
    role === "admin" ? entryFields : entryFields.filter((field) => !field.adminOnly);

export const canEdit = (role: Role, isOwn: boolean, field: Visibility) =>
    role === "admin" || (isOwn && Boolean(field.studentEditable));

export function entryView(entry: EntryRecord, role: Role): EntryRecord {
    if (role === "admin") return entry;
    const copy = { ...entry };
    for (const field of entryFields) {
        if (field.adminOnly) Object.assign(copy, { [field.name]: null });
    }
    return copy;
}

export const createStudentSections: FormSection[] = [
    {
        title: "Contact",
        fields: studentFields.filter((f) => f.group === "contact"),
    },
    { title: "Enrolment", fields: studentFields.filter((f) => f.group === "enrolment") },
];

export const formatStudentId = (studentNumber: number) =>
    `IV-${String(studentNumber).padStart(3, "0")}`;
