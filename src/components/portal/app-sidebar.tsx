"use client";

import { useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Bell,
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
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { useTheme } from "@/components/impulsevidya/theme-toggle";
import { logout } from "@/lib/auth/actions";
import { SidebarSections } from "./sidebar-sections";
import { Logo } from "./ui";
import { initials } from "./values";

/**
 * The workspace sidebar: navigation (with the unread notification count), the mentor's
 * student sections, and the account menu.
 */
export function AppSidebar({
    user,
    unreadTotal,
    sections,
}: {
    user: { name: string; email: string; role: string };
    unreadTotal: number;
    sections?: React.ComponentProps<typeof SidebarSections>;
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
        {
            href: "/dashboard/notifications",
            label: "Notifications",
            icon: Bell,
            badge: unreadTotal,
        },
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
                            {nav.map(({ href, label, icon: Icon, badge }) => (
                                <SidebarMenuItem key={href}>
                                    <SidebarMenuButton asChild isActive={pathname === href}>
                                        <Link prefetch={false} href={href}>
                                            <Icon />
                                            <span>{label}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                    {badge ? (
                                        <SidebarMenuBadge className="bg-primary text-primary-foreground peer-hover/menu-button:text-primary-foreground peer-data-active/menu-button:text-primary-foreground">
                                            <span className="sr-only">Unread: </span>
                                            {badge}
                                        </SidebarMenuBadge>
                                    ) : null}
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {sections && <SidebarSections {...sections} />}
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
