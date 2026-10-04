import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    default: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    warning: "text-warning bg-warning/10",
    danger: "text-destructive bg-destructive/10",
  }[tone];

  return (
    <div className="panel p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-sm hover:border-primary/30 group cursor-default">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {label}
        </p>
        <span
          className={cn(
            "flex size-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
            toneClass,
          )}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
