import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ActionForm } from "@/components/portal/action-form";
import { AuthCard } from "@/components/portal/ui";
import { signup } from "@/lib/auth/actions";
import { getCurrentUser } from "@/lib/auth/dal";
import { signupFields, signupProfileFields } from "@/lib/auth/fields";
import { studentOptions } from "@/lib/students/fields";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
    const user = await getCurrentUser().catch(() => null);
    if (user) redirect("/dashboard");
    return (
        <AuthCard
            title="Join ImpulseVidya"
            description="Send your details to your mentor. You can sign in once they approve your request."
        >
            <ActionForm
                action={signup}
                sections={[
                    { fields: signupFields },
                    {
                        title: "About your studies (optional)",
                        fields: signupProfileFields(studentOptions.targetExam),
                    },
                ]}
                submitLabel="Send request"
            >
                <Link href="/login" className="text-sm text-muted-foreground hover:text-primary">
                    Already have an account?
                </Link>
            </ActionForm>
        </AuthCard>
    );
}
