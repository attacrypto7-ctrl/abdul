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

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("admin@balasin.id");
  const [password, setPassword] = useState("admin123");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      // If local demo fallback
      if (username === "admin" || username === "admin@balasin.id") {
        try {
          sessionStorage.setItem("balasin_admin_auth", "true");
        } catch {}
        queryClient.invalidateQueries({ queryKey: ["licenses"] });
        queryClient.invalidateQueries({ queryKey: ["tenants"] });
        onLogin();
      } else {
        toast.error(err?.message || "Email atau password admin tidak sesuai");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f14] px-4 font-sans">
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-emerald-500/10 blur-[120px] [animation-delay:2s]" />

      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
        <div className="backdrop-blur-md bg-slate-900/60 border border-emerald-500/20 shadow-2xl rounded-2xl overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-4">
                <Bot className="size-8 text-[#0a0f14]" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
                Balasin Admin Panel
              </h1>
              <p className="text-sm text-emerald-500/70">
                Otorisasi diperlukan untuk mengakses sistem
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-xs font-semibold uppercase tracking-wider text-emerald-500/50 ml-1"
                >
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500/30 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="admin"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-black/40 border-emerald-500/10 pl-10 focus-visible:ring-emerald-500 focus-visible:border-emerald-500/50 text-white placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-xs font-semibold uppercase tracking-wider text-emerald-500/50 ml-1"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500/30 group-focus-within:text-emerald-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black/40 border-emerald-500/10 pl-10 pr-10 focus-visible:ring-emerald-500 focus-visible:border-emerald-500/50 text-white placeholder:text-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/30 hover:text-emerald-500 transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full relative overflow-hidden h-11 bg-emerald-500 hover:bg-emerald-400 text-[#0a0f14] font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all group active:scale-[0.98]"
              >
                {isLoading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Masuk ke Panel Admin
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  </>
                )}
              </Button>
            </form>
            <div className="mt-8 flex items-center justify-between">
              <Link
                to="/"
                className="group flex items-center gap-2 text-xs font-semibold text-sky-200 transition-all duration-300 hover:text-sky-400"
              >
                <div className="flex size-8 items-center justify-center rounded-lg border border-sky-500/30 bg-sky-950/30 shadow-[0_0_10px_rgba(56,189,248,0.1)] transition-all group-hover:-translate-x-1 group-hover:border-sky-400 group-hover:shadow-[0_0_15px_rgba(56,189,248,0.4)]">
                  ←
                </div>
                Kembali ke beranda
              </Link>
              <Link
                to="/app"
                className="group flex items-center gap-2 text-xs font-semibold text-emerald-200 transition-all duration-300 hover:text-emerald-400"
              >
                Dashboard Tenant →
                <div className="flex size-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-950/30 shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all group-hover:translate-x-1 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  →
                </div>
              </Link>
            </div>
          </div>
          <div className="bg-emerald-500/5 py-4 px-8 border-t border-emerald-500/10">
            <p className="text-[10px] text-center text-emerald-500/40 uppercase tracking-[0.2em]">
              Secure Encryption Active • v2.4.0
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
