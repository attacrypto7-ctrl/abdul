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
      <aside className="sticky top-0 hidden h-[100vh] supports-[height:100dvh]:h-[100dvh] w-64 shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar px-4 py-3 md:flex dashboard-sidebar">
        {/* Brand Logo & Header */}
        <div className="mb-[clamp(8px,1.2vh,24px)] flex shrink-0 items-center justify-between px-2 py-[clamp(2px,0.6vh,8px)] dashboard-sidebar-header">
          <Link to="/" className="transition-opacity hover:opacity-90">
            <BrandLogo size="md" badge={title.includes("Admin") ? "Admin" : undefined} />
          </Link>
          <ThemeToggle size="sm" className="size-8" />
        </div>

        {googleUser ? (
          <div
            className="relative mb-[clamp(6px,1vh,24px)] shrink-0 rounded-xl border border-border/60 bg-card/60 p-2 shadow-xs dashboard-sidebar-profile"
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

        <nav className="flex min-h-0 flex-1 flex-col gap-[clamp(2px,0.6vh,8px)] overflow-y-auto overflow-x-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden dashboard-sidebar-nav">
          {items.map((item) => {
            const active =
              pathname === item.to ||
              (item.to !== "/admin" && item.to !== "/app" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-[clamp(4px,1.1vh,8px)] text-[clamp(12px,1.35vh,14px)] font-medium transition-all duration-200 dashboard-sidebar-item",
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

        <div className="mt-auto flex shrink-0 flex-col gap-[clamp(6px,0.8vh,10px)] pt-[clamp(6px,1vh,16px)] dashboard-sidebar-footer">
          <Link
            to="/"
            onClick={onBackToHome}
            className="group flex w-full items-center justify-between rounded-xl border border-blue-500/20 bg-blue-50/50 px-3 py-2.5 text-[11px] font-semibold text-blue-700 transition-all duration-300 hover:translate-y-[-1px] hover:border-blue-500/40 hover:bg-blue-100/50 hover:shadow-sm dark:border-blue-400/20 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/30 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2.5">
              <Home className="size-3.5 text-blue-600 transition-transform duration-300 ease-out group-hover:scale-110 dark:text-blue-400" />
              <span>Kembali ke beranda</span>
            </span>
            <span className="text-blue-500/60 transition-transform duration-300 ease-out group-hover:translate-x-0.5 dark:text-blue-400/60">
              ←
            </span>
          </Link>

          {footer ? <div className="border-t border-sidebar-border pt-2.5">{footer}</div> : null}
        </div>
      </aside>

      <style>{`@media (max-height: 800px){
  .dashboard-sidebar{padding-top:10px!important;padding-bottom:10px!important}
  .dashboard-sidebar-header{margin-bottom:6px!important}
  .dashboard-sidebar-profile{margin-bottom:8px!important;padding:6px!important}
  .dashboard-sidebar-nav{gap:2px!important}
  .dashboard-sidebar-item{padding-block:4px!important}
  .dashboard-sidebar-footer{padding-top:8px!important;gap:6px!important}
}
@media (max-height: 700px){
  .dashboard-sidebar{padding-top:8px!important;padding-bottom:8px!important}
  .dashboard-sidebar-header{margin-bottom:4px!important;padding-block:2px!important}
  .dashboard-sidebar-profile{margin-bottom:6px!important;padding:4px 6px!important}
  .dashboard-sidebar-nav{gap:1px!important}
  .dashboard-sidebar-item{padding-block:3px!important;font-size:12px!important}
  .dashboard-sidebar-footer{padding-top:6px!important;gap:4px!important}
}`}</style>
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
