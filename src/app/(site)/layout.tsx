import { SiteShell } from "@/components/impulsevidya/shell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
    return <SiteShell>{children}</SiteShell>;
}
