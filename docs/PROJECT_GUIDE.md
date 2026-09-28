# ImpulseVidya project guide

A single place to understand what this project contains, how it fits together, and how to make common changes. For a short setup summary, see the [README](../README.md).

## Contents

1. [What the project is](#1-what-the-project-is)
2. [Quick start](#2-quick-start)
3. [Environment variables](#3-environment-variables)
4. [Database and Supabase](#4-database-and-supabase)
5. [Roles and features](#5-roles-and-features)
6. [Project structure](#6-project-structure)
7. [Data model](#7-data-model)
8. [How the main pieces work](#8-how-the-main-pieces-work)
9. [Common tasks](#9-common-tasks)
10. [Deploying](#10-deploying)
11. [Troubleshooting](#11-troubleshooting)
12. [Conventions](#12-conventions)

---

## 1. What the project is

Two parts in one Next.js app:

- **Landing site** (`/`): the public ImpulseVidya page about academic, exam, skill and career guidance. Dark theme by default.
- **Workspace** (`/login`, `/dashboard/...`): a sign-in area where the **mentor (admin)** manages students and the **students** follow their own progress. Light theme by default, styled after Notion (sidebar, document-style pages, editable tables).

| Part       | Technology                                                                       |
| ---------- | -------------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Components, Server Actions), React 19, TypeScript |
| UI         | Tailwind CSS v4, shadcn/ui components (Radix), Lucide icons                      |
| Database   | Postgres (Supabase in production), Drizzle ORM with the `postgres` driver        |
| Auth       | Custom email + password: bcrypt hashes, signed JWT session cookie (`jose`)       |
| Email      | Resend                                                                           |
| Validation | Zod                                                                              |
| Charts     | Recharts (through the shadcn chart component)                                    |

> **Next.js 16 note:** some APIs differ from older versions (for example `proxy.ts` replaces `middleware.ts`, `error.tsx` receives `retry` instead of `reset`, and `<Image preload>` replaces `priority`). The docs for the installed version are in `node_modules/next/dist/docs/`.

## 2. Quick start

```bash
npm install
cp .env.example .env.local      # then fill it in (section 3)
npm run db:migrate              # creates the tables
npm run dev                     # http://localhost:3000
```

Sign in at `http://localhost:3000/login` with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`. The admin account is created automatically when the server starts.

### Scripts

| Command                           | What it does                                                |
| --------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                     | Development server with hot reload                          |
| `npm run build` / `npm start`     | Production build / run it                                   |
| `npm run lint`                    | ESLint                                                      |
| `npm run typecheck`               | TypeScript type check (`tsc --noEmit`)                      |
| `npm run format` / `format:check` | Prettier (4-space indent, double quotes)                    |
| `npm run db:generate`             | Create a migration from changes in `src/lib/db/schema.ts`   |
| `npm run db:migrate`              | Apply migrations to the database in `DATABASE_URL`          |
| `npm run db:studio`               | Drizzle Studio: browse and edit the database in the browser |

## 3. Environment variables

All live in `.env.local` (git-ignored; **never commit it**). `.env.example` is the template.

| Variable               | Required       | Purpose                                                                                                     |
| ---------------------- | -------------- | ----------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`         | Yes            | Postgres connection string (see section 4 for Supabase)                                                     |
| `SESSION_SECRET`       | Yes            | Signs login cookies. **At least 32 characters**: `openssl rand -base64 32`. Changing it signs everyone out. |
| `NEXT_PUBLIC_SITE_URL` | Yes            | The website address used in email links, the sitemap and link previews: `https://impulsevidya.in`           |
| `RESEND_API_KEY`       | For email      | Resend API key. Without it, emails are printed to the server terminal instead of sent.                      |
| `EMAIL_FROM`           | For email      | Sender, e.g. `ImpulseVidya <no-reply@impulsevidya.in>`. The domain must be verified in Resend.              |
| `ADMIN_NAME`           | No             | Name for the admin account (default `Admin`)                                                                |
| `ADMIN_EMAIL`          | Yes, first run | The mentor account's email                                                                                  |
| `ADMIN_PASSWORD`       | Yes, first run | The mentor account's first password (at least 8 characters)                                                 |

Validation happens in `src/lib/env.ts`; a missing or invalid value fails with a clear message the first time it's needed.

## 4. Database and Supabase

The app talks to Postgres directly through Drizzle. It does **not** use the Supabase JS client or Supabase Auth; Supabase is simply the Postgres host.

### Which Supabase connection string to use

Supabase → your project → **Connect** → **Connection string** → **URI**:

| Where the app runs                    | Use                | Port |
| ------------------------------------- | ------------------ | ---- |
| Vercel or another serverless host     | Transaction pooler | 6543 |
| Your own server, or local development | Session pooler     | 5432 |

- The code handles the transaction pooler automatically (it turns off prepared statements and ignores the Prisma-only `?pgbouncer=true`).
- `npm run db:migrate` automatically switches a transaction-pooler URL to the session pooler, which migrations need.
- The password goes between `postgres.<project-ref>:` and `@`. If it contains `@ : / # ?`, write them as `%40 %3A %2F %23 %3F`.
- Forgot the database password? **Project Settings → Database → Reset database password.** (This is not your Supabase account password or the project name.)

### Row Level Security

Migration `0004_enable_rls.sql` turns on RLS for every table with no policies. This stops Supabase's public REST API (the "anon" key) from reading the data. The app's own connection owns the tables, so RLS doesn't restrict it.

### Why Drizzle and not Prisma

Drizzle has no generated client or query engine (faster cold starts on serverless), the schema is one TypeScript file with typed queries and no generate step, queries read like SQL, migrations are readable SQL files, and it works with Supabase's pooler without extra setup. Prisma would also work, but switching means rewriting the data layer.

## 5. Roles and features

### Mentor (admin)

- **Sidebar sections**: the mentor groups students into sections they create, rename and delete from the sidebar (**+** next to "Sections", or the **⋯** menu on a section). Each section is a collapsible list; sections with unread activity, pending requests or the open student start expanded, and the browser remembers which ones were left open. A search box filters students across sections. Students without a section are listed under "No section"; deleting a section moves its students there. A number after a student's name counts their unread notifications.
- **New admissions**: a built-in section (it can be renamed, not deleted) that lists sign-up requests. **Approve** (on `/dashboard/admissions`) lets the student sign in, puts them in the chosen section and emails them; **Decline** deletes the request.
- **Students** (`/dashboard`): overview of every active student with section, batch, status, target, and the latest day's priority, scores and next call. Search, filters (section, batch, status, priority), summary counts, 30 students per page. On phones it becomes a compact list.
- **New student** dialog: name, email, phone, section, enrolment details. **The password is generated by the system** (12 characters) and emailed to the student with the website link. If the email can't be sent, the dialog shows the login details once so the mentor can share them.
- **Student page** (`/dashboard/students/<id>`), read top to bottom:
    - summary of the latest day (scores, next call, tasks done);
    - recent activity from the student (marked as read when the page opens);
    - profile properties, including the section, editable in place;
    - **Daily log**: one row per day, 30 per page. **New day** adds today's row (dated automatically), starting from the previous day's values; mentor notes, study hours and long-text custom columns start empty. Every cell is edited in place. A day can't be logged twice; the date can be changed with the calendar; rows can be deleted;
    - **Columns** (daily log): rename or hide any column, and add custom columns (text, number, date, long text) visible to the student or mentor-only. Settings apply to every student's log. Hiding keeps the values; deleting a custom column deletes its values.
    - score chart (average score, last test, DPP by day);
    - tasks for that student, with review.
    - **Delete** removes the student and all their data.
- **Tasks** (`/dashboard/tasks`): assign tasks, see completion per student (done, overdue, last 7 days), filter tasks. **To review** lists tasks students completed: **Approve** them, or **Ask for changes** with a note, which reopens the task for the student. A task the mentor ticks off counts as approved.
- **Notifications** (`/dashboard/notifications`): what students changed (daily log, tasks) and new sign-up requests. Opening the page marks them as read.
- **Profile**: change own name, phone and password.

### Student

- **My progress** (`/dashboard`): the same student page for themselves, **without** mentor-only columns (priority, subject levels, mentor notes, mentor-only custom columns) and without hidden columns.
- Profile details are **read-only**: only the mentor edits them. Students can fill in their **study hours** in the daily log. They cannot add or delete daily rows.
- **My tasks**: tasks from the mentor plus their own. They can tick any task, but edit or delete only tasks they created. They see whether a completed task is awaiting review, approved, or sent back (with the mentor's note).
- **Notifications**: what the mentor changed on their profile, daily log or tasks, and task reviews. Changes to mentor-only columns are never announced.
- **Profile**: change password (their details are managed by the mentor).

### Accounts and sign-in

- Sign-in with email + password; password field has a show/hide toggle.
- **Sign up** (`/signup`): name, email, phone, password, and optionally target exam, year and school. The account is created as `pending` and can't sign in (sign-in explains that it's waiting for approval) until the mentor approves it.
- **Forgot password** emails a reset link (valid 1 hour, single use).
- Sessions last 7 days and are extended once a day while the person keeps using the app. Changing or resetting a password signs out the account's other devices.
- If the database is unreachable, sign-in shows "We can't reach the server right now" instead of crashing.

## 6. Project structure

```
src/
  app/
    (site)/            Landing page (route group: no URL segment)
    (auth)/            /login, /signup, /forgot-password, /reset-password + error screen
    dashboard/         Signed-in workspace: layout (sidebar), pages, loading and error screens
      students/[id]/   One student's page (mentor only)
      admissions/      Sign-up requests to approve or decline (mentor only)
      notifications/   Notifications
      tasks/           Tasks
      profile/         Account and password
    layout.tsx         Root HTML, fonts, metadata, theme script
    theme.css          Tailwind entry + workspace colour tokens (light and dark)
    impulsevidya*.css  Landing-page styles only
    icon.png, apple-icon.png   Favicon and iOS icon (cropped from public/Logo.png)
  components/
    ui/                shadcn/ui components (generated; edit sparingly)
    portal/            Workspace components built on shadcn (sidebar, tables, editors, forms, dialogs)
    impulsevidya/      Landing-page sections, header/footer, motion, theme toggle
  lib/
    auth/              Sessions, data access layer, auth actions, passwords, reset tokens, admin bootstrap
    db/                Drizzle schema and connection
    students/          Field definitions, queries and actions for students, the daily log, its columns and admissions
    sections/          The mentor's sidebar sections
    notifications/     Writing (`notify`), reading and marking notifications
    tasks/             Field definitions, queries and actions for tasks and reviews
    forms.ts           Shared form types, Zod schema builder, placeholders
    email.ts           Email sending and templates (welcome, password reset)
    env.ts             Environment variable validation
  instrumentation.ts   Runs on server start: creates the admin from .env
  proxy.ts             Before /dashboard requests: redirects signed-out visitors, renews sessions
drizzle/               SQL migrations (keep them all) and Drizzle metadata
public/Logo.png        The logo
docs/                  This guide and site image notes
```

### Key components (`src/components/portal/`)

| File                                        | Role                                                                                           |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `app-sidebar.tsx`                           | Workspace sidebar: navigation (with unread count), account menu with theme toggle and sign-out |
| `sidebar-sections.tsx`                      | The mentor's collapsible student sections, student search, section rename/delete               |
| `log-columns.tsx`                           | Daily-log column settings: rename, hide/show, add and delete custom columns                    |
| `activity-list.tsx`                         | Notification list; marks unread items as read when shown                                       |
| `admissions-list.tsx`                       | Sign-up requests with Approve (pick a section) and Decline                                     |
| `pager.tsx`                                 | Client-side pagination (30 per page) for the daily log and the students overview               |
| `ui.tsx`                                    | Page shell (`PortalPage`), `Section`, `Summary`, `Logo`, `AuthCard`                            |
| `student-list.tsx`                          | Students overview: table on desktop, list on phones, search and filters                        |
| `student-page.tsx`                          | One student's page (used for both mentor and student)                                          |
| `daily-log.tsx`                             | Daily log table and the **New day** button                                                     |
| `editable-value.tsx`                        | In-place editing for any field: text, number, select, date, long text                          |
| `student-properties.tsx`                    | Profile fields as editable properties                                                          |
| `task-board.tsx`, `task-progress-table.tsx` | Task list with tabs/filters; per-student completion                                            |
| `action-form.tsx`, `dialogs.tsx`            | Forms generated from field definitions; form and confirm dialogs                               |
| `use-optimistic-edits.ts`                   | Saves edits instantly on screen and rolls back on error                                        |

## 7. Data model

Defined in `src/lib/db/schema.ts`. Column names are camelCase in TypeScript and snake_case in the database.

| Table                   | Contents                                                                                                                                                                                                             |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users`                 | Every account: name, email (unique), phone, password hash, role (`admin` or `student`), status (`active`, or `pending` for sign-up requests), session version                                                        |
| `sections`              | The mentor's sidebar sections (name). The row with `admissions = true` is "New admissions"                                                                                                                           |
| `student_profiles`      | One per student: student number (shown as `IV-001`), section, batch, status, target exam and year, joining date, parent name, school                                                                                 |
| `student_entries`       | The daily log: one row per student per date (unique). Priority, subject levels, scores, DPP, study hours, backlog, trend, call count and dates, mentor notes, and `custom` (JSON values of the mentor's own columns) |
| `log_columns`           | Daily-log column settings: renamed labels and hidden flags for built-in columns; custom columns (key `c_…`, label, type, visible to student)                                                                         |
| `tasks`                 | Title, details, due date, completed time, review (status, note, time), student, and who created it                                                                                                                   |
| `notifications`         | Audience (`admin` or `student`), the student concerned, who did it, message, link, read time. Unread repeats of the same change are merged (`group_key`)                                                             |
| `password_reset_tokens` | Hashed single-use reset tokens with expiry                                                                                                                                                                           |

Deleting a user deletes their profile, daily log, tasks and tokens (cascade).

## 8. How the main pieces work

**Field definitions are the single source of truth.** `src/lib/students/fields.ts` lists every profile field (`studentFields`) and daily-log column (`entryFields`): label, type, options, limits, `adminOnly`, `studentEditable`. Tables, forms, validation and permissions are all generated from these lists. For the daily log, `resolveLogColumns()` combines `entryFields` with the mentor's settings in `log_columns` (renames, hidden columns, custom columns) into `LogColumn`s; `getLogColumns()` loads them once per request.

**Notifications.** Server actions call `notifyChange()` (`lib/notifications/notify.ts`) after a change: a mentor's change goes to the student, a student's change goes to the mentors. They're written with `after()`, so they never slow the action down. Unread notifications about the same thing (for example, repeated edits of one cell) are merged. `ActivityList` marks what it shows as read, which clears the sidebar counts.

**Authentication.**

- `lib/auth/session.ts` signs and reads the session cookie (`iv_session`).
- `lib/auth/dal.ts` has `requireUser()` / `requireAdmin()`. Every page **and** every server action calls one of these, so access is always checked on the server; hiding a button is never the only protection.
- The session version in the cookie must match `users.session_version`; changing a password increments it, which invalidates other sessions.

**Saving data.** Pages are Server Components that load data. Changes go through Server Actions (`lib/*/actions.ts`), which validate with Zod, check permissions, save, and refresh the page in the same request. In-place edits update the screen immediately (optimistic) and roll back with a message if saving fails.

**Admin bootstrap.** `src/instrumentation.ts` calls `ensureAdmin()` on server start: if `ADMIN_EMAIL` doesn't exist it's created as admin; an existing account keeps its password and gets the admin role.

**Theme.** A small script in `app/layout.tsx` applies the saved theme before the page appears (no flash). The workspace defaults to light, the landing page to dark; the choice is stored in the browser (`impulsevidya-theme`). Workspace colours are tokens in `app/theme.css`.

**Performance.**

- Workspace links don't prefetch (pages are personal and always rendered fresh), so each click or save is one request. `dashboard/loading.tsx` shows a skeleton while a page loads.
- Each page does at most two database round trips: one to check the session, then its data queries in parallel (`Promise.all`). Writes check permission inside the same query (`WHERE id = … AND owner = …`) instead of reading first.
- Passwords are hashed with bcrypt cost 10 (~70ms). Older hashes are upgraded after sign-in, in the background (`after()`).
- **The biggest factor is distance to the database.** Every query travels from the app server to Supabase and back: from India to a Tokyo project that was ~120ms per query, from a server in Mumbai to the Mumbai project it's a few milliseconds. Keep the app server and the database in the same region: the Supabase project is in Mumbai (`ap-south-1`) and `vercel.json` pins the Vercel server region to Mumbai (`bom1`). If the database ever moves, change `regions` to match.
- Locally or on your own server, use Supabase's session pooler (port 5432): it opens connections in ~0.8s versus ~2.8s for the transaction pooler.

## 9. Common tasks

### Change dropdown options (batches, statuses, target exams, priorities, trends)

Edit `studentOptions` in `src/lib/students/fields.ts`. No migration needed (values are stored as text). Subject level options are the `levels` list in the same file.

### Add a profile field (e.g. "City")

1. `src/lib/db/schema.ts`: add `city: text(),` to `studentProfiles`.
2. `npm run db:generate` then `npm run db:migrate`.
3. `src/lib/students/fields.ts`: add `{ name: "city", label: "City", type: "text", max: 80, group: "background" }` to `studentFields`. Profile fields are mentor-only by design; add `studentEditable: true` only if students should change it themselves.

It now appears on the student page and is validated automatically. To show it in the Students overview, add it to the query in `lib/students/queries.ts` (`listStudents`) and a column in `components/portal/student-list.tsx`.

### Add a daily-log column (e.g. "Mock test rank")

The mentor can do this without code: **Columns → Add a column** on any student page. The values are stored in `student_entries.custom`. To make it a built-in column instead (with its own database column, options, or student editing):

1. Schema: add `mockTestRank: integer(),` to `studentEntries`; generate and migrate.
2. `fields.ts`: add `{ name: "mockTestRank", label: "Mock Test Rank", type: "number", min: 1, max: 100000 }` to `entryFields`.
    - Mentor-only? add `adminOnly: true`.
    - Students may fill it? add `studentEditable: true`.
    - Should a new day start empty instead of copying yesterday's value? add it to `perDayKeys`.

### Change the database in general

Edit `schema.ts` → `npm run db:generate` → review the new SQL in `drizzle/` → `npm run db:migrate`. **Never delete or edit migrations that have already been applied**; add a new one instead.

### Add a page to the workspace

Create `src/app/dashboard/<name>/page.tsx`, start it with `await requireUser()` (or `requireAdmin()`), wrap the content in `<PortalPage crumbs=… icon=… title=…>`, and add a link to `nav` in `components/portal/app-sidebar.tsx` (with a Lucide icon and `prefetch={false}` like the others).

### Add a shadcn/ui component

```bash
npx shadcn@latest add <component>
```

If it asks to overwrite existing files, answer **no** unless you mean to reset them. `components.json` points shadcn at `src/app/theme.css`.

### Change email text

`src/lib/email.ts`: `sendWelcomeEmail` (new students) and `sendPasswordResetEmail`. Each has an HTML and a plain-text version; keep both in sync.

### Change the logo or favicon

Replace `public/Logo.png` (transparent PNG, square). Regenerate `src/app/icon.png` (256×256, cropped to the artwork) and `src/app/apple-icon.png` (180×180 on white) from it.

### Change workspace colours

Edit the tokens in `src/app/theme.css` (`:root` for light, `:root[data-theme="dark"]` for dark). Keep text on `--primary` readable (4.5:1 contrast). Landing-page colours are in `impulsevidya*.css`.

## 10. Deploying

1. Set all environment variables from section 3 on the host. Use the production domain for `NEXT_PUBLIC_SITE_URL`, a fresh `SESSION_SECRET`, and the right Supabase pooler (transaction pooler for Vercel).
2. Run `npm run db:migrate` against the production database (from your machine or CI) whenever there are new migrations.
3. Build and start (`npm run build`, `npm start`), or let Vercel build it. On Vercel, keep `regions` in `vercel.json` the same as the Supabase project's region.
4. Verify your sending domain in Resend and set `EMAIL_FROM` to an address on it.
5. The admin account is created on the first start from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. After signing in, change the password from Profile.

The app needs a Node.js server (it is not a static export).

## 11. Troubleshooting

| Symptom                                                           | Cause and fix                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `password authentication failed for user "postgres"`              | Wrong database password in `DATABASE_URL`. Reset it in Supabase (Project Settings → Database) and update `.env.local`. Special characters must be URL-encoded. Stop retrying meanwhile: Supabase briefly blocks an IP after repeated failures. |
| `Tenant or user not found`                                        | Wrong project reference or region in the Supabase URL. Copy the URI again from **Connect**.                                                                                                                                                    |
| `SESSION_SECRET must be at least 32 characters`                   | Generate a new one: `openssl rand -base64 32`.                                                                                                                                                                                                 |
| Sign-in says "We can't reach the server right now"                | The database isn't reachable (credentials, network or Supabase outage). The terminal shows the real error.                                                                                                                                     |
| Admin account not created                                         | `ADMIN_EMAIL`/`ADMIN_PASSWORD` empty or invalid, or the database was unreachable at start. Check the `[admin]` line in the terminal, fix, and restart.                                                                                         |
| Emails not arriving                                               | No `RESEND_API_KEY` (emails are printed in the terminal), or `EMAIL_FROM` isn't on a domain verified in Resend. `onboarding@resend.dev` only delivers to the Resend account owner.                                                             |
| Everyone got signed out                                           | `SESSION_SECRET` changed, or the password was changed/reset (by design).                                                                                                                                                                       |
| Dev server error `Can't resolve './theme.css'` after moving files | Stale Turbopack cache: stop the dev server, delete `.next/dev`, start again.                                                                                                                                                                   |
| Relation/table does not exist                                     | Migrations haven't run on this database: `npm run db:migrate`.                                                                                                                                                                                 |

## 12. Conventions

- **UI:** use shadcn/ui components and Tailwind classes; icons from `lucide-react`. Workspace styling stays in Tailwind + `theme.css`; don't add new hand-written CSS files for it.
- **Security:** check access with `requireUser()` / `requireAdmin()` in every page and server action. Strip mentor-only data on the server (`entryView`) before it reaches a student, and don't notify students about mentor-only columns. Only `active` accounts get a session (`getCurrentUser`). Never commit `.env.local`.
- **Data:** change the schema only through migrations; keep old migration files.
- **Forms:** describe fields with `FormFieldDef` and render with `ActionForm`, so validation, placeholders and errors stay consistent.
- **Code style:** Prettier (4 spaces, double quotes, trailing commas). Run `npm run lint` and `npm run typecheck` before committing.
- **Mobile:** check pages at phone width (about 390px); wide tables must scroll inside their container, never the whole page.
