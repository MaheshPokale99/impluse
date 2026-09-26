# ImpulseVidya

The ImpulseVidya site introduces academic, exam, skill-building, and career guidance for students. It also has a sign-in area where mentors manage student sheets and tasks, and students follow their own progress. It is built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, Motion, Lenis, Postgres (Drizzle ORM), and Resend, with dark and light themes.

For the full guide (structure, data model, how things work, common changes, deployment and troubleshooting), see [docs/PROJECT_GUIDE.md](docs/PROJECT_GUIDE.md).

## Run locally

1. Install dependencies and create your env file:

    ```bash
    npm install
    cp .env.example .env.local
    ```

2. Fill in `.env.local` (each setting is explained in `.env.example`):
    - `DATABASE_URL`: your Postgres connection string. With Supabase, open **Connect → Connection string → URI** and use the **Transaction pooler** (port 6543) for serverless hosting such as Vercel, or the **Session pooler** (port 5432) for your own server or local development.
    - `SESSION_SECRET`: at least 32 random characters (`openssl rand -base64 32`).
    - `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the mentor account. It's created when the server starts if it doesn't exist yet.

3. Create the tables, then start the app:

    ```bash
    npm run db:migrate
    npm run dev
    ```

    Open `http://localhost:3000/login` and sign in with the admin email and password.

Use `npm run build` for a production build and `npm run lint` to check the code.

## Database

The app talks to Postgres through [Drizzle ORM](https://orm.drizzle.team) and the `postgres` driver. The schema lives in `src/lib/db/schema.ts`; migrations are SQL files in `drizzle/`. Supabase works as a plain Postgres database: the app connects directly with `DATABASE_URL` and doesn't use the Supabase client. Migrations turn on Row Level Security for every table, so Supabase's public REST API can't read the data; the app's own connection is unaffected.

## Email

Emails go through [Resend](https://resend.com). When a mentor creates a student, the system generates a password and emails the student their login details (website link, email and password); students can change it from their Profile page. Password-reset links use Resend too. Set `RESEND_API_KEY` and an `EMAIL_FROM` address on a domain you've verified in Resend. Without an API key, emails are printed to the server console, which is enough for local development.

## Roles

- **Mentor (admin)** sees an overview of all students (name, batch, status, target, and the latest day's priority, scores and next call), with search and filters. Selecting a student opens their page:
    - **Daily log**: one row per day, newest first. "Add today's row" creates a row dated today that starts from the previous day's values, so only what changed needs editing. Every cell is edited in place (text and numbers inline, options in a select, dates in a calendar, notes in a popover). A chart plots scores by day.
    - **Profile**: contact, enrolment and background details, edited in place.
    - **Tasks**: the student's tasks.
- **Student** sees the same page for themselves, without the mentor-only columns (priority, subject levels, mentor notes). They can update their study hours in the log, a few profile details (phone, target exam and year, parent name, school), and their own tasks.

Profile fields and daily-log columns, and who can see and edit them, are defined in `src/lib/students/fields.ts`. The tables, forms, and validation are generated from those lists. Daily rows live in the `student_entries` table (one row per student per date).

## Database changes

Edit `src/lib/db/schema.ts`, then run `npm run db:generate` to create a migration in `drizzle/` and `npm run db:migrate` to apply it. Keep existing migration files: databases that already ran them rely on the history.

## Project map

- `src/app/(site)/` is the landing page; `src/app/(auth)/` holds sign-in and password pages; `src/app/dashboard/` is the signed-in area.
- `src/lib/auth/` handles sessions, the data access layer (`requireUser`, `requireAdmin`), and auth server actions. Sessions last 7 days; `src/proxy.ts` extends them while someone keeps using the dashboard. Changing or resetting a password signs out other devices.
- `src/lib/students/` and `src/lib/tasks/` contain field definitions, queries, and server actions.
- `src/components/ui/` holds the shadcn/ui components (add more with `npx shadcn@latest add <name>`); `src/components/portal/` holds the dashboard components built on them: the sidebar, the students list, the daily log, the in-place editor, the form built from field definitions, dialogs, and the task board.
- `src/components/impulsevidya/` contains the landing-page sections, shared components, motion, and asset paths.
- `src/app/impulsevidya.css` and `src/app/impulsevidya-overrides.css` contain the landing-page styles. The dashboard is styled with Tailwind utility classes; `src/app/theme.css` defines its light and dark colour tokens (neutral workspace colours with the brand orange as the accent).
- `public/images/impulsevidya/` contains the page's maintained image assets; see `docs/site-assets.md` for details.
- `src/lib/site.ts` contains the site name, description, canonical URL, and social preview image.
- `public/Logo.png` is the logo; `src/app/icon.png` (favicon) and `src/app/apple-icon.png` are cropped from it.
