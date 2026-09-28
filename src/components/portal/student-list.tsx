"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Search, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
    InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { todayInIndia } from "@/lib/dates";
import { optionLabel, optionValue, type FieldOption } from "@/lib/forms";
import { formatStudentId, studentOptions } from "@/lib/students/fields";
import type { StudentSummary } from "@/lib/students/queries";
import { FilterSelect } from "./option-select";
import { Pager, usePages } from "./pager";
import { formatDate, initials, ValueBadge } from "./values";

const filters = [
    { key: "batch", label: "Batch", options: studentOptions.batch },
    { key: "studentStatus", label: "Status", options: studentOptions.studentStatus },
    { key: "priority", label: "Priority", options: studentOptions.priority },
] as const;
type FilterKey = (typeof filters)[number]["key"];

const percent = (value: number | null) => (value == null ? "" : `${value}%`);
const head = "h-9 px-3 text-xs font-normal text-muted-foreground";
const cell = "px-3 py-2";

const NO_SECTION = "__none__";

/** The mentor's overview: one line per student with their headline details, 30 per page. */
export function StudentList({
    students,
    sections,
}: {
    students: StudentSummary[];
    sections: FieldOption[];
}) {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Record<FilterKey | "sectionId", string>>({
        sectionId: "",
        batch: "",
        studentStatus: "",
        priority: "",
    });
    const today = todayInIndia();
    const sectionNames = useMemo(
        () => new Map(sections.map((section) => [optionValue(section), optionLabel(section)])),
        [sections],
    );
    const sectionOf = (student: StudentSummary) =>
        (student.sectionId && sectionNames.get(student.sectionId)) || null;

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return students.filter(
            (student) =>
                (!q ||
                    [student.name, student.email, formatStudentId(student.studentNumber)]
                        .join(" ")
                        .toLowerCase()
                        .includes(q)) &&
                filters.every(({ key }) => !selected[key] || student[key] === selected[key]) &&
                (!selected.sectionId ||
                    (selected.sectionId === NO_SECTION
                        ? !sectionNames.has(student.sectionId ?? "")
                        : student.sectionId === selected.sectionId)),
        );
    }, [students, query, selected, sectionNames]);
    const pages = usePages(visible);
    const filter = (key: keyof typeof selected, value: string) => {
        setSelected((current) => ({ ...current, [key]: value }));
        pages.setPage(0);
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <InputGroup className="sm:w-72">
                    <InputGroupAddon>
                        <Search />
                    </InputGroupAddon>
                    <InputGroupInput
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                            pages.setPage(0);
                        }}
                        placeholder="Search"
                        aria-label="Search students by name, email or ID"
                    />
                    <InputGroupAddon align="inline-end">
                        <InputGroupText className="text-xs tabular-nums" aria-live="polite">
                            {visible.length} of {students.length}
                        </InputGroupText>
                    </InputGroupAddon>
                </InputGroup>
                {/* One row of filters; on narrow screens it scrolls sideways instead of wrapping. */}
                <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
                    {sections.length > 0 && (
                        <FilterSelect
                            label="Section"
                            options={[...sections, { value: NO_SECTION, label: "No section" }]}
                            value={selected.sectionId}
                            onChange={(value) => filter("sectionId", value)}
                            className="shrink-0"
                        />
                    )}
                    {filters.map(({ key, label, options }) => (
                        <FilterSelect
                            key={key}
                            label={label}
                            options={options}
                            value={selected[key]}
                            onChange={(value) => filter(key, value)}
                            className="shrink-0"
                        />
                    ))}
                </div>
            </div>

            {visible.length === 0 ? (
                <Empty className="border-y">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <Users />
                        </EmptyMedia>
                        <EmptyTitle>
                            {students.length === 0 ? "No students yet" : "No matches"}
                        </EmptyTitle>
                        <EmptyDescription>
                            {students.length === 0
                                ? "Add your first student to start their daily log."
                                : "Try a different search or clear the filters."}
                        </EmptyDescription>
                    </EmptyHeader>
                </Empty>
            ) : (
                <>
                    {/* Phones: a compact list; the full table starts at tablet width. */}
                    <ul className="divide-y border-y md:hidden">
                        {pages.rows.map((student) => {
                            const callDue =
                                student.nextCallDate !== null && student.nextCallDate <= today;
                            const meta = [
                                student.lastTestScore != null &&
                                    `Last test ${student.lastTestScore}%`,
                                student.nextCallDate &&
                                    `Next call ${formatDate(student.nextCallDate)}`,
                            ].filter(Boolean);
                            return (
                                <li key={student.id}>
                                    <Link
                                        prefetch={false}
                                        href={`/dashboard/students/${student.id}`}
                                        className="flex items-center gap-3 py-3 outline-none focus-visible:bg-muted active:bg-muted"
                                    >
                                        <Avatar className="size-9">
                                            <AvatarFallback className="text-xs">
                                                {initials(student.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                                            <div className="flex items-baseline justify-between gap-2">
                                                <span className="truncate font-medium">
                                                    {student.name}
                                                </span>
                                                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                                                    {formatStudentId(student.studentNumber)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {[
                                                    sectionOf(student),
                                                    student.batch,
                                                    student.studentStatus,
                                                    student.priority,
                                                ]
                                                    .filter((value): value is string =>
                                                        Boolean(value),
                                                    )
                                                    .map((value) => (
                                                        <ValueBadge key={value} value={value} />
                                                    ))}
                                            </div>
                                            {meta.length > 0 && (
                                                <span
                                                    className={
                                                        callDue
                                                            ? "text-xs text-destructive"
                                                            : "text-xs text-muted-foreground"
                                                    }
                                                >
                                                    {meta.join(" · ")}
                                                </span>
                                            )}
                                        </div>
                                        <ChevronRight
                                            className="size-4 shrink-0 text-muted-foreground"
                                            aria-hidden
                                        />
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                    <ScrollArea className="hidden overflow-hidden md:block">
                        <table className="w-full min-w-240 text-sm">
                            <TableHeader>
                                <TableRow className="border-y hover:bg-transparent">
                                    <TableHead className={head}>Name</TableHead>
                                    <TableHead className={head}>ID</TableHead>
                                    <TableHead className={head}>Section</TableHead>
                                    <TableHead className={head}>Batch</TableHead>
                                    <TableHead className={head}>Status</TableHead>
                                    <TableHead className={head}>Target</TableHead>
                                    <TableHead className={head}>Priority</TableHead>
                                    <TableHead className={`${head} text-right`}>
                                        Avg score
                                    </TableHead>
                                    <TableHead className={`${head} text-right`}>
                                        Last test
                                    </TableHead>
                                    <TableHead className={head}>Next call</TableHead>
                                    <TableHead className={head}>Last update</TableHead>
                                    <TableHead className="w-8">
                                        <span className="sr-only">Open</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pages.rows.map((student) => {
                                    const href = `/dashboard/students/${student.id}`;
                                    const callDue =
                                        student.nextCallDate !== null &&
                                        student.nextCallDate <= today;
                                    return (
                                        <TableRow
                                            key={student.id}
                                            className="group cursor-pointer"
                                            onClick={() => router.push(href)}
                                        >
                                            <TableCell className={cell}>
                                                <div className="flex items-center gap-2.5">
                                                    <Avatar className="size-7">
                                                        <AvatarFallback className="text-xs">
                                                            {initials(student.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex min-w-0 flex-col leading-tight">
                                                        <Link
                                                            prefetch={false}
                                                            href={href}
                                                            className="truncate font-medium underline-offset-2 group-hover:underline focus-visible:underline focus-visible:outline-none"
                                                            onClick={(event) =>
                                                                event.stopPropagation()
                                                            }
                                                        >
                                                            {student.name}
                                                        </Link>
                                                        <span className="truncate text-xs text-muted-foreground">
                                                            {student.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell
                                                className={`${cell} text-muted-foreground tabular-nums`}
                                            >
                                                {formatStudentId(student.studentNumber)}
                                            </TableCell>
                                            <TableCell className={`${cell} max-w-40 truncate`}>
                                                {sectionOf(student)}
                                            </TableCell>
                                            <TableCell className={cell}>
                                                {student.batch && (
                                                    <ValueBadge value={student.batch} />
                                                )}
                                            </TableCell>
                                            <TableCell className={cell}>
                                                {student.studentStatus && (
                                                    <ValueBadge value={student.studentStatus} />
                                                )}
                                            </TableCell>
                                            <TableCell className={cell}>
                                                {[student.targetExam, student.targetYear]
                                                    .filter(Boolean)
                                                    .join(" · ")}
                                            </TableCell>
                                            <TableCell className={cell}>
                                                {student.priority && (
                                                    <ValueBadge value={student.priority} />
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className={`${cell} text-right tabular-nums`}
                                            >
                                                {percent(student.averageScore)}
                                            </TableCell>
                                            <TableCell
                                                className={`${cell} text-right tabular-nums`}
                                            >
                                                {percent(student.lastTestScore)}
                                            </TableCell>
                                            <TableCell
                                                className={
                                                    callDue
                                                        ? `${cell} font-medium text-destructive`
                                                        : cell
                                                }
                                            >
                                                {student.nextCallDate
                                                    ? formatDate(student.nextCallDate)
                                                    : ""}
                                            </TableCell>
                                            <TableCell className={`${cell} text-muted-foreground`}>
                                                {student.lastEntryDate === today
                                                    ? "Today"
                                                    : student.lastEntryDate
                                                      ? formatDate(student.lastEntryDate)
                                                      : "No entries"}
                                            </TableCell>
                                            <TableCell className="px-2">
                                                <ChevronRight
                                                    className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100"
                                                    aria-hidden
                                                />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </table>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <Pager {...pages} label="Students" />
                </>
            )}
        </div>
    );
}
