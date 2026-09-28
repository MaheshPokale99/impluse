import { sql } from "drizzle-orm";
import {
    boolean,
    date,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    real,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "student"]);
/** `pending` accounts come from the sign-up page and can't sign in until a mentor approves them. */
export const userStatusEnum = pgEnum("user_status", ["active", "pending"]);

export const users = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull().unique(),
    phone: text(),
    passwordHash: text().notNull(),
    role: roleEnum().notNull().default("student"),
    status: userStatusEnum().notNull().default("active"),
    sessionVersion: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

/**
 * Groups of students shown in the sidebar, named by the mentor. The one row with
 * `admissions = true` is the "New admissions" section: it lists sign-up requests.
 */
export const sections = pgTable(
    "sections",
    {
        id: uuid().primaryKey().defaultRandom(),
        name: text().notNull(),
        admissions: boolean().notNull().default(false),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [
        uniqueIndex()
            .on(table.admissions)
            .where(sql`${table.admissions}`),
    ],
).enableRLS();

export const studentProfiles = pgTable("student_profiles", {
    userId: uuid()
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    studentNumber: integer().notNull().unique().generatedAlwaysAsIdentity(),
    sectionId: uuid().references(() => sections.id, { onDelete: "set null" }),
    batch: text(),
    studentStatus: text(),
    targetExam: text(),
    targetYear: integer(),
    joiningDate: date({ mode: "string" }),
    parentName: text(),
    schoolCollege: text(),
    updatedAt: timestamp({ withTimezone: true })
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
}).enableRLS();

/** One row per student per day: the mentor's daily log of scores, levels and calls. */
export const studentEntries = pgTable(
    "student_entries",
    {
        id: uuid().primaryKey().defaultRandom(),
        studentId: uuid()
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        date: date({ mode: "string" }).notNull(),
        priority: text(),
        overallLevel: text(),
        physicsLevel: text(),
        chemistryLevel: text(),
        mathsBioLevel: text(),
        averageScore: real(),
        lastTestScore: real(),
        dppCompletion: real(),
        studyHours: real(),
        backlogChapters: integer(),
        performanceTrend: text(),
        callCount: integer(),
        lastCallDate: date({ mode: "string" }),
        nextCallDate: date({ mode: "string" }),
        mentorNotes: text(),
        /** Values of the mentor's own columns (`log_columns` rows with `custom = true`), by key. */
        custom: jsonb().$type<Record<string, string | number | null>>().notNull().default({}),
        updatedAt: timestamp({ withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [uniqueIndex().on(table.studentId, table.date)],
).enableRLS();

export const reviewStatusEnum = pgEnum("review_status", ["approved", "changes_requested"]);

export const tasks = pgTable(
    "tasks",
    {
        id: uuid().primaryKey().defaultRandom(),
        studentId: uuid()
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        createdById: uuid().references(() => users.id, { onDelete: "set null" }),
        title: text().notNull(),
        description: text(),
        dueDate: date({ mode: "string" }),
        completedAt: timestamp({ withTimezone: true }),
        /** The mentor's optional review of a completed task. */
        reviewStatus: reviewStatusEnum(),
        reviewNote: text(),
        reviewedAt: timestamp({ withTimezone: true }),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [index().on(table.studentId)],
).enableRLS();

/**
 * Daily-log column settings. Built-in columns (key = field name) can be renamed or hidden;
 * custom columns (`custom = true`) are added by the mentor and store values in
 * `student_entries.custom`. Hiding a column never deletes its values.
 */
export const logColumns = pgTable("log_columns", {
    key: text().primaryKey(),
    label: text(),
    type: text().$type<"text" | "number" | "date" | "textarea">(),
    custom: boolean().notNull().default(false),
    hidden: boolean().notNull().default(false),
    studentVisible: boolean().notNull().default(true),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

/**
 * Activity messages. `audience = admin`: something a student did (or a sign-up request), shown
 * to mentors next to that student's name. `audience = student`: something a mentor changed,
 * shown to that student. Unread rows with the same `groupKey` are merged into one.
 */
export const notifications = pgTable(
    "notifications",
    {
        id: uuid().primaryKey().defaultRandom(),
        audience: roleEnum().notNull(),
        studentId: uuid()
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        actorId: uuid().references(() => users.id, { onDelete: "set null" }),
        message: text().notNull(),
        href: text(),
        groupKey: text(),
        readAt: timestamp({ withTimezone: true }),
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [index().on(table.audience, table.studentId, table.readAt)],
).enableRLS();

export const passwordResetTokens = pgTable("password_reset_tokens", {
    tokenHash: text().primaryKey(),
    userId: uuid()
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
}).enableRLS();

export type Role = (typeof roleEnum.enumValues)[number];
export type StudentProfile = typeof studentProfiles.$inferSelect;
export type StudentEntry = typeof studentEntries.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Section = typeof sections.$inferSelect;
export type LogColumnRow = typeof logColumns.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
