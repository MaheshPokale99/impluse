import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/portal/app-sidebar";
import { LiveRefresh } from "@/components/portal/live-refresh";
import { UnreadProvider } from "@/components/portal/unread-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireUser } from "@/lib/auth/dal";
import { unreadByStudent, unreadForStudent } from "@/lib/notifications/queries";
import { listSections, listSidebarStudents } from "@/lib/sections/queries";

export const metadata: Metadata = {
    title: "Dashboard",
    robots: { index: false, follow: false },
};

async function mentorSidebar() {
    const [sections, students, unread] = await Promise.all([
        listSections(),
        listSidebarStudents(),
        unreadByStudent(),
    ]);
    return {
        sections: {
            sections: sections.map(({ id, name, admissions }) => ({ id, name, admissions })),
            students,
            unread,
        },
        unreadTotal: Object.values(unread).reduce((sum, count) => sum + count, 0),
    };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await requireUser();
    const [sidebar, cookieStore] = await Promise.all([
        user.role === "admin"
            ? mentorSidebar()
            : unreadForStudent().then((unreadTotal) => ({ unreadTotal, sections: undefined })),
        cookies(),
    ]);
    // The sidebar remembers whether it was collapsed.
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={defaultOpen} className="bg-sidebar text-foreground">
                <AppSidebar user={user} {...sidebar} />
                <SidebarInset className="min-w-0">
                    <UnreadProvider count={sidebar.unreadTotal}>{children}</UnreadProvider>
                </SidebarInset>
            </SidebarProvider>
            <Toaster position="bottom-right" />
            <LiveRefresh />
        </TooltipProvider>
    );
}
