import { Skeleton } from "@/components/ui/skeleton";

/** Shown instantly while a dashboard page loads, in the same shape as the page. */
export default function DashboardLoading() {
    return (
        <div aria-busy="true" aria-label="Loading">
            <div className="h-12 border-b" />
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-8 sm:py-10">
                <div className="flex flex-col gap-3">
                    <Skeleton className="size-11 rounded-lg" />
                    <Skeleton className="h-8 w-56" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <Skeleton className="h-11 w-full" />
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 6 }, (_, index) => (
                        <Skeleton key={index} className="h-9 w-full" />
                    ))}
                </div>
            </div>
        </div>
    );
}
