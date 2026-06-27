"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    >
      <Sun className="w-4 h-4 dark:hidden" />
      <Moon className="w-4 h-4 hidden dark:block" />
    </button>
  );
}
