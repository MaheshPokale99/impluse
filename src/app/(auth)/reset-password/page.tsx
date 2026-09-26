import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/portal/action-form";
import { AuthCard } from "@/components/portal/ui";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/lib/auth/actions";
import { accountFields } from "@/lib/auth/fields";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
    const { token } = await searchParams;
    if (typeof token !== "string" || !token) {
        return (
            <AuthCard
                title="This link is incomplete"
                description="Open the link from your email again, or request a new one."
            >
                <Button asChild variant="outline">
                    <Link href="/forgot-password">Request a new link</Link>
                </Button>
            </AuthCard>
        );
    }
    return (
        <AuthCard
            title="Set a new password"
            description="Choose a password you haven’t used here before."
        >
            <ActionForm
                action={resetPassword.bind(null, token)}
                fields={[{ ...accountFields.newPassword, label: "New password" }]}
                submitLabel="Save password"
            />
        </AuthCard>
    );
}
