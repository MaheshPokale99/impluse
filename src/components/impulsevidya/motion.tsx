"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

export const gentleEase = [0.22, 1, 0.36, 1] as const;

export function SmoothScroll() {
    const pathname = usePathname();
    const reduced = useReducedMotion();

    useEffect(() => {
        if (reduced) return;
        const lenis = new Lenis({
            autoRaf: true,
            lerp: 0.1,
            smoothWheel: true,
            syncTouch: false,
            anchors: false,
            prevent: (node) => node.hasAttribute("data-lenis-prevent"),
            virtualScroll: () => document.body.style.overflow !== "hidden",
        });

        const handleAnchorClick = (event: MouseEvent) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey ||
                !(event.target instanceof Element)
            ) {
                return;
            }

            const link = event.target.closest<HTMLAnchorElement>("a[href]");
            if (
                !link ||
                (link.target && link.target !== "_self") ||
                link.hasAttribute("download") ||
                link.classList.contains("iv-skip-link")
            ) {
                return;
            }

            const destination = new URL(link.href, window.location.href);
            const current = new URL(window.location.href);
            if (
                destination.origin !== current.origin ||
                destination.pathname !== current.pathname ||
                destination.search !== current.search ||
                !destination.hash
            ) {
                return;
            }

            let targetId: string;
            try {
                targetId = decodeURIComponent(destination.hash.slice(1));
            } catch {
                return;
            }

            const target = targetId ? document.getElementById(targetId) : document.documentElement;
            if (!target) return;

            event.preventDefault();
            if (destination.hash !== current.hash) {
                window.history.pushState(null, "", destination.hash);
            }
            lenis.scrollTo(target, { offset: -96 });
        };

        const handlePopState = () => {
            const hash = window.location.hash;
            if (!hash) {
                lenis.scrollTo(0);
                return;
            }

            let targetId: string;
            try {
                targetId = decodeURIComponent(hash.slice(1));
            } catch {
                return;
            }

            const target = targetId ? document.getElementById(targetId) : document.documentElement;
            if (target) lenis.scrollTo(target, { offset: -96 });
        };

        const toTop = () => lenis.scrollTo(0, { duration: 1.1 });
        document.addEventListener("click", handleAnchorClick, true);
        window.addEventListener("popstate", handlePopState);
        window.addEventListener("impulsevidya:top", toTop);
        return () => {
            document.removeEventListener("click", handleAnchorClick, true);
            window.removeEventListener("popstate", handlePopState);
            window.removeEventListener("impulsevidya:top", toTop);
            lenis.destroy();
        };
    }, [pathname, reduced]);

    return null;
}

export function ScrollScene({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();
    const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
    const progress = useSpring(scrollYProgress, { stiffness: 100, damping: 28 });
    const y = useTransform(progress, [0, 1], [22, -22]);
    return (
        <div ref={ref} className={`iv-scroll-scene ${className}`}>
            <motion.div style={{ y: reduced ? 0 : y }}>{children}</motion.div>
        </div>
    );
}
