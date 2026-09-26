"use client";

import { useEffect } from "react";
import { CloudOff, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

/** Friendly fallback for route error boundaries (error.tsx), e.g. when the database is down. */
export function ErrorState({
    error,
    retry,
}: {
    error: Error & { digest?: string };
    retry: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <Empty className="m-4 border sm:m-8">
            <EmptyHeader>
                <EmptyMedia variant="icon">
                    <CloudOff />
                </EmptyMedia>
                <EmptyTitle>Something went wrong</EmptyTitle>
                <EmptyDescription>
                    We couldn&apos;t load this page. Check your connection and try again in a
                    moment.
                    {error.digest && (
                        <span className="mt-1 block text-xs">Reference: {error.digest}</span>
                    )}
                </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
                <Button onClick={retry}>
                    <RotateCw /> Try again
                </Button>
            </EmptyContent>
        </Empty>
    );
}
