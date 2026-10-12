import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function useTheme() {
  const getInitialTheme = (): "light" | "dark" => {
    try {
      return localStorage.getItem("balasin_theme") === "dark"
        ? "dark"
        : "light";
    } catch {
      return "light";
    }
  };

  const applyThemeSync = (newTheme: "light" | "dark") => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleThemeState = (value: "light" | "dark") => {
    try {
      localStorage.setItem("balasin_theme", value);
    } catch {}
    applyThemeSync(value);
  };

  const [theme] = useState<"light" | "dark">(getInitialTheme());

  useEffect(() => {
    applyThemeSync(theme);
    // Sync CSS custom properties immediately so opaque colour tokens
    // (e.g. Tailwind v4 / Vite) pick up the new palette without a layout
    // pause. Using startViewTransition keeps it non-blocking when the
    // browser supports it; falls back to a direct synchronous update.
    if (
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function"
    ) {
      const handle = () => document.documentElement.classList.toggle(
        "dark",
        theme === "dark",
      );
      document.startViewTransition(handle).finished.catch(() => {});
    } else {
      document.documentElement.classList.toggle(
        "dark",
        theme === "dark",
      );
    }
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === "light" ? ("dark" as const) : ("light" as const);
    toggleThemeState(next);
  };

  return { theme, toggleTheme, isDark: theme === "dark" };
}

interface ThemeToggleProps {
  className?: string;
  variant?: "outline" | "ghost" | "default";
  size?: "sm" | "default" | "icon";
}

export function ThemeToggle({
  className,
  variant = "outline",
  size = "icon",
}: ThemeToggleProps) {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={cn(
        "relative rounded-xl border border-border/80 bg-card text-foreground transition-all duration-300 hover:border-emerald-500/50 hover:bg-secondary/60 hover:text-emerald-500",
        className,
      )}
      title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
    >
      <Sun
        className={cn(
          "size-4 transition-all duration-300",
          isDark
            ? "rotate-0 scale-100 text-amber-400"
            : "-rotate-90 scale-0 text-muted-foreground",
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 transition-all duration-300",
          isDark
            ? "rotate-90 scale-0 text-muted-foreground"
            : "rotate-0 scale-100 text-slate-700 dark:text-slate-200",
        )}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
