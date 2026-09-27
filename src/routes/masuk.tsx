import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Bot, LogIn } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { getToken, getRole, login } from "@/lib/api-client";

export const Route = createFileRoute("/masuk")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getToken()) {
      const role = getRole();
      throw redirect({ to: role === "admin" ? "/admin" : "/app" });
    }
  },
  component: MasukPage,
});

function MasukPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sibuk, setSibuk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Masukkan email terlebih dahulu");
      return;
    }
    setSibuk(true);
    try {
      const res = await login(email.trim(), password);
      toast.success("Berhasil masuk");
      navigate({ to: res.tenantId ? "/app" : "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <>
      <AmbientBackground />
      <div className="surface-grid flex min-h-screen items-center justify-center px-6">
        <div className="panel w-full max-w-sm space-y-6 p-8">
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="text-base font-bold">Balasin</p>
              <p className="text-xs text-muted-foreground">Masuk ke dashboard</p>
            </div>
          </div>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@bisnis.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Kata sandi</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">
                Akun tenant dibuat saat pendaftaran; akun admin dibuat lewat seed database.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={sibuk}>
              <LogIn className="size-4" /> {sibuk ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">
              ← Kembali ke beranda
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
