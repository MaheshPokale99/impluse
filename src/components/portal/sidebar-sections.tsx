"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronRight,
    Folder,
    FolderOpen,
    Inbox,
    MoreHorizontal,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { createSection, deleteSection, renameSection } from "@/lib/sections/actions";
import { ADMISSIONS_FALLBACK_NAME, sectionFields } from "@/lib/sections/fields";
import type { SidebarStudent } from "@/lib/sections/queries";
import { ConfirmAction, FormDialog } from "./dialogs";
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
    const q = query.trim().toLowerCase();
    const admissions = sections.find((section) => section.admissions);
    const custom = sections.filter((section) => !section.admissions);
    const known = new Set(custom.map((section) => section.id));
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
            <FormDialog
                title="New section"
                description="Group students the way you work, e.g. by batch or class. You can rename it later."
                trigger={
                    <SidebarGroupAction title="New section">
                        <Plus /> <span className="sr-only">New section</span>
                    </SidebarGroupAction>
                }
                action={createSection}
                fields={sectionFields}
                submitLabel="Add section"
            />
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
                        />
                    ))}
                    {q && shown.length === 0 && (
                        <li className="px-2 py-1.5 text-xs text-muted-foreground">
                            No student matches “{query.trim()}”.
                        </li>
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
}: {
    group: Group;
    unread: Record<string, number>;
    searching: boolean;
}) {
    const pathname = usePathname();
    const hrefFor = (id: string) =>
        group.kind === "admissions" ? "/dashboard/admissions" : `/dashboard/students/${id}`;
    const unreadTotal = group.students.reduce((sum, student) => sum + (unread[student.id] ?? 0), 0);
    // Sections with news, requests or the open student start open; others as last left.
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
    const open = clicked ?? (needsAttention || stored === true);
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
                                <SidebarMenuAction showOnHover aria-label={`${group.name} options`}>
                                    <MoreHorizontal />
                                </SidebarMenuAction>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent side="right" align="start">
                                <DropdownMenuItem onSelect={() => setDialog("rename")}>
                                    <Pencil /> Rename
                                </DropdownMenuItem>
                                {group.kind === "custom" && (
                                    <DropdownMenuItem
                                        variant="destructive"
                                        onSelect={() => setDialog("delete")}
                                    >
                                        <Trash2 /> Delete section
                                    </DropdownMenuItem>
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
                                description={
                                    group.students.length > 0
                                        ? `Its ${group.students.length} ${group.students.length === 1 ? "student stays" : "students stay"} in the workspace and move to “No section”.`
                                        : "The section is empty; nothing else changes."
                                }
                                confirmLabel="Delete section"
                                action={deleteSection.bind(null, section.id)}
                            />
                        )}
                    </>
                )}
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {group.students.map((student) => {
                            const href = hrefFor(student.id);
                            const count = unread[student.id] ?? 0;
                            return (
                                <SidebarMenuSubItem key={student.id}>
                                    <SidebarMenuSubButton asChild isActive={pathname === href}>
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
