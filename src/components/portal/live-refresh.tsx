"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_EVERY_MS = 60_000;
const MIN_GAP_MS = 15_000;

export function LiveRefresh() {
    const router = useRouter();
    useEffect(() => {
        let last = Date.now();
        const refresh = () => {
            if (document.visibilityState !== "visible" || Date.now() - last < MIN_GAP_MS) return;
            last = Date.now();
            router.refresh();
        };
        const timer = window.setInterval(refresh, REFRESH_EVERY_MS);
        document.addEventListener("visibilitychange", refresh);
        window.addEventListener("focus", refresh);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", refresh);
            window.removeEventListener("focus", refresh);
        };
    }, [router]);
    return null;
}
