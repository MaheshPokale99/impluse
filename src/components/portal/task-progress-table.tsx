import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatStudentId } from "@/lib/students/fields";
import type { TaskProgress } from "@/lib/tasks/queries";

const head = "h-9 border-y px-3 text-xs font-normal text-muted-foreground";

export const completionRate = ({ done, total }: Pick<TaskProgress, "done" | "total">) =>
    total ? Math.round((done / total) * 100) : 0;

/** Per-student task completion, so the mentor can see who keeps up and who is falling behind. */
export function TaskProgressTable({ rows }: { rows: TaskProgress[] }) {
    return (
        <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className={head}>Student</TableHead>
                        <TableHead className={`${head} hidden sm:table-cell`}>ID</TableHead>
                        <TableHead className={`${head} text-right`}>Done</TableHead>
                        <TableHead className={`${head} hidden text-right sm:table-cell`}>
                            Open
                        </TableHead>
                        <TableHead className={`${head} text-right`}>Overdue</TableHead>
                        <TableHead className={`${head} hidden text-right sm:table-cell`}>
                            Last 7 days
                        </TableHead>
                        <TableHead className={`${head} w-32 sm:w-48`}>Completion</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((row) => {
                        const rate = completionRate(row);
                        return (
                            <TableRow key={row.studentId}>
                                <TableCell className="px-3 font-medium">
                                    <Link
                                        prefetch={false}
                                        href={`/dashboard/students/${row.studentId}`}
                                        className="hover:text-primary hover:underline"
                                    >
                                        {row.name}
                                    </Link>
                                </TableCell>
                                <TableCell className="hidden px-3 text-muted-foreground tabular-nums sm:table-cell">
                                    {formatStudentId(row.studentNumber)}
                                </TableCell>
                                <TableCell className="px-3 text-right tabular-nums">
                                    {row.done} / {row.total}
                                </TableCell>
                                <TableCell className="hidden px-3 text-right tabular-nums sm:table-cell">
                                    {row.total - row.done}
                                </TableCell>
                                <TableCell className="px-3 text-right tabular-nums">
                                    <span
                                        className={
                                            row.overdue
                                                ? "font-semibold text-destructive"
                                                : undefined
                                        }
                                    >
                                        {row.overdue}
                                    </span>
                                </TableCell>
                                <TableCell className="hidden px-3 text-right tabular-nums sm:table-cell">
                                    {row.doneThisWeek}
                                </TableCell>
                                <TableCell className="px-3">
                                    <div className="flex items-center gap-2">
                                        <Progress
                                            value={rate}
                                            aria-label={`${row.name}: ${rate}% complete`}
                                        />
                                        <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
                                            {rate}%
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {rows.length === 0 && (
                        <TableRow>
                            <TableCell
                                colSpan={7}
                                className="py-8 text-center text-muted-foreground"
                            >
                                No students yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
