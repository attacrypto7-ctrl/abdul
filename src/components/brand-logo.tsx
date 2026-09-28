import React from "react";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  badge?: string;
}

export function BrandLogo({
  className,
  size = "md",
  showText = true,
  badge,
}: BrandLogoProps) {
  const iconSizes = {
    sm: "size-7",
    md: "size-9",
    lg: "size-11",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Brand Icon */}
      <img
        src="/chatbot_wa.png"
        alt="Balasin"
        className={cn("shrink-0 rounded-xl object-contain", iconSizes[size])}
      />

      {showText && (
        <div className="flex items-center gap-1.5 leading-none">
          <span className={cn("font-bold tracking-tight text-foreground", textSizes[size])}>
            Balas<span className="text-emerald-500">in</span>
          </span>
          {badge && (
            <span className="rounded-md border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
