"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
    CalendarDays,
    Check,
    Hourglass,
    ListChecks,
    MessageSquarePlus,
    MessageSquareWarning,
    Pencil,
    Trash2,
    Undo2,
} from "lucide-react";
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
import { approveTask, deleteTask, reviewTask, toggleTask, updateTask } from "@/lib/tasks/actions";
import { reviewFields, taskFields, type ReviewDecision } from "@/lib/tasks/fields";
import type { TaskRow } from "@/lib/tasks/queries";
import { ConfirmAction, FormDialog } from "./dialogs";
import { FilterSelect } from "./option-select";
import { todayInIndia } from "@/lib/dates";
import { formatDate } from "./values";

type Filter = "open" | "review" | "done" | "all";

/**
 * Tasks with filters and one-click completion. Students can edit only tasks they created.
 */
export function TaskBoard({
    tasks,
    showStudent = false,
    canReview = false,
    students,
}: {
    tasks: TaskRow[];
    showStudent?: boolean;
    canReview?: boolean;
    students?: readonly FieldOption[];
}) {
    const [filter, setFilter] = useState<Filter>("open");
    const [studentId, setStudentId] = useState("");
    const [optimisticTasks, toggleOptimistic] = useOptimistic(tasks, (rows, id: string) =>
        rows.map((task) => {
            if (task.id !== id) return task;
            const completedAt = task.completedAt ? null : new Date();
            return {
                ...task,
                completedAt,
                reviewStatus: null,
                awaitingReview: Boolean(completedAt),
            };
        }),
    );
    const [, startTransition] = useTransition();
    // One dialog for the whole list: the task leaves "To review" once it's sent back, and the
    // dialog must outlive its row to confirm it.
    const [reviewing, setReviewing] = useState<{
        task: TaskRow;
        decision: ReviewDecision;
        open: boolean;
    }>();
    const review = (task: TaskRow, decision: ReviewDecision) =>
        setReviewing({ task, decision, open: true });
    const today = todayInIndia();

    const forStudent = optimisticTasks.filter((task) => !studentId || task.studentId === studentId);
    const matches: Record<Filter, (task: TaskRow) => boolean> = {
        open: (task) => !task.completedAt,
        review: (task) => task.awaitingReview,
        done: (task) => Boolean(task.completedAt),
        all: () => true,
    };
    const count = (key: Filter) => forStudent.filter(matches[key]).length;
    const visible = forStudent.filter(matches[filter]);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
                    <TabsList variant="line">
                        <TabsTrigger value="open">To do ({count("open")})</TabsTrigger>
                        {canReview && (
                            <TabsTrigger value="review">To review ({count("review")})</TabsTrigger>
                        )}
                        <TabsTrigger value="done">Completed ({count("done")})</TabsTrigger>
                        <TabsTrigger value="all">All ({count("all")})</TabsTrigger>
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
                            {filter === "done"
                                ? "Nothing completed yet"
                                : filter === "review"
                                  ? "Nothing to review"
                                  : "No tasks here"}
                        </EmptyTitle>
                        <EmptyDescription>
                            {filter === "open"
                                ? "Everything is done, or no tasks have been added."
                                : filter === "review"
                                  ? "Tasks students complete wait here until you approve them or ask for changes."
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
                                        <ReviewBadge task={task} />
                                    </div>
                                    {task.reviewNote && (
                                        <p
                                            className={cn(
                                                "rounded-md px-2.5 py-1.5 text-sm whitespace-pre-line",
                                                task.reviewStatus === "changes_requested"
                                                    ? "bg-warning/10 text-warning"
                                                    : task.reviewStatus === "approved"
                                                      ? "bg-success/10 text-success"
                                                      : "bg-muted text-foreground",
                                            )}
                                        >
                                            <span className="font-medium">Mentor: </span>
                                            {task.reviewNote}
                                        </p>
                                    )}
                                    {canReview && task.awaitingReview && (
                                        <div className="flex flex-wrap gap-2 pt-0.5">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    startTransition(() => approveTask(task.id))
                                                }
                                            >
                                                <Check /> Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => review(task, "changes_requested")}
                                            >
                                                <Undo2 /> Ask for changes
                                            </Button>
                                        </div>
                                    )}
                                </div>
                                {task.canEdit && (
                                    <div className="flex shrink-0 gap-1">
                                        {canReview && (
                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Review "${task.title}"`}
                                                title="Review: approve, ask for changes or add a note"
                                                onClick={() =>
                                                    review(
                                                        task,
                                                        task.awaitingReview ? "approved" : "note",
                                                    )
                                                }
                                            >
                                                <MessageSquarePlus />
                                            </Button>
                                        )}
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
            {reviewing && (
                <FormDialog
                    key={`${reviewing.task.id}:${reviewing.decision}`}
                    open={reviewing.open}
                    onOpenChange={(open) => setReviewing({ ...reviewing, open })}
                    title="Review task"
                    description={`"${reviewing.task.title}" · ${reviewing.task.studentName}. Approving marks it done; asking for changes moves it back to their to-do list. They see your note on the task.`}
                    action={reviewTask.bind(null, reviewing.task.id)}
                    fields={reviewFields}
                    values={{
                        decision: reviewing.decision,
                        reviewNote: reviewing.task.reviewNote ?? "",
                    }}
                    submitLabel="Save review"
                />
            )}
        </div>
    );
}

/** Where a task stands in the mentor's review. */
function ReviewBadge({ task }: { task: TaskRow }) {
    if (task.awaitingReview) {
        return (
            <Badge variant="outline" className="border-warning/30 text-warning">
                <Hourglass /> Awaiting review
            </Badge>
        );
    }
    if (task.reviewStatus === "approved" && task.completedAt) {
        return (
            <Badge variant="outline" className="border-success/30 bg-success/10 text-success">
                <Check /> Approved
            </Badge>
        );
    }
    if (task.reviewStatus === "changes_requested") {
        return (
            <Badge variant="outline" className="border-warning/30 text-warning">
                <MessageSquareWarning /> Changes requested
            </Badge>
        );
    }
    return null;
}
