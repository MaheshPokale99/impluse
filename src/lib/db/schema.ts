import {
    date,
    index,
    integer,
    pgEnum,
    pgTable,
    real,
    text,
    timestamp,
    uniqueIndex,
    uuid,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["admin", "student"]);

export const users = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    email: text().notNull().unique(),
    phone: text(),
    passwordHash: text().notNull(),
    role: roleEnum().notNull().default("student"),
    sessionVersion: integer().notNull().default(0),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}).enableRLS();

export const studentProfiles = pgTable("student_profiles", {
    userId: uuid()
        .primaryKey()
        .references(() => users.id, { onDelete: "cascade" }),
    studentNumber: integer().notNull().unique().generatedAlwaysAsIdentity(),
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
        updatedAt: timestamp({ withTimezone: true })
            .notNull()
            .defaultNow()
            .$onUpdate(() => new Date()),
    },
    (table) => [uniqueIndex().on(table.studentId, table.date)],
).enableRLS();

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
        createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    },
    (table) => [index().on(table.studentId)],
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
