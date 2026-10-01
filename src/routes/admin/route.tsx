import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  KeyRound,
  LayoutDashboard,
  ScrollText,
  Bot,
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";

import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, logout, saveSession } from "@/lib/api-client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const items: NavItem[] = [
  { to: "/admin", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/admin/tenants", label: "Tenant", icon: Building2 },
  { to: "/admin/licenses", label: "Lisensi", icon: KeyRound },
  { to: "/admin/audit", label: "Catatan Aktivitas", icon: ScrollText },
];

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    try {
      const auth = sessionStorage.getItem("balasin_admin_auth");
      if (auth === "true") {
        setIsAuthenticated(true);
      } else {
        setShowLogin(true);
      }
    } catch {
      setShowLogin(true);
    }
  }, []);

  if (!isAuthenticated && showLogin) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  if (!isAuthenticated) return null;

  const handleLogout = () => {
    try {
      sessionStorage.removeItem("balasin_admin_auth");
    } catch {}
    try {
      logout();
    } catch {}
    setIsAuthenticated(false);
    setShowLogin(true);
  };

  const handleBackToHome = () => {
    try {
      sessionStorage.removeItem("balasin_admin_auth");
    } catch {}
  };

  return (
    <DashboardShell
      title="Balasin Admin"
      subtitle="Panel platform"
      items={items}
      onLogout={handleLogout}
      onBackToHome={handleBackToHome}
      footer={
        <div className="flex flex-col gap-2">
          <Link
            to="/app"
            className="group flex w-full items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/30 px-3 py-2.5 text-xs font-semibold text-emerald-100 transition-all duration-300 hover:border-emerald-400/80 hover:bg-emerald-900/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.4),0_0_10px_rgba(16,185,129,0.2)] hover:transform hover:translate-y-[-2px]"
          >
            <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Beralih ke tenant
            </span>
            <span className="transition-transform duration-300 ease-out group-hover:translate-x-1.5">
              →
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Keluar →
          </button>
        </div>
      }
    >
      <Outlet />
    </DashboardShell>
  );
}

import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Silakan masukkan username dan password");
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string; tenantId?: string }>("/auth/login", {
        method: "POST",
        body: { email: username.trim(), password: password.trim() },
        auth: false,
      });
      if (res?.accessToken) {
        saveSession(res.accessToken, "admin");
      }
      try {
        sessionStorage.setItem("balasin_admin_auth", "true");
      } catch {}
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Berhasil masuk sebagai Admin");
      onLogin();
    } catch (err: any) {
      toast.error(err?.message || "Username atau password admin tidak sesuai");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 font-sans transition-colors duration-200">
      {/* Top right Theme Toggle */}
      <div className="absolute top-5 right-5 z-20">
        <ThemeToggle />
      </div>

      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-teal-500/10 blur-[120px] [animation-delay:2s]" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out z-10">
        <div className="panel bg-card border-border/80 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="mb-4">
                <BrandLogo size="lg" badge="Admin" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Masuk ke Panel Admin
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Kredensial khusus administrator platform Balasin
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="username"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Admin"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-secondary/40 border-border pl-10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary/40 border-border pl-10 pr-10 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] mt-2"
              >
                {isLoading ? <Loader2 className="size-5 animate-spin" /> : "Masuk ke Panel Admin"}
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/60">
              <Link
                to="/"
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                ← Kembali ke Beranda
              </Link>
              <Link
                to="/app"
                className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
              >
                Dashboard Tenant →
              </Link>
            </div>
          </div>

          <div className="bg-secondary/40 py-3 px-8 border-t border-border/60 text-center">
            <p className="text-[11px] text-muted-foreground tracking-wider">
              Enkripsi Sesi Aktif • Balasin System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
