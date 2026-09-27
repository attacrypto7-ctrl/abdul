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
      {/* Balasin Modern Brand Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 transition-transform duration-200 hover:scale-105",
          iconSizes[size],
        )}
      >
        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-background/10 backdrop-blur-xs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-[65%] text-white"
          >
            {/* Smooth Chat Bubble Shape with AI Neural Spark */}
            <path
              d="M12 2C6.477 2 2 6.029 2 11c0 2.298.968 4.398 2.585 5.965L3.38 20.35a.8.8 0 0 0 1.05.992l3.774-1.51A10.74 10.74 0 0 0 12 20c5.523 0 10-4.029 10-9s-4.477-9-10-9Z"
              fill="currentColor"
              fillOpacity="0.9"
            />
            {/* Glowing AI Spark inside */}
            <path
              d="M12 6.5l1.05 2.45L15.5 10l-2.45 1.05L12 13.5l-1.05-2.45L8.5 10l2.45-1.05L12 6.5Z"
              fill="#ecfdf5"
            />
            <circle cx="16" cy="7.5" r="1" fill="#a7f3d0" />
            <circle cx="8" cy="12.5" r="0.8" fill="#a7f3d0" />
          </svg>
        </div>
      </div>

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
