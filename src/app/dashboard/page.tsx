import { CalendarCheck, Flag, PhoneCall, Plus, UserCheck, Users } from "lucide-react";
import { FormDialog } from "@/components/portal/dialogs";
import { StudentList } from "@/components/portal/student-list";
import { StudentPage } from "@/components/portal/student-page";
import { PageIcon, PortalPage, Summary } from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { requireUser, type CurrentUser } from "@/lib/auth/dal";
import { todayInIndia } from "@/lib/dates";
import { createStudent } from "@/lib/students/actions";
import { createStudentSections, formatStudentId } from "@/lib/students/fields";
import { listSectionOptions } from "@/lib/sections/queries";
import { getLogColumns, getStudent, listEntries, listStudents } from "@/lib/students/queries";
import { getTaskProgress } from "@/lib/tasks/queries";

export default async function DashboardPage() {
    const user = await requireUser();
    return user.role === "admin" ? <AdminOverview /> : <StudentOverview user={user} />;
}

async function AdminOverview() {
    const [students, sections] = await Promise.all([listStudents(), listSectionOptions()]);
    const today = todayInIndia();
    const count = (predicate: (s: (typeof students)[number]) => boolean) =>
        students.filter(predicate).length;

    return (
        <PortalPage
            crumbs={[{ label: "Students" }]}
            icon={<PageIcon icon={Users} />}
            title="Students"
            description="Select a student to open their daily log, profile and tasks."
            actions={
                <FormDialog
                    title="New student"
                    description="A password is generated automatically and emailed to the student with the website link."
                    className="sm:max-w-2xl"
                    trigger={
                        <Button size="sm">
                            <Plus /> New student
                        </Button>
                    }
                    action={createStudent}
                    sections={createStudentSections(sections)}
                    columns={2}
                    values={{ studentStatus: "Active", joiningDate: today }}
                    submitLabel="Create student"
                />
            }
        >
            <Summary
                items={[
                    { icon: Users, label: "Students", value: students.length },
                    {
                        icon: UserCheck,
                        label: "Active",
                        value: count((s) => s.studentStatus === "Active"),
                    },
                    {
                        icon: Flag,
                        label: "High priority",
                        value: count((s) => s.priority === "High"),
                    },
                    {
                        icon: PhoneCall,
                        label: "Calls due",
                        value: count((s) => s.nextCallDate !== null && s.nextCallDate <= today),
                    },
                    {
                        icon: CalendarCheck,
                        label: "Logged today",
                        value: `${count((s) => s.lastEntryDate === today)} of ${students.length}`,
                    },
                ]}
            />
            <StudentList students={students} sections={sections} />
        </PortalPage>
    );
}

async function StudentOverview({ user }: { user: CurrentUser }) {
    const [student, entries, columns, [progress]] = await Promise.all([
        getStudent(user.id),
        listEntries(user.id),
        getLogColumns(),
        getTaskProgress(),
    ]);
    if (!student) {
        return (
            <PortalPage
                crumbs={[{ label: "My progress" }]}
                icon={<PageIcon icon={Users} />}
                title="Almost there"
                description="Your mentor is still setting up your student profile."
            >
                {null}
            </PortalPage>
        );
    }

    return (
        <StudentPage
            crumbs={[{ label: "My progress" }]}
            student={student}
            entries={entries}
            columns={columns}
            viewer={user}
            progress={progress}
            title={student.name}
            description={`${formatStudentId(student.studentNumber)} · Your progress day by day`}
        />
    );
}
