"use client";

import { useOptimistic, useState, useTransition } from "react";
import { CalendarDays, ListChecks, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toFormValues, type FieldOption } from "@/lib/forms";
import { deleteTask, toggleTask, updateTask } from "@/lib/tasks/actions";
import { taskFields } from "@/lib/tasks/fields";
import type { TaskRow } from "@/lib/tasks/queries";
import { ConfirmAction, FormDialog } from "./dialogs";
import { FilterSelect } from "./option-select";
import { todayInIndia } from "@/lib/dates";
import { formatDate } from "./values";

type Filter = "open" | "done" | "all";

/** Tasks with filters and one-click completion. Students can edit only tasks they created. */
export function TaskBoard({
    tasks,
    showStudent = false,
    students,
}: {
    tasks: TaskRow[];
    showStudent?: boolean;
    students?: readonly FieldOption[];
}) {
    const [filter, setFilter] = useState<Filter>("open");
    const [studentId, setStudentId] = useState("");
    const [optimisticTasks, toggleOptimistic] = useOptimistic(tasks, (rows, id: string) =>
        rows.map((task) =>
            task.id === id ? { ...task, completedAt: task.completedAt ? null : new Date() } : task,
        ),
    );
    const [, startTransition] = useTransition();
    const today = todayInIndia();

    const forStudent = optimisticTasks.filter((task) => !studentId || task.studentId === studentId);
    const counts = {
        open: forStudent.filter((task) => !task.completedAt).length,
        done: forStudent.filter((task) => task.completedAt).length,
        all: forStudent.length,
    };
    const visible = forStudent.filter(
        (task) => filter === "all" || (filter === "done") === Boolean(task.completedAt),
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
                    <TabsList variant="line">
                        <TabsTrigger value="open">To do ({counts.open})</TabsTrigger>
                        <TabsTrigger value="done">Completed ({counts.done})</TabsTrigger>
                        <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                    </TabsList>
                </Tabs>
                {students && (
                    <FilterSelect
                        label="Student"
                        value={studentId}
                        options={students}
                        onChange={setStudentId}
                    />
                )}
            </div>

            {visible.length === 0 ? (
                <Empty className="border-y">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ListChecks />
                        </EmptyMedia>
                        <EmptyTitle>
                            {filter === "done" ? "Nothing completed yet" : "No tasks here"}
                        </EmptyTitle>
                        <EmptyDescription>
                            {filter === "open"
                                ? "Everything is done, or no tasks have been added."
                                : "Tasks will appear here."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <ul className="divide-y border-y">
                    {visible.map((task) => {
                        const done = Boolean(task.completedAt);
                        const overdue = !done && task.dueDate !== null && task.dueDate < today;
                        return (
                            <li key={task.id} className="flex items-start gap-3 px-1 py-3">
                                <Checkbox
                                    className="mt-0.5"
                                    checked={done}
                                    aria-label={`Mark "${task.title}" as ${done ? "not done" : "done"}`}
                                    onCheckedChange={() =>
                                        startTransition(async () => {
                                            toggleOptimistic(task.id);
                                            await toggleTask(task.id);
                                        })
                                    }
                                />
                                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                                    <p
                                        className={cn(
                                            "text-sm font-medium",
                                            done && "text-muted-foreground line-through",
                                        )}
                                    >
                                        {task.title}
                                    </p>
                                    {task.description && (
                                        <p className="text-sm whitespace-pre-line text-muted-foreground">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        {showStudent && (
                                            <Badge variant="secondary">{task.studentName}</Badge>
                                        )}
                                        <Badge variant="outline">
                                            {task.assignedByMentor ? "From mentor" : "Self-added"}
                                        </Badge>
                                        {task.dueDate && (
                                            <Badge variant={overdue ? "destructive" : "outline"}>
                                                <CalendarDays /> {overdue ? "Overdue · " : "Due "}
                                                {formatDate(task.dueDate)}
                                            </Badge>
                                        )}
                                        {task.completedAt && (
                                            <Badge
                                                variant="outline"
                                                className="border-success/30 text-success"
                                            >
                                                Completed {formatDate(task.completedAt)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {task.canEdit && (
                                    <div className="flex shrink-0 gap-1">
                                        <FormDialog
                                            title="Edit task"
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Edit "${task.title}"`}
                                                >
                                                    <Pencil />
                                                </Button>
                                            }
                                            action={updateTask.bind(null, task.id)}
                                            fields={taskFields()}
                                            values={toFormValues({
                                                title: task.title,
                                                description: task.description,
                                                dueDate: task.dueDate,
                                            })}
                                            submitLabel="Save task"
                                        />
                                        <ConfirmAction
                                            title="Delete this task?"
                                            description={`"${task.title}" will be removed permanently.`}
                                            confirmLabel="Delete"
                                            action={deleteTask.bind(null, task.id)}
                                            trigger={
                                                <Button
                                                    variant="ghost"
                                                    size="icon-sm"
                                                    aria-label={`Delete "${task.title}"`}
                                                >
                                                    <Trash2 />
                                                </Button>
                                            }
                                        />
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
