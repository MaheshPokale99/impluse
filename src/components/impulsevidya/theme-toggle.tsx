"use client";

import { useEffect, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { gentleEase } from "./motion";

type Theme = "light" | "dark";

const themeChangeEvent = "impulsevidya-theme-change";
const subscribeToTheme = (callback: () => void) => {
    window.addEventListener(themeChangeEvent, callback);
    return () => window.removeEventListener(themeChangeEvent, callback);
};
const readTheme = (): Theme | undefined => {
    const theme = document.documentElement.dataset.theme;
    return theme === "light" || theme === "dark" ? theme : undefined;
};

function applyTheme(theme: Theme) {
    document.documentElement.dataset.theme = theme;
    window.dispatchEvent(new Event(themeChangeEvent));
}

export function useTheme(fallback: Theme = "dark") {
    const theme = useSyncExternalStore(
        subscribeToTheme,
        () => readTheme() ?? fallback,
        () => fallback,
    );
    useEffect(() => {
        let savedTheme: string | null = null;
        try {
            savedTheme = window.localStorage.getItem("impulsevidya-theme");
            if (savedTheme === null) {
                savedTheme = window.localStorage.getItem("impusevidya-theme");
                if (savedTheme) window.localStorage.setItem("impulsevidya-theme", savedTheme);
            }
        } catch {
            /* Storage can be disabled by the browser. */
        }
        applyTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : fallback);
    }, [fallback]);
    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        applyTheme(nextTheme);
        try {
            window.localStorage.setItem("impulsevidya-theme", nextTheme);
        } catch {
            /* Keep the switch usable without storage. */
        }
    };
    return { theme, toggleTheme };
}

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            type="button"
            className="iv-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            aria-pressed={theme === "light"}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    className="iv-theme-glyph"
                    aria-hidden="true"
                    initial={{ opacity: 0, rotate: -35, scale: 0.72 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 35, scale: 0.72 }}
                    transition={{ duration: 0.2, ease: gentleEase }}
                >
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}
