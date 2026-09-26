import type { Metadata } from "next";
import { AlarmClock, CalendarCheck, CircleCheck, ListChecks, ListTodo, Plus } from "lucide-react";
import { FormDialog } from "@/components/portal/dialogs";
import { TaskBoard } from "@/components/portal/task-board";
import { completionRate, TaskProgressTable } from "@/components/portal/task-progress-table";
import { PageIcon, PortalPage, Section, Summary } from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth/dal";
import { listStudentOptions } from "@/lib/students/queries";
import { createTask } from "@/lib/tasks/actions";
import { taskFields } from "@/lib/tasks/fields";
import { getTaskProgress, listTasks } from "@/lib/tasks/queries";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
    const user = await requireUser();
    const admin = user.role === "admin";
    const [tasks, progress, students] = await Promise.all([
        listTasks(),
        getTaskProgress(),
        admin ? listStudentOptions() : undefined,
    ]);
    const total = progress.reduce(
        (sum, row) => ({
            total: sum.total + row.total,
            done: sum.done + row.done,
            overdue: sum.overdue + row.overdue,
            doneThisWeek: sum.doneThisWeek + row.doneThisWeek,
        }),
        { total: 0, done: 0, overdue: 0, doneThisWeek: 0 },
    );

    return (
        <PortalPage
            crumbs={[{ label: admin ? "Tasks" : "My tasks" }]}
            icon={<PageIcon icon={ListChecks} />}
            title={admin ? "Tasks" : "My tasks"}
            description={
                admin
                    ? "Assign work, see what each student completes, and spot who is falling behind."
                    : "Tasks from your mentor and the goals you set for yourself."
            }
            actions={
                <FormDialog
                    title={admin ? "Assign a task" : "New task"}
                    trigger={
                        <Button size="sm">
                            <Plus /> New task
                        </Button>
                    }
                    action={createTask}
                    fields={taskFields(students)}
                    submitLabel={admin ? "Assign task" : "Add task"}
                />
            }
        >
            <Summary
                items={[
                    {
                        icon: CircleCheck,
                        label: "Completed",
                        value: `${total.done}/${total.total} (${completionRate(total)}%)`,
                    },
                    { icon: ListTodo, label: "To do", value: total.total - total.done },
                    {
                        icon: AlarmClock,
                        label: "Overdue",
                        value: total.overdue,
                        tone: total.overdue ? "bad" : undefined,
                    },
                    { icon: CalendarCheck, label: "Done this week", value: total.doneThisWeek },
                ]}
            />
            {admin && (
                <Section title="By student" description="Select a student to open their page.">
                    <TaskProgressTable rows={progress} />
                </Section>
            )}
            <Section title={admin ? "All tasks" : "Tasks"}>
                <TaskBoard tasks={tasks} showStudent={admin} students={students} />
            </Section>
        </PortalPage>
    );
}
