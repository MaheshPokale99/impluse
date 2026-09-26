import type { Metadata } from "next";
import Link from "next/link";
import { ThemeButton } from "@/components/portal/theme-button";
import { Logo } from "@/components/portal/ui";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted px-4 py-10 text-foreground">
            <div className="flex w-full max-w-sm items-center justify-between">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <Logo />
                    ImpulseVidya
                </Link>
                <ThemeButton />
            </div>
            {children}
        </main>
    );
}
