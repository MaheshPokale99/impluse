import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/portal/action-form";
import { AuthCard } from "@/components/portal/ui";
import { login } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/dal";
import { loginFields } from "@/lib/auth/fields";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
    // With the database unreachable, still show the form; sign-in reports the problem itself.
    const user = await getCurrentUser().catch(() => null);
    if (user) redirect("/dashboard");
    return (
        <AuthCard title="Welcome back" description="Sign in to your ImpulseVidya workspace.">
            <ActionForm action={login} fields={loginFields} submitLabel="Sign in">
                <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary"
                >
                    Forgot password?
                </Link>
            </ActionForm>
            <p className="mt-6 border-t pt-4 text-center text-sm text-muted-foreground">
                New student?{" "}
                <Link href="/signup" className="font-medium text-primary hover:underline">
                    Request access
                </Link>
            </p>
        </AuthCard>
    );
}
