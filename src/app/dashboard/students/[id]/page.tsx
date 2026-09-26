import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { ConfirmAction } from "@/components/portal/dialogs";
import { StudentPage } from "@/components/portal/student-page";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth/dal";
import { isUuid } from "@/lib/forms";
import { deleteStudent } from "@/lib/students/actions";
import { formatStudentId } from "@/lib/students/fields";
import { getStudent, listEntries } from "@/lib/students/queries";
import { getTaskProgress, listTasks } from "@/lib/tasks/queries";

export const metadata: Metadata = { title: "Student" };

export default async function StudentDetailPage({ params }: PageProps<"/dashboard/students/[id]">) {
    const viewer = await requireAdmin();
    const { id } = await params;
    if (!isUuid(id)) notFound();
    // All four load at once: one database round trip instead of two.
    const [student, entries, tasks, [progress]] = await Promise.all([
        getStudent(id),
        listEntries(id),
        listTasks(id),
        getTaskProgress(id),
    ]);
    if (!student) notFound();

    return (
        <StudentPage
            crumbs={[{ label: "Students", href: "/dashboard" }, { label: student.name }]}
            student={student}
            viewer={viewer}
            entries={entries}
            progress={progress}
            tasks={tasks}
            title={student.name}
            description={`${formatStudentId(student.studentNumber)} · ${student.email}`}
            actions={
                <ConfirmAction
                    title={`Delete ${student.name}?`}
                    description="Their profile, daily log and tasks will be removed permanently."
                    confirmLabel="Delete student"
                    action={deleteStudent.bind(null, id)}
                    trigger={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                        >
                            <Trash2 /> Delete
                        </Button>
                    }
                />
            }
        />
    );
}
