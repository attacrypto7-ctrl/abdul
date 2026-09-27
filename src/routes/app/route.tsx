import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  BarChart3,
  FlaskConical,
  KeyRound,
  LayoutDashboard,
  Library,
  MessageSquare,
  MessagesSquare,
  Megaphone,
  Smartphone,
  Users,
  Settings,
} from "lucide-react";

import { DashboardShell, type NavItem } from "@/components/dashboard/shell";
import { getGoogleUser } from "@/lib/google-auth";
import { getToken } from "@/lib/api-client";

const items: NavItem[] = [
  { to: "/app", label: "Ringkasan", icon: LayoutDashboard },
  { to: "/app/whatsapp", label: "Koneksi WhatsApp", icon: Smartphone },
  { to: "/app/pengelolaan-nomor", label: "Pengelolaan Nomor", icon: Users },
  { to: "/app/pengetahuan", label: "Basis Pengetahuan", icon: Library },
  { to: "/app/balas-chat", label: "Balas Chat Otomatis", icon: MessageSquare },
  { to: "/app/balas-iklan", label: "Balas Iklan Otomatis", icon: Megaphone },
  { to: "/app/percakapan", label: "Riwayat Chat", icon: MessagesSquare },
  { to: "/app/uji-coba", label: "Uji Coba Bot", icon: FlaskConical },
  { to: "/app/analitik", label: "Analitik", icon: BarChart3 },
  { to: "/app/lisensi", label: "Lisensi", icon: KeyRound },
  { to: "/app/pengaturan", label: "Pengaturan", icon: Settings },
];

export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    try {
      if (!getGoogleUser() && !getToken()) {
        throw redirect({ to: "/" });
      }
    } catch (e) {
      if (e && typeof e === "object" && "statusCode" in e) throw e;
      return;
    }
  },
  component: TenantLayout,
});

function TenantLayout() {
  return <DashboardShell title="Balasin" subtitle="Dashboard Tenant" items={items} />;
}
