import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderNotifications } from "./unread-context";

/** The ImpulseVidya logo (public/Logo.png). Decorative: it always sits next to the name. */
export function Logo({ className }: { className?: string }) {
    return (
        <Image
            src="/Logo.png"
            alt=""
            width={36}
            height={36}
            preload
            className={cn("size-9 shrink-0 object-contain", className)}
        />
    );
}

export type Crumb = { label: string; href?: string };

export function PortalPage({
    crumbs,
    icon,
    title,
    description,
    actions,
    children,
}: {
    crumbs: Crumb[];
    icon: ReactNode;
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
    children: ReactNode;
}) {
    return (
        <>
            <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur">
                <SidebarTrigger />
                <Separator
                    orientation="vertical"
                    className="mr-1 data-vertical:h-4 data-vertical:self-center"
                />
                <Breadcrumb className="min-w-0 flex-1">
                    <BreadcrumbList className="flex-nowrap">
                        {crumbs.map((crumb, index) => (
                            <Fragment key={crumb.label}>
                                {index > 0 && <BreadcrumbSeparator />}
                                <BreadcrumbItem className="min-w-0">
                                    {crumb.href ? (
                                        <BreadcrumbLink asChild>
                                            <Link prefetch={false} href={crumb.href}>
                                                {crumb.label}
                                            </Link>
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage className="truncate">
                                            {crumb.label}
                                        </BreadcrumbPage>
                                    )}
                                </BreadcrumbItem>
                            </Fragment>
                        ))}
                    </BreadcrumbList>
                </Breadcrumb>
                <HeaderNotifications />
            </header>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3 sm:flex-col sm:items-start">
                        {icon}
                        <div className="flex min-w-0 flex-col gap-0.5 sm:gap-1">
                            <h1 className="text-xl font-bold tracking-tight break-words sm:text-3xl">
                                {title}
                            </h1>
                            {description && (
                                <div className="text-sm break-words text-muted-foreground">
                                    {description}
                                </div>
                            )}
                        </div>
                    </div>
                    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
                </div>
                {children}
            </div>
        </>
    );
}

/** A page icon block, like the icon above a document title. */
export function PageIcon({ icon: Icon }: { icon: LucideIcon }) {
    return (
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground sm:size-11">
            <Icon className="size-4 sm:size-5" aria-hidden />
        </span>
    );
}

/** A titled block of the page body: heading row (with optional action), then content. */
export function Section({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="flex flex-col gap-2.5">
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-base font-semibold">{title}</h2>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                </div>
                {action}
            </div>
            {children}
        </section>
    );
}

/** A compact row of headline numbers with icons, instead of a grid of cards. */
export function Summary({
    items,
}: {
    items: { icon: LucideIcon; label: string; value: ReactNode; tone?: "bad" }[];
}) {
    return (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 border-y py-2.5 text-sm min-[360px]:grid-cols-3 sm:flex sm:flex-wrap sm:gap-x-8">
            {items.map(({ icon: Icon, label, value, tone }) => (
                <div
                    key={label}
                    className="grid min-w-0 grid-cols-[auto_1fr] items-center gap-x-2 sm:flex"
                >
                    <Icon
                        className="row-span-2 size-4 text-muted-foreground sm:row-span-1"
                        aria-hidden
                    />
                    <dt className="truncate text-xs text-muted-foreground sm:text-sm">{label}</dt>
                    <dd
                        className={cn(
                            "font-medium tabular-nums",
                            tone === "bad" && "text-destructive",
                        )}
                    >
                        {value}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function AuthCard({
    title,
    description,
    children,
}: {
    title: string;
    description?: ReactNode;
    children: ReactNode;
}) {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}
