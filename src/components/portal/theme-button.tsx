"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/impulsevidya/theme-toggle";

export function ThemeButton() {
    const { theme, toggleTheme } = useTheme("light");
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
        >
            {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
    );
}
