import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "muted";

const toneMap: Record<Tone, string> = {
  success: "bg-success/12 text-success border-success/30",
  warning: "bg-warning/12 text-warning border-warning/30",
  danger: "bg-destructive/12 text-destructive border-destructive/30",
  info: "bg-info/12 text-info border-info/30",
  muted: "bg-muted text-muted-foreground border-border",
};

export function StatusPill({ label, tone = "muted" }: { label: string; tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        toneMap[tone],
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function toneForLicense(status: string): Tone {
  if (status === "aktif") return "success";
  if (status === "expired") return "warning";
  if (status === "revoked") return "danger";
  return "muted";
}

export function toneForWa(status: string): Tone {
  if (status === "tersambung") return "success";
  if (status === "memindai") return "info";
  return "danger";
}

export function toneForTenant(status: string): Tone {
  if (status === "aktif") return "success";
  if (status === "suspend") return "danger";
  return "muted";
}

