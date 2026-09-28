"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight,
    Folder,
    FolderInput,
    FolderOpen,
    Inbox,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
    UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarInput,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import type { Section } from "@/lib/db/schema";
import type { FieldOption } from "@/lib/forms";
import {
    createSection,
    deleteSection,
    nameUnsortedStudents,
    renameSection,
} from "@/lib/sections/actions";
import { ADMISSIONS_FALLBACK_NAME, sectionFields } from "@/lib/sections/fields";
import type { SidebarStudent } from "@/lib/sections/queries";
import { ConfirmAction, FormDialog } from "./dialogs";
import { NewSectionForStudent, SectionMoveItems, useMoveStudent } from "./move-to-section";
import { initials } from "./values";

// Which sections the mentor left open, remembered in this browser only.
const OPEN_SECTIONS_KEY = "impulsevidya-open-sections";

function storedOpenSections(): Record<string, boolean> {
    try {
        return JSON.parse(localStorage.getItem(OPEN_SECTIONS_KEY) ?? "{}");
    } catch {
        return {};
    }
}

function storeOpenSection(key: string, open: boolean) {
    try {
        localStorage.setItem(
            OPEN_SECTIONS_KEY,
            JSON.stringify({ ...storedOpenSections(), [key]: open }),
        );
    } catch {
        // Storage can be unavailable (private windows); the section still opens and closes.
    }
}

const countLabel = ({ kind, students: { length } }: Group) =>
    `${length} ${kind === "admissions" ? "request" : "student"}${length === 1 ? "" : "s"}`;

// The stored value only changes through this component's own clicks, tracked in state.
const noSubscription = () => () => {};

type Group = {
    key: string;
    name: string;
    kind: "admissions" | "custom" | "none";
    section?: Pick<Section, "id" | "name">;
    students: SidebarStudent[];
};

/**
 * The mentor's students grouped into sections they name themselves, each a collapsible list.
 * "New admissions" holds sign-up requests; students without a section appear under "No section".
 * A number after a name counts that student's unread activity.
 */
