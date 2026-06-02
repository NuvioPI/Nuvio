"use client";
import { useTheme } from "next-themes";

import { Sun } from "@/components/animate-ui/icons/sun";
import { Moon } from "@/components/animate-ui/icons/moon";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";

export  function Toggle() {
    const { theme, setTheme } = useTheme();
    const isDark = theme === "dark";

    return (
        <AnimateIcon animateOnHover>
            <button className="cursor-pointer"
            onClick={() => setTheme(isDark ? "light" : "dark")}>
                {isDark ? <Sun /> : <Moon />}
            </button>
        </AnimateIcon>
    );
}