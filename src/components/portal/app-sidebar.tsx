"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    ChevronsUpDown,
    ListChecks,
    LogOut,
    Moon,
    Sun,
    TrendingUp,
    UserRound,
    Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/impulsevidya/theme-toggle";
import { logout } from "@/lib/auth/actions";
import { Logo } from "./ui";
import { initials } from "./values";

/** The workspace sidebar: navigation, the student list (for mentors) and the account menu. */
export function AppSidebar({
    user,
    students,
}: {
    user: { name: string; email: string; role: string };
    students?: { id: string; name: string }[];
}) {
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme("light");
    const [, startTransition] = useTransition();
    const admin = user.role === "admin";
    const nav = [
        {
            href: "/dashboard",
            label: admin ? "Students" : "My progress",
            icon: admin ? Users : TrendingUp,
        },
        { href: "/dashboard/tasks", label: admin ? "Tasks" : "My tasks", icon: ListChecks },
    ];

    return (
        <Sidebar>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link prefetch={false} href="/dashboard">
                                <Logo />
                                <span className="flex flex-col leading-tight">
                                    <span className="font-semibold text-sidebar-accent-foreground">
                                        ImpulseVidya
                                    </span>
                                    <span className="text-xs">
                                        {admin ? "Mentor workspace" : "Student workspace"}
                                    </span>
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {nav.map(({ href, label, icon: Icon }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton asChild isActive={pathname === href}>
                                        <Link prefetch={false} href={href}>
                                            <Icon />
                                            <span>{label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {students && students.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Students</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {students.map((student) => {
                                    const href = `/dashboard/students/${student.id}`;
                                    return (
                                        <SidebarMenuItem key={student.id}>
                                            <SidebarMenuButton asChild isActive={pathname === href}>
                                                <Link prefetch={false} href={href}>
                                                    <Avatar className="size-5">
                                                        <AvatarFallback className="text-[10px]">
                                                            {initials(student.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{student.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton size="lg" aria-label="Account menu">
                                    <Avatar className="size-7">
                                        <AvatarFallback className="text-xs">
                                            {initials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="flex min-w-0 flex-col leading-tight">
                                        <span className="truncate font-medium text-sidebar-accent-foreground">
                                            {user.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {admin ? "Mentor" : "Student"}
                                        </span>
                                    </span>
                                    <ChevronsUpDown className="ml-auto" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="start"
                                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
                            >
                                <DropdownMenuLabel className="flex flex-col">
                                    <span className="text-foreground">{user.name}</span>
                                    <span className="text-xs font-normal">{user.email}</span>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link prefetch={false} href="/dashboard/profile">
                                        <UserRound /> Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={toggleTheme}>
                                    {theme === "dark" ? <Sun /> : <Moon />}
                                    {theme === "dark" ? "Light mode" : "Dark mode"}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onSelect={() => startTransition(() => logout())}>
                                    <LogOut /> Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