export function SidebarSections({
    sections,
    students,
    unread,
}: {
    sections: Pick<Section, "id" | "name" | "admissions">[];
    students: SidebarStudent[];
    unread: Record<string, number>;
}) {
    const [query, setQuery] = useState("");
    const [creatingSection, setCreatingSection] = useState(false);
    const [namingUnsorted, setNamingUnsorted] = useState(false);
    const [creatingFor, setCreatingFor] = useState<SidebarStudent | null>(null);
    const q = query.trim().toLowerCase();
    const admissions = sections.find((section) => section.admissions);
    const custom = sections.filter((section) => !section.admissions);
    const known = new Set(custom.map((section) => section.id));
    const sectionOptions = custom.map((section) => ({ value: section.id, label: section.name }));
    const active = students.filter((student) => student.status === "active");

    const groups: Group[] = [
        {
            key: "admissions",
            name: admissions?.name ?? ADMISSIONS_FALLBACK_NAME,
            kind: "admissions",
            section: admissions,
            students: students.filter((student) => student.status === "pending"),
        },
        ...custom.map((section): Group => ({
            key: section.id,
            name: section.name,
            kind: "custom",
            section,
            students: active.filter((student) => student.sectionId === section.id),
        })),
        {
            key: "none",
            name: "No section",
            kind: "none",
            students: active.filter(
                (student) => !student.sectionId || !known.has(student.sectionId),
            ),
        },
    ];

    const unsorted = groups[groups.length - 1];
    const shown = groups
        .filter((group) => group.kind !== "none" || group.students.length > 0)
        .map((group) =>
            q
                ? {
                      ...group,
                      students: group.students.filter((student) =>
                          student.name.toLowerCase().includes(q),
                      ),
                  }
                : group,
        )
        .filter((group) => !q || group.students.length > 0);

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Sections</SidebarGroupLabel>
            <SidebarGroupAction title="New section" onClick={() => setCreatingSection(true)}>
                <Plus /> <span className="sr-only">New section</span>
            </SidebarGroupAction>
            <FormDialog
                open={creatingSection}
                onOpenChange={setCreatingSection}
                title="New section"
                description="Group students the way you work, e.g. by batch or class. You can rename it later."
                action={createSection}
                fields={sectionFields}
                submitLabel="Add section"
            />
            <FormDialog
                open={namingUnsorted}
                onOpenChange={setNamingUnsorted}
                title="Name this section"
                description={`“No section” becomes a section with this name, and its ${countLabel(unsorted)} move into it.`}
                action={nameUnsortedStudents}
                fields={sectionFields}
                submitLabel="Save name"
            />
            {creatingFor && (
                <NewSectionForStudent
                    student={creatingFor}
                    open
                    onOpenChange={(open) => !open && setCreatingFor(null)}
                />
            )}
            <SidebarGroupContent className="flex flex-col gap-1">
                {students.length > 0 && (
                    <SidebarInput
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Find a student"
                        aria-label="Find a student"
                        className="mb-1"
                    />
                )}
                <SidebarMenu>
                    {shown.map((group) => (
                        <SectionItem
                            key={group.key}
                            group={group}
                            unread={unread}
                            searching={Boolean(q)}
                            sectionOptions={sectionOptions}
                            onNameUnsorted={() => setNamingUnsorted(true)}
                            onNewSectionFor={setCreatingFor}
                        />
                    ))}
                    {q && shown.length === 0 && (
                        <li className="px-2 py-1.5 text-xs text-muted-foreground">
                            No student matches “{query.trim()}”.
                        </li>
                    )}
                    {!q && (
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                className="text-muted-foreground"
                                onClick={() => setCreatingSection(true)}
                            >
                                <Plus aria-hidden /> New section
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

function SectionItem({
    group,
    unread,
    searching,
    sectionOptions,
    onNameUnsorted,
    onNewSectionFor,
}: {
    group: Group;
    unread: Record<string, number>;
    searching: boolean;
    sectionOptions: FieldOption[];
    onNameUnsorted: () => void;
    onNewSectionFor: (student: SidebarStudent) => void;
}) {
    const pathname = usePathname();
    const hrefFor = (id: string) =>
        group.kind === "admissions" ? "/dashboard/admissions" : `/dashboard/students/${id}`;
    const unreadTotal = group.students.reduce((sum, student) => sum + (unread[student.id] ?? 0), 0);
    const needsAttention =
        unreadTotal > 0 ||
        (group.kind === "admissions" && group.students.length > 0) ||
        group.students.some((student) => pathname === hrefFor(student.id));
    const stored = useSyncExternalStore(
        noSubscription,
        () => storedOpenSections()[group.key],
        () => undefined,
    );
    const [clicked, setClicked] = useState<boolean>();
    const open = clicked ?? (needsAttention || stored !== false);
    const toggle = (next: boolean) => {
        setClicked(next);
        storeOpenSection(group.key, next);
    };
    const [dialog, setDialog] = useState<"rename" | "delete" | null>(null);
    const Icon = group.kind === "admissions" ? Inbox : open ? FolderOpen : Folder;
    const { section } = group;

    return (
        <Collapsible asChild open={searching || open} onOpenChange={toggle}>
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="group/section">
                        <ChevronRight
                            className="transition-transform group-data-[state=open]/section:rotate-90"
                            aria-hidden
                        />
                        <Icon aria-hidden />
                        <span className="min-w-0 flex-1 truncate">{group.name}</span>
                        {unreadTotal > 0 && (
                            <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden />
                        )}
                        <span
                            className="shrink-0 text-xs text-muted-foreground tabular-nums"
                            aria-hidden
                        >
                            {group.students.length}
                        </span>
                        <span className="sr-only">
                            {` (${countLabel(group)}${unreadTotal > 0 ? `, ${unreadTotal} unread` : ""})`}
                        </span>
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                {section && (
                    <>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuAction aria-label={`${group.name} options`}>
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start" className="min-w-44">
                                <DropdownMenuItem onSelect={() => setDialog("rename")}>
                                    <Pencil /> Rename
                                </DropdownMenuItem>
                                {group.kind === "custom" && (
                                    <>
                                        <DropdownMenuItem
                                            variant="destructive"
                                            disabled={group.students.length > 0}
                                            onSelect={() => setDialog("delete")}
                                        >
                                            <Trash2 /> Delete section
                                        </DropdownMenuItem>
                                        {group.students.length > 0 && (
                                            <p className="max-w-52 px-2 pb-1.5 text-xs text-muted-foreground">
                                                Move its {countLabel(group)} to another section
                                                first.
                                            </p>
                                        )}
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <FormDialog
                            open={dialog === "rename"}
                            onOpenChange={(next) => setDialog(next ? "rename" : null)}
                            title="Rename section"
                            action={renameSection.bind(null, section.id)}
                            fields={sectionFields}
                            values={{ name: section.name }}
                            submitLabel="Save name"
                        />
                        {group.kind === "custom" && (
                            <ConfirmAction
                                open={dialog === "delete"}
                                onOpenChange={(next) => setDialog(next ? "delete" : null)}
                                title={`Delete “${section.name}”?`}
                                description="The empty section is removed from the sidebar."
                                confirmLabel="Delete section"
                                action={deleteSection.bind(null, section.id)}
                            />
                        )}
                    </>
                )}
                {group.kind === "none" && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuAction aria-label={`${group.name} options`}>
                                <MoreHorizontal />
                            </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="right" align="start" className="min-w-44">
                            <DropdownMenuItem onSelect={onNameUnsorted}>
                                <Pencil /> Rename
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {group.students.map((student) => {
                            const href = hrefFor(student.id);
                            const count = unread[student.id] ?? 0;
                            return (
                                <SidebarMenuSubItem
                                    key={student.id}
                                    className="group/student relative"
                                >
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={pathname === href}
                                        className={group.kind === "admissions" ? undefined : "pr-7"}
                                    >
                                        <Link prefetch={false} href={href}>
                                            <Avatar className="size-5">
                                                <AvatarFallback className="text-[10px]">
                                                    {initials(student.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="min-w-0 flex-1 truncate">
                                                {student.name}
                                            </span>
                                            {count > 0 && (
                                                <span className="ml-auto grid h-4 min-w-4 shrink-0 place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground tabular-nums">
                                                    {count}
                                                    <span className="sr-only"> unread</span>
                                                </span>
                                            )}
                                        </Link>
                                    </SidebarMenuSubButton>
                                    {group.kind !== "admissions" && (
                                        <StudentMenu
                                            student={student}
                                            href={href}
                                            sectionOptions={sectionOptions}
                                            onNewSection={() => onNewSectionFor(student)}
                                        />
                                    )}
                                </SidebarMenuSubItem>
                            );
                        })}
                        {group.students.length === 0 && (
                            <li className="px-2 py-1 text-xs text-muted-foreground">
                                {group.kind === "admissions" ? "No requests" : "No students yet"}
                            </li>
                        )}
                        {group.kind === "admissions" && group.students.length > 0 && (
                            <li>
                                <Button
                                    asChild
                                    variant="link"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                >
                                    <Link prefetch={false} href="/dashboard/admissions">
                                        Review requests
                                    </Link>
                                </Button>
                            </li>
                        )}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

function StudentMenu({
    student,
    href,
    sectionOptions,
    onNewSection,
}: {
    student: SidebarStudent;
    href: string;
    sectionOptions: FieldOption[];
    onNewSection: () => void;
}) {
    const { move } = useMoveStudent();
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button
                        type="button"
                        aria-label={`${student.name} options`}
                        className="absolute top-1/2 right-1 flex size-5 -translate-y-1/2 items-center justify-center rounded-md text-sidebar-foreground outline-hidden after:absolute after:-inset-2 hover:bg-sidebar-accent md:after:hidden focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[state=open]:bg-sidebar-accent md:opacity-0 md:group-focus-within/student:opacity-100 md:group-hover/student:opacity-100 md:data-[state=open]:opacity-100 [&>svg]:size-4"
                    >
                        <MoreHorizontal />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="right" align="start" className="min-w-48">
                    <DropdownMenuItem asChild>
                        <Link prefetch={false} href={href}>
                            <UserRound /> Open
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <FolderInput /> Move to section
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="min-w-48">
                            <SectionMoveItems
                                student={student}
                                sections={sectionOptions}
                                onMove={move}
                                onNewSection={onNewSection}
                            />
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
