import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function useTheme() {
  const [theme, setThemeState] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("balasin_theme");
      if (saved === "dark") {
        setThemeState("dark");
        document.documentElement.classList.add("dark");
      } else {
        setThemeState("light");
        document.documentElement.classList.remove("dark");
      }
    } catch {
      setThemeState("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("balasin_theme", newTheme);
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return { theme, setTheme, toggleTheme, isDark: theme === "dark" };
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
