import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AppSidebar } from "@/components/portal/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { requireUser } from "@/lib/auth/dal";
import { listStudentOptions } from "@/lib/students/queries";

export const metadata: Metadata = {
    title: "Dashboard",
    robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await requireUser();
    const [students, cookieStore] = await Promise.all([
        user.role === "admin" ? listStudentOptions() : undefined,
        cookies(),
    ]);
    // The sidebar remembers whether it was collapsed.
    const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";

    return (
        <TooltipProvider>
            <SidebarProvider defaultOpen={defaultOpen} className="bg-sidebar text-foreground">
                <AppSidebar
                    user={user}
                    students={students?.map((s) => ({ id: s.value, name: s.name }))}
                />
                <SidebarInset className="min-w-0">{children}</SidebarInset>
            </SidebarProvider>
            <Toaster position="bottom-right" />
        </TooltipProvider>
    );
}
