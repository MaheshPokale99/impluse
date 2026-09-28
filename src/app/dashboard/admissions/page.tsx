import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { AdmissionsList } from "@/components/portal/admissions-list";
import { PageIcon, PortalPage } from "@/components/portal/ui";
import { requireAdmin } from "@/lib/auth/dal";
import { ADMISSIONS_FALLBACK_NAME } from "@/lib/sections/fields";
import { listSections } from "@/lib/sections/queries";
import { listAdmissions } from "@/lib/students/queries";

export const metadata: Metadata = { title: "New admissions" };

export default async function AdmissionsPage() {
    await requireAdmin();
    const [requests, sections] = await Promise.all([listAdmissions(), listSections()]);
    const title = sections.find((section) => section.admissions)?.name ?? ADMISSIONS_FALLBACK_NAME;

    return (
        <PortalPage
            crumbs={[{ label: title }]}
            icon={<PageIcon icon={Inbox} />}
            title={title}
            description="People who signed up on the website. Approve a request to let them sign in and choose their section, or decline it."
        >
            <AdmissionsList
                requests={requests}
                sections={sections
                    .filter((section) => !section.admissions)
                    .map((section) => ({ value: section.id, label: section.name }))}
            />
        </PortalPage>
    );
}
