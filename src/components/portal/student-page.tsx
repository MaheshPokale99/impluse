import type { ReactNode } from "react";
import { CalendarClock, CalendarDays, ClipboardCheck, Percent, Plus, Target } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CurrentUser } from "@/lib/auth/dal";
import { todayInIndia } from "@/lib/dates";
import {
    studentFields,
    visibleEntryFields,
    type EntryRecord,
    type StudentRecord,
} from "@/lib/students/fields";
import { createTask } from "@/lib/tasks/actions";
import { taskFields } from "@/lib/tasks/fields";
import type { TaskProgress, TaskRow } from "@/lib/tasks/queries";
import { AddTodayButton, DailyLog } from "./daily-log";
import { FormDialog } from "./dialogs";
import { ProgressChart } from "./progress-chart";
import { StudentProperties } from "./student-properties";
import { TaskBoard } from "./task-board";
import { completionRate } from "./task-progress-table";
import { PortalPage, Section, Summary, type Crumb } from "./ui";
import { formatDate, initials } from "./values";

const notSet = "Not set";
const percent = (value: number | null | undefined) => (value == null ? notSet : `${value}%`);

export function StudentPage({
    crumbs,
    student,
    entries,
    viewer,
    progress,
    tasks,
    title,
    description,
    actions,
}: {
    crumbs: Crumb[];
    student: StudentRecord;
    entries: EntryRecord[];
    viewer: CurrentUser;
    progress?: TaskProgress;
    tasks?: TaskRow[];
    title: string;
    description: ReactNode;
    actions?: ReactNode;
}) {
    const [latest] = entries;
    const today = todayInIndia();
    const admin = viewer.role === "admin";
    const callDue = latest?.nextCallDate != null && latest.nextCallDate <= today;

    return (
        <PortalPage
            crumbs={crumbs}
            icon={
                <Avatar className="size-9 sm:size-11">
                    <AvatarFallback className="text-sm font-semibold">
                        {initials(student.name)}
                    </AvatarFallback>
                </Avatar>
            }
            title={title}
            description={description}
            actions={actions}
        >
            <Summary
                items={[
                    {
                        icon: CalendarDays,
                        label: "Last update",
                        value: latest
                            ? latest.date === today
                                ? "Today"
                                : formatDate(latest.date)
                            : notSet,
                    },
                    { icon: Target, label: "Average score", value: percent(latest?.averageScore) },
                    { icon: Percent, label: "Last test", value: percent(latest?.lastTestScore) },
                    { icon: ClipboardCheck, label: "DPP", value: percent(latest?.dppCompletion) },
                    {
                        icon: CalendarClock,
                        label: "Next call",
                        value: latest?.nextCallDate ? formatDate(latest.nextCallDate) : notSet,
                        tone: callDue ? "bad" : undefined,
                    },
                    ...(progress
                        ? [
                              {
                                  icon: ClipboardCheck,
                                  label: "Tasks done",
                                  value: `${progress.done}/${progress.total} (${completionRate(progress)}%)`,
                              },
                          ]
                        : []),
                ]}
            />

            <StudentProperties
                student={student}
                fields={studentFields}
                role={viewer.role}
                viewerId={viewer.id}
            />

            <Section
                title="Daily log"
                description={
                    admin
                        ? "One row per day. A new day starts from the previous day's values."
                        : "Your progress day by day. You can fill in your study hours."
                }
                action={
                    admin && entries.length > 0 ? (
                        <AddTodayButton studentId={student.id} hasToday={latest?.date === today} />
                    ) : undefined
                }
            >
                <DailyLog
                    studentId={student.id}
                    entries={entries}
                    fields={visibleEntryFields(viewer.role)}
                    role={viewer.role}
                    viewerId={viewer.id}
                />
            </Section>

            {entries.length > 0 && (
                <Section
                    title="Scores over time"
                    description="Average score, last test and DPP completion by day."
                >
                    <div className="rounded-lg border p-4">
                        <ProgressChart entries={entries} />
                    </div>
                </Section>
            )}

            {tasks && (
                <Section
                    title="Tasks"
                    description="Assigned by the mentor or added by the student."
                    action={
                        <FormDialog
                            title="Assign a task"
                            trigger={
                                <Button size="sm">
                                    <Plus /> New task
                                </Button>
                            }
                            action={createTask}
                            fields={taskFields([{ value: student.id, label: student.name }])}
                            values={{ studentId: student.id }}
                            submitLabel="Assign task"
                        />
                    }
                >
                    <TaskBoard tasks={tasks} />
                </Section>
            )}
        </PortalPage>
    );
}
