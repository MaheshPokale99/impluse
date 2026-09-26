import type { Metadata } from "next";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { ActionForm } from "@/components/portal/action-form";
import { PageIcon, PortalPage, Section } from "@/components/portal/ui";
import { changePassword } from "@/lib/auth/actions";
import { requireUser } from "@/lib/auth/dal";
import { changePasswordFields, profileFields } from "@/lib/auth/fields";
import { toFormValues } from "@/lib/forms";
import { updateAccount } from "@/lib/students/actions";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
    const user = await requireUser();
    const admin = user.role === "admin";

    return (
        <PortalPage
            crumbs={[{ label: "Profile" }]}
            icon={<PageIcon icon={UserRound} />}
            title="Profile"
            description={user.email}
        >
            <div className="flex max-w-xl flex-col gap-8">
                <Section title="Account">
                    {admin ? (
                        <ActionForm
                            action={updateAccount}
                            fields={profileFields}
                            values={toFormValues({ name: user.name, phone: user.phone })}
                            submitLabel="Save details"
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            Your name and email are managed by your mentor. Update your phone and
                            other details on{" "}
                            <Link
                                prefetch={false}
                                href="/dashboard"
                                className="text-primary underline-offset-2 hover:underline"
                            >
                                My progress
                            </Link>
                            .
                        </p>
                    )}
                </Section>
                <Section
                    title="Password"
                    description="Changing it signs you out on your other devices."
                >
                    <ActionForm
                        action={changePassword}
                        fields={changePasswordFields}
                        submitLabel="Update password"
                    />
                </Section>
            </div>
        </PortalPage>
    );
}
