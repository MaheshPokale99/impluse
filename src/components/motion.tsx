"use client";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
    const reduceMotion = useReducedMotion();

    useEffect(() => {
        let frame = 0;
        let originalScrollBehavior = "";

        const stopScroll = () => {
            if (frame) cancelAnimationFrame(frame);
            frame = 0;
            document.documentElement.style.scrollBehavior = originalScrollBehavior;
        };

        const scrollTo = (target: HTMLElement) => {
            stopScroll();
            const margin = Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
            const start = window.scrollY;
            const end = Math.max(0, target.getBoundingClientRect().top + start - margin);
            const distance = end - start;
            if (reduceMotion || Math.abs(distance) < 2) {
                window.scrollTo({ top: end, behavior: "instant" });
                return;
            }

            const duration = Math.min(1000, Math.max(650, Math.abs(distance) * 0.12));
            const startTime = performance.now();
            originalScrollBehavior = document.documentElement.style.scrollBehavior;
            document.documentElement.style.scrollBehavior = "auto";

            const step = (now: number) => {
                const progress = Math.min(1, (now - startTime) / duration);
                const eased = 1 - Math.pow(1 - progress, 4);
                window.scrollTo(0, start + distance * eased);
                if (progress < 1) frame = requestAnimationFrame(step);
                else {
                    frame = 0;
                    document.documentElement.style.scrollBehavior = originalScrollBehavior;
                }
            };

            frame = requestAnimationFrame(step);
        };

        const handleClick = (event: globalThis.MouseEvent) => {
            const clicked = event.target;
            if (!(clicked instanceof Element)) return;

            const tracked = clicked.closest<HTMLElement>("[data-track]");
            if (tracked) {
                window.dispatchEvent(
                    new CustomEvent("impulsevidya:conversion", {
                        detail: {
                            action: tracked.dataset.track,
                            href: tracked.getAttribute("href"),
                        },
                    }),
                );
            }

            const link = clicked.closest<HTMLAnchorElement>('a[href^="#"]');
            if (
                !link ||
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            )
                return;
            const id = decodeURIComponent(link.hash.slice(1));
            const target = document.getElementById(id);
            if (!target) return;

            event.preventDefault();
            window.history.pushState(null, "", link.hash);
            scrollTo(target);
        };

        const interruptScroll = () => stopScroll();
        document.addEventListener("click", handleClick);
        window.addEventListener("wheel", interruptScroll, { passive: true });
        window.addEventListener("touchstart", interruptScroll, { passive: true });
        window.addEventListener("keydown", interruptScroll);
        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("wheel", interruptScroll);
            window.removeEventListener("touchstart", interruptScroll);
            window.removeEventListener("keydown", interruptScroll);
            stopScroll();
        };
    }, [reduceMotion]);

    return (
        <MotionConfig
            reducedMotion="user"
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </MotionConfig>
    );
}

export function Reveal({ children }: { children: ReactNode }) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            initial={reduce ? false : { y: 26, opacity: 0 }}
            whileInView={reduce ? undefined : { y: 0, opacity: 1 }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, amount: 0.12 }}
        >
            {children}
        </motion.div>
    );
}
