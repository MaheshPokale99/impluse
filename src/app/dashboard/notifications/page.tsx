import type { Metadata } from "next";
import { Bell } from "lucide-react";
import { ActivityList } from "@/components/portal/activity-list";
import { PageIcon, PortalPage } from "@/components/portal/ui";
import { requireUser } from "@/lib/auth/dal";
import { listNotifications } from "@/lib/notifications/queries";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
    const user = await requireUser();
    const admin = user.role === "admin";
    const items = await listNotifications();

    return (
        <PortalPage
            crumbs={[{ label: "Notifications" }]}
            icon={<PageIcon icon={Bell} />}
            title="Notifications"
            description={
                admin
                    ? "What your students changed, and new sign-up requests. Newest first."
                    : "Changes your mentor made to your profile, daily log and tasks."
            }
        >
            <ActivityList
                items={items}
                emptyText={
                    admin
                        ? "When a student updates their log or tasks, or someone signs up, it shows up here."
                        : "When your mentor updates your profile, log or tasks, it shows up here."
                }
            />
        </PortalPage>
    );
}
