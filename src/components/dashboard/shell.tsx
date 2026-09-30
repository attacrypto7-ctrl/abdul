import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, Home, LogOut, UserPlus } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { getGoogleUser, handleLogout, GoogleUser } from "@/lib/google-auth";
import { API_BASE } from "@/lib/api-client";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

interface ShellProps {
  title: string;
  subtitle: string;
  items: NavItem[];
  footer?: ReactNode;
  onLogout?: () => void;
  onBackToHome?: () => void;
}

export function DashboardShell({
  title,
  subtitle,
  items,
  footer,
  onLogout,
  onBackToHome,
}: ShellProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [backRipples, setBackRipples] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const backRippleId = useRef(0);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      setGoogleUser(getGoogleUser());
      setImgError(false);
    };
    sync();
    window.addEventListener("balasin:auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("balasin:auth-changed", sync);
      window.removeEventListener("storage", sync);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setImgError(false);
  }, [googleUser?.avatarUrl, googleUser?.picture]);

  const handleLogoutClick = () => {
    handleLogout();
    setGoogleUser(null);
    if (onLogout) onLogout();
  };

  const avatarSrc = googleUser?.avatarUrl || googleUser?.picture || null;
  const initials = googleUser
    ? googleUser.name
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") || "?"
    : "?";

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      <aside className="sticky top-0 hidden h-[100vh] supports-[height:100dvh]:h-[100dvh] w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar px-4 py-4 md:flex">
        {/* Brand Logo & Header */}
        <div className="mb-4 flex shrink-0 items-center justify-between px-2">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <BrandLogo size="md" badge={title.includes("Admin") ? "Admin" : undefined} />
          </Link>
          <ThemeToggle size="sm" className="size-8" />
        </div>

        {googleUser ? (
          <div
            className="relative mb-4 shrink-0 rounded-xl border border-border/60 bg-card/60 p-2 shadow-xs"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="flex w-full cursor-pointer items-center gap-2.5 text-left transition-opacity hover:opacity-85 focus-visible:outline-none">
              <span className="relative shrink-0">
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt="Google Profile"
                    referrerPolicy="no-referrer"
                    onError={() => setImgError(true)}
                    className="w-9 h-9 rounded-full object-cover border border-emerald-500/40"
                  />
                ) : (
                  <span className="flex w-9 h-9 rounded-full items-center justify-center border border-emerald-500/40 bg-emerald-500/15 text-xs font-bold text-emerald-600 dark:text-emerald-300">
                    {initials}
                  </span>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 border-2 border-background" />
              </span>
              <span className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-xs font-semibold text-foreground">
                  {googleUser.name}
                </span>
                <span className="block truncate text-[11px] text-muted-foreground max-w-[120px]">
                  {googleUser.email}
                </span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
            </button>
            {isOpen && (
              <div className="absolute top-full left-0 pt-2 z-50">
                <div className="w-64 rounded-md border bg-popover p-1 shadow-md">
                  <div className="px-2 py-2">
                    <p className="text-sm font-semibold leading-none">{googleUser.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{googleUser.email}</p>
                  </div>
                  <div className="-mx-1 my-1 h-px bg-muted" />
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      const origin = encodeURIComponent(window.location.origin);
                      window.location.href = `${API_BASE}/auth/google?origin=${origin}`;
                    }}
                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    <UserPlus className="size-4" />
                    Tambahkan akun lain
                  </button>
                  <button
                    onClick={handleLogoutClick}
                    className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent text-red-600 focus:text-red-600 hover:text-red-600"
                  >
                    <LogOut className="size-4" />
                    Log Out / Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <nav className="flex flex-1 flex-col justify-between gap-1.5 min-h-0 overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== "/admin" && item.to !== "/app" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex flex-1 min-h-[34px] max-h-[52px] items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground hover:translate-x-1",
                )}
              >
                <item.icon className={cn("size-4 transition-transform duration-200 group-hover:scale-110", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex shrink-0 flex-col gap-2.5 pt-3">
          <Link
            to="/"
            onClick={onBackToHome}
            onPointerDown={(e) => {
              const el = e.currentTarget as HTMLElement;
              const r = el.getBoundingClientRect();
              const x = e.clientX - r.left;
              const y = e.clientY - r.top;
              const size = Math.max(r.width, r.height) * 2.2;
              const id = ++backRippleId.current;
              setBackRipples((p) => [...p, { id, x, y, size }]);
            }}
            className="sidebar-back-glow group flex w-full items-center justify-between rounded-xl border border-blue-500/20 bg-blue-50/50 px-3 py-2.5 text-[11px] font-semibold text-blue-700 dark:border-blue-400/20 dark:bg-blue-900/20 dark:text-blue-300"
          >
            <span className="relative z-[1] flex items-center gap-2.5">
              <Home className="size-3.5 text-blue-600 transition-transform duration-300 ease-out group-hover:scale-110 dark:text-blue-400" />
              <span>Kembali ke beranda</span>
            </span>
            <span className="sidebar-back-arrow relative z-[1] text-blue-500/60 transition-transform duration-300 ease-out group-hover:translate-x-0.5 dark:text-blue-400/60">
              ←
            </span>
            {backRipples.map((rp) => (
              <span
                key={rp.id}
                className="sidebar-back-ripple"
                style={{ left: rp.x, top: rp.y, width: rp.size, height: rp.size }}
                onAnimationEnd={() => setBackRipples((p) => p.filter((v) => v.id !== rp.id))}
              />
            ))}
          </Link>

          {footer ? <div className="border-t border-sidebar-border pt-2.5">{footer}</div> : null}
        </div>
      </aside>

      <style>{`@media (max-height: 650px) {
  aside nav > a { min-height: 30px !important; }
}
.sidebar-back-glow{position:relative;overflow:hidden;border-radius:0.75rem;isolation:isolate;-webkit-tap-highlight-color:transparent;user-select:none;transform:scale(1);transition:transform 200ms cubic-bezier(.34,1.2,.64,1),border-color 300ms cubic-bezier(.4,0,.2,1),box-shadow 300ms cubic-bezier(.4,0,.2,1),color 300ms cubic-bezier(.4,0,.2,1),text-shadow 300ms cubic-bezier(.4,0,.2,1),filter 200ms cubic-bezier(.4,0,.2,1)}
.sidebar-back-glow::after{content:"";position:absolute;top:-50%;left:-85%;width:34%;height:200%;background:linear-gradient(105deg,transparent 0%,transparent 42%,rgba(255,255,255,.32) 50%,transparent 58%,transparent 100%);transform:skewX(-16deg);opacity:0;pointer-events:none;z-index:0;border-radius:inherit}
@media (hover: hover){
  .sidebar-back-glow:hover{border-color:rgba(125,211,252,.70)!important;color:#0ea5e9!important;text-shadow:0 0 8px rgba(125,211,252,.45);box-shadow:0 0 0 1px rgba(125,211,252,.55),0 0 12px rgba(56,189,248,.45),0 0 28px rgba(56,189,248,.30),0 0 56px rgba(56,189,248,.18),inset 0 0 14px rgba(125,211,252,.12)!important;animation:sidebar-back-glow-pulse 1.8s ease-in-out infinite}
  .dark .sidebar-back-glow:hover{border-color:rgba(125,211,252,.75)!important;box-shadow:0 0 0 1px rgba(125,211,252,.65),0 0 14px rgba(56,189,248,.55),0 0 32px rgba(56,189,248,.38),0 0 64px rgba(56,189,248,.24),inset 0 0 16px rgba(125,211,252,.16)!important;text-shadow:0 0 10px rgba(125,211,252,.55)}
  .sidebar-back-glow:hover::after{animation:sidebar-back-glow-shimmer 620ms cubic-bezier(.4,0,.2,1) forwards;animation-delay:0s}
}
.sidebar-back-glow:focus{outline:none}
.sidebar-back-glow:focus-visible{outline:2px solid rgba(125,211,252,.9);outline-offset:2px;border-color:rgba(125,211,252,.70)!important;box-shadow:0 0 0 1px rgba(125,211,252,.55),0 0 12px rgba(56,189,248,.45),0 0 28px rgba(56,189,248,.30),0 0 56px rgba(56,189,248,.18),inset 0 0 14px rgba(125,211,252,.12)!important}
.sidebar-back-glow:focus:not(:focus-visible){outline:none}
.sidebar-back-glow:active{transform:scale(0.97);transition:transform 100ms cubic-bezier(.4,0,.2,1),border-color 100ms cubic-bezier(.4,0,.2,1),box-shadow 100ms cubic-bezier(.4,0,.2,1),filter 100ms cubic-bezier(.4,0,.2,1);border-color:rgba(125,211,252,.85)!important;box-shadow:0 0 0 1px rgba(125,211,252,.80),0 0 10px rgba(56,189,248,.60),0 0 20px rgba(56,189,248,.45),inset 0 0 10px rgba(125,211,252,.18)!important;filter:brightness(1.06)}
.sidebar-back-glow:active .sidebar-back-arrow{transform:translateX(-4px)}
.sidebar-back-ripple{position:absolute;border-radius:9999px;background:rgba(125,211,252,.28);pointer-events:none;z-index:0;transform:translate(-50%,-50%) scale(0);opacity:.9;animation:sidebar-back-ripple 550ms ease-out forwards}
.dark .sidebar-back-ripple{background:rgba(125,211,252,.35)}
.sidebar-back-glow:disabled,.sidebar-back-glow[aria-disabled="true"]{cursor:not-allowed;transform:none!important;animation:none!important;filter:none!important;pointer-events:none}
.sidebar-back-glow:disabled::after,.sidebar-back-glow[aria-disabled="true"]::after{display:none!important}
@keyframes sidebar-back-glow-pulse{0%,100%{box-shadow:0 0 0 1px rgba(125,211,252,.55),0 0 12px rgba(56,189,248,.45),0 0 28px rgba(56,189,248,.30),0 0 56px rgba(56,189,248,.18),inset 0 0 14px rgba(125,211,252,.12)}50%{box-shadow:0 0 0 1px rgba(125,211,252,.72),0 0 16px rgba(56,189,248,.60),0 0 36px rgba(56,189,248,.42),0 0 68px rgba(56,189,248,.26),inset 0 0 18px rgba(125,211,252,.18)}}
@keyframes sidebar-back-glow-shimmer{0%{left:-85%;opacity:0}18%{opacity:1}100%{left:135%;opacity:0}}
@keyframes sidebar-back-ripple{0%{transform:translate(-50%,-50%) scale(0);opacity:.9}100%{transform:translate(-50%,-50%) scale(1);opacity:0}}
@media (prefers-reduced-motion: reduce){.sidebar-back-glow,.sidebar-back-glow:hover,.sidebar-back-glow:focus-visible,.sidebar-back-glow:active{animation:none!important;transition:none!important;transform:none!important}.sidebar-back-glow::after{display:none!important}.sidebar-back-ripple{display:none!important}.sidebar-back-glow:hover,.sidebar-back-glow:focus-visible{box-shadow:0 0 0 1px rgba(125,211,252,.55),0 0 12px rgba(56,189,248,.45),0 0 28px rgba(56,189,248,.30),0 0 56px rgba(56,189,248,.18),inset 0 0 14px rgba(125,211,252,.12)!important}.sidebar-back-glow:focus-visible{outline:2px solid rgba(125,211,252,.9);outline-offset:2px}}
`}</style>

      <div className="min-w-0 flex-1">
        {/* Mobile top header bar */}
        <div className="flex items-center justify-between border-b border-border bg-sidebar px-4 py-2.5 md:hidden">
          <Link to="/">
            <BrandLogo size="sm" badge={title.includes("Admin") ? "Admin" : undefined} />
          </Link>
          <ThemeToggle size="sm" className="size-8" />
        </div>

        {/* Mobile horizontal nav */}
        <div className="flex gap-1 overflow-x-auto border-b border-border bg-sidebar px-3 py-2 md:hidden">
          {items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-semibold" }}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </Link>
          ))}
        </div>
        <main className="surface-grid min-h-screen px-5 py-8 md:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </header>
  );
}
