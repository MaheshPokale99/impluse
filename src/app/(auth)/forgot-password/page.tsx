import type { Metadata } from "next";
import Link from "next/link";
import { ActionForm } from "@/components/portal/action-form";
import { AuthCard } from "@/components/portal/ui";
import { requestPasswordReset } from "@/lib/auth/actions";
import { accountFields } from "@/lib/auth/fields";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
    return (
        <AuthCard
            title="Forgot your password?"
            description="Enter your account email and we’ll send you a link to set a new one."
        >
            <ActionForm
                action={requestPasswordReset}
                fields={[accountFields.email]}
                submitLabel="Send reset link"
            >
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                    Back to sign in
                </Link>
            </ActionForm>
        </AuthCard>
    );
}
