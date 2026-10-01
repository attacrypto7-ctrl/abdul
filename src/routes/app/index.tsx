import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  MessagesSquare,
  ShieldQuestion,
  Smartphone,
  Zap,
  MessageSquare,
  Power,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Building2,
  ShoppingBag,
  Briefcase,
  HeartHandshake,
  Stethoscope,
  GraduationCap,
  Sliders,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPill, toneForWa } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import {
  formatNumber,
  daysLeft,
  getChatLogs,
  getLicenseStatus,
  getWaNumbers,
  getTenantMe,
  getTenantReadinessScore,
} from "@/mock/api";
import { toggleWaAuto } from "@/lib/api-client";
import { BusinessTypeModal } from "@/components/business-type-modal";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Ringkasan Bot — Dashboard Balasin" },
      {
        name: "description",
        content: "Status bot WhatsApp, kendali balas otomatis, skor kesiapan AI, dan klasifikasi bisnis.",
      },
      { property: "og:title", content: "Ringkasan Bot — Dashboard Balasin" },
      { property: "og:description", content: "Status bot WhatsApp dan kendali balas otomatis." },
    ],
  }),
  component: TenantOverview,
});

function getBusinessTypeIcon(type?: string) {
  if (!type) return Building2;
  if (type.includes("Toko") || type.includes("Commerce")) return ShoppingBag;
  if (type.includes("Agency") || type.includes("Jasa")) return Briefcase;
  if (type.includes("Yayasan") || type.includes("Profit")) return HeartHandshake;
  if (type.includes("Klinik") || type.includes("Kesehatan")) return Stethoscope;
  if (type.includes("Sekolah") || type.includes("Edukasi")) return GraduationCap;
  return Building2;
}

function TenantOverview() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [hasCheckedOnboarding, setHasCheckedOnboarding] = useState(false);

  const { data: numbers = [] } = useQuery({ queryKey: ["wa"], queryFn: getWaNumbers });
  const { data: logs = [] } = useQuery({ queryKey: ["chats"], queryFn: getChatLogs });
  const { data: licenseStatus } = useQuery({ queryKey: ["license-status"], queryFn: getLicenseStatus });
  const { data: tenant } = useQuery({ queryKey: ["tenant-me"], queryFn: getTenantMe });
  const { data: readiness } = useQuery({
    queryKey: ["readiness-score"],
    queryFn: getTenantReadinessScore,
  });

  const licenseEndDate = licenseStatus?.lisensiBerakhir || null;
  const sisaHari = licenseEndDate ? daysLeft(licenseEndDate) : 0;
  const isLicenseActive = Boolean(licenseStatus?.isActive || (licenseEndDate && sisaHari > 0));
  const activePlan = licenseStatus?.plan || tenant?.plan || "Starter";

  const connectedNumbers = numbers.filter((n) => n.status === "tersambung").length;
  const totalChat = logs.length;
  const perluManusia = logs.filter((l) => l.status === "perlu manusia").length;

  const primaryNumber = numbers[0] ?? null;
  const isConnected = primaryNumber?.status === "tersambung";
  const autoChat = primaryNumber?.autoChat ?? true;
  const autoIklan = primaryNumber?.autoIklan ?? true;
  const masterAuto = autoChat || autoIklan;

  // Onboarding popup: jika tipe bisnis belum ditentukan
  useEffect(() => {
    if (tenant && !hasCheckedOnboarding) {
      setHasCheckedOnboarding(true);
      if (!tenant.industri || tenant.industri === "Belum Memilih" || tenant.industri === "Belum Ditentukan") {
        setModalOpen(true);
      }
    }
  }, [tenant, hasCheckedOnboarding]);

  // Mutation untuk toggle switch balas otomatis
  const autoMutation = useMutation({
    mutationFn: ({ autoChat, autoIklan }: { autoChat?: boolean; autoIklan?: boolean }) => {
      if (!primaryNumber) {
        throw new Error("Silakan sambungkan nomor WhatsApp terlebih dahulu");
      }
      return toggleWaAuto(primaryNumber.id, { autoChat, autoIklan });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa"] });
      queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
      queryClient.invalidateQueries({ queryKey: ["readiness-score"] });
      toast.success("Pengaturan balasan otomatis diperbarui");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Gagal memperbarui pengaturan otomatis");
    },
  });

  const handleToggleMaster = () => {
    if (!primaryNumber) {
      toast.error("Sambungkan nomor WhatsApp terlebih dahulu di menu Koneksi WhatsApp");
      return;
    }
    const nextVal = !masterAuto;
    autoMutation.mutate({ autoChat: nextVal, autoIklan: nextVal });
  };

  const handleToggleChat = () => {
    if (!primaryNumber) {
      toast.error("Sambungkan nomor WhatsApp terlebih dahulu di menu Koneksi WhatsApp");
      return;
    }
    autoMutation.mutate({ autoChat: !autoChat });
  };

  const handleToggleIklan = () => {
    if (!primaryNumber) {
      toast.error("Sambungkan nomor WhatsApp terlebih dahulu di menu Koneksi WhatsApp");
      return;
    }
    autoMutation.mutate({ autoIklan: !autoIklan });
  };

  const currentType = tenant?.industri || "Belum Memilih";
  const isTypeSelected = currentType !== "Belum Memilih" && currentType !== "Belum Ditentukan";
  const TypeIcon = getBusinessTypeIcon(currentType);

  const score = readiness?.score ?? 50;
  const scoreLevel = readiness?.level ?? "Cukup Siap";
  const scoreColor = readiness?.levelColor ?? "info";

  return (
    <>
      <PageHeader
        title="Ringkasan"
        description="Pantau kinerja bot WhatsApp, kendali balas otomatis, dan kesiapan AI bisnis Anda."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
              <TypeIcon className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isTypeSelected ? currentType : "Tipe Bisnis Belum Dipilih"}</span>
            </span>
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to="/app/uji-coba">Uji coba bot</Link>
            </Button>
          </div>
        }
      />

      {/* BANNER NOTIFIKASI AKTIVASI LISENSI VIA ADMIN (hanya tampil jika lisensi belum aktif atau expired) */}
      {(!isLicenseActive || sisaHari <= 0) && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-50/80 dark:bg-emerald-950/30 p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <p className="text-foreground">
              <strong>Aktivasi Lisensi Diperlukan:</strong> Dapatkan kode aktivasi resmi dari Admin via WhatsApp (<strong>0852-1590-2047</strong>) untuk mengaktifkan AI &amp; fitur Balas Iklan.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20WhatsApp%20saya."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 font-bold transition-all shadow-xs text-xs"
            >
              Chat Admin WA (0852-1590-2047)
            </a>
            <Button asChild size="sm" variant="outline" className="rounded-lg h-7 text-xs">
              <Link to="/app/lisensi">Input Kode</Link>
            </Button>
          </div>
        </div>
      )}

      {/* STAT CARDS ROW */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Nomor tersambung"
          value={`${connectedNumbers} / ${numbers.length || 1}`}
          icon={Smartphone}
          tone="success"
        />
        <StatCard
          label="Chat hari ini"
          value={formatNumber(totalChat)}
          icon={MessagesSquare}
          hint="Total chat masuk"
        />
        <StatCard
          label="Perlu ditangani manusia"
          value={String(perluManusia)}
          icon={ShieldQuestion}
          tone="warning"
        />
        <StatCard
          label="Status Lisensi"
          value={isLicenseActive && sisaHari > 0 ? "Aktif" : (licenseEndDate && sisaHari <= 0 ? "Expired" : "Belum Aktif")}
          icon={CalendarClock}
          tone={isLicenseActive && sisaHari > 0 ? "success" : "danger"}
          hint={
            isLicenseActive && sisaHari > 0
              ? `Paket ${activePlan} (Sisa ${sisaHari} hari)`
              : (licenseEndDate ? "Masa aktif habis" : "Perlu aktivasi admin")
          }
        />
      </div>

      {/* TOP ROW: KENDALI BALAS OTOMATIS & SKOR KESIAPAN AI */}
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        {/* PANEL KENDALI BALAS OTOMATIS (7 COLUMNS) */}
        <section className="panel p-6 lg:col-span-7 flex flex-col justify-between rounded-2xl relative overflow-hidden">
          <div>
            {/* Header Kontrol Balas Otomatis */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl transition-colors ${
                    masterAuto && isConnected
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Power className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Kendali Balasan Otomatis
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Atur operasional bot WhatsApp secara terpusat
                  </p>
                </div>
              </div>

              {/* Master Switch */}
              <div className="flex items-center gap-3 bg-secondary/60 dark:bg-card px-3.5 py-1.5 rounded-xl border border-border/60">
                <div className="text-right">
                  <span className="text-xs font-semibold block text-foreground">
                    Semua Balas Otomatis
                  </span>
                  <span
                    className={`text-[11px] font-medium ${
                      masterAuto ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {masterAuto ? "Aktif Berjalan" : "Semua Mati"}
                  </span>
                </div>
                <Switch
                  checked={masterAuto}
                  onCheckedChange={handleToggleMaster}
                  disabled={autoMutation.isPending || !primaryNumber}
                  aria-label="Toggle Master Semua Balas Otomatis"
                />
              </div>
            </div>

            {/* Warning jika belum ada nomor tersambung */}
            {!isConnected && (
              <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                <div className="flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>WhatsApp belum tersambung. Sambungkan nomor untuk mulai membalas chat.</span>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 text-xs rounded-lg shrink-0">
                  <Link to="/app/whatsapp">Scan QR Sekarang</Link>
                </Button>
              </div>
            )}

            {/* Sub-Switches Grid */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {/* Sub-Switch 1: Balas Chat Otomatis */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  autoChat && masterAuto
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border bg-card/40 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <MessageSquare className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold leading-tight text-foreground">
                        Balas Chat Otomatis
                      </h3>
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                        {autoChat ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={autoChat}
                    onCheckedChange={handleToggleChat}
                    disabled={autoMutation.isPending || !primaryNumber}
                    aria-label="Toggle Balas Chat Otomatis"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  AI menjawab pertanyaan pelanggan 24 jam nonstop berdasarkan info &amp; FAQ bisnis Anda.
                </p>
                <div className="mt-3 pt-2.5 border-t border-border/40 flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground">Kanal Pesan Reguler</span>
                  <Link
                    to="/app/pengetahuan"
                    className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    Atur FAQ AI →
                  </Link>
                </div>
              </div>

              {/* Sub-Switch 2: Balas Iklan Otomatis */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  autoIklan && masterAuto
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border bg-card/40 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                      <Zap className="size-4" />
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold leading-tight text-foreground">
                        Balas Iklan Otomatis
                      </h3>
                      <span className="text-[11px] font-medium text-teal-600 dark:text-teal-400">
                        {autoIklan ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                  <Switch
                    checked={autoIklan}
                    onCheckedChange={handleToggleIklan}
                    disabled={autoMutation.isPending || !primaryNumber}
                    aria-label="Toggle Balas Iklan Otomatis"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                  Respon instan &lt; 2 detik untuk calon pembeli yang klik iklan medsos lengkap dengan foto/katalog.
                </p>
                <div className="mt-3 pt-2.5 border-t border-border/40 flex justify-between items-center text-[11px]">
                  <span className="text-muted-foreground">Kanal Iklan (CTWA)</span>
                  <Link
                    to="/app/balas-iklan"
                    className="font-medium text-teal-600 dark:text-teal-400 hover:underline"
                  >
                    Atur Template Iklan →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Nomor Utama:{" "}
              <strong className="text-foreground">{primaryNumber?.nomor || "Belum terhubung"}</strong>
            </span>
            <Link to="/app/whatsapp" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              Pengaturan WhatsApp →
            </Link>
          </div>
        </section>

        {/* SKOR KESIAPAN PENGETAHUAN AI BISNIS (5 COLUMNS) */}
        <section className="panel p-6 lg:col-span-5 flex flex-col justify-between rounded-2xl">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-foreground">
                    Kesiapan Pengetahuan AI
                  </h2>
                  <p className="text-[11px] text-muted-foreground">
                    Tingkat kepintaran AI memahami bisnis Anda
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  scoreColor === "success"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : scoreColor === "info"
                      ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {scoreLevel}
              </span>
            </div>

            {/* Score Bar & Number */}
            <div className="mt-4 rounded-xl border border-border/60 bg-secondary/40 p-4">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-xs text-muted-foreground">Skor Akurasi Bisnis</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-foreground font-mono">{score}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <Progress
                value={score}
                className="h-2.5 bg-muted"
              />
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                Semakin lengkap info toko &amp; FAQ yang Anda isi, semakin minim AI mengalihkan chat ke manusia.
              </p>
            </div>

            {/* Checklist Items */}
            <div className="mt-4 space-y-2">
              {(readiness?.checklist || []).slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <CheckCircle2
                      className={`size-3.5 shrink-0 ${
                        item.done ? "text-emerald-500" : "text-muted-foreground/40"
                      }`}
                    />
                    <span className={item.done ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono shrink-0 ${
                      item.done ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"
                    }`}
                  >
                    {item.done ? `+${item.bobot}%` : "Belum"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Perlu tambahan info?</span>
            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs h-8">
              <Link to="/app/pengetahuan">
                Lengkapi Pengetahuan AI
                <ArrowRight className="size-3.5 ml-1.5" />
              </Link>
            </Button>
          </div>
        </section>
      </div>

      {/* BOTTOM ROW: STATUS NOMOR WA & TOTAL CHAT */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="panel p-5 lg:col-span-2 rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Status Nomor WhatsApp</h2>
            <Button asChild variant="ghost" size="sm" className="text-xs">
              <Link to="/app/whatsapp">Kelola koneksi →</Link>
            </Button>
          </div>
          {numbers.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {numbers.map((n) => (
                <li
                  key={n.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-secondary/40 px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{n.label}</p>
                      {n.autoChat && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                          AI Chat On
                        </span>
                      )}
                      {n.autoIklan && (
                        <span className="text-[10px] bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold px-2 py-0.5 rounded-full">
                          Iklan On
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">{n.nomor}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{n.terakhirAktif}</span>
                    <StatusPill label={n.status} tone={toneForWa(n.status)} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Belum ada nomor WhatsApp yang terhubung.
            </div>
          )}
        </section>

        <section className="panel p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold">Total Chat Dibalas</h2>
            <p className="mt-4 text-3xl font-black text-foreground font-mono">{formatNumber(totalChat)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isLicenseActive && sisaHari > 0
                ? `Lisensi aktif (${activePlan}) • Sisa ${sisaHari} hari`
                : "Belum ada lisensi aktif"}
            </p>
            <div className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-emerald-500" />
                  Balas Chat Otomatis (FAQ)
                </span>
                <span className="font-semibold">{logs.filter((l) => l.kanal === "Chat").length}</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Zap className="size-3.5 text-teal-500" />
                  Balas Iklan Otomatis (CTWA)
                </span>
                <span className="font-semibold">{logs.filter((l) => l.kanal === "Iklan").length}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-border/40 text-center">
            <Link to="/app/analitik" className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
              Lihat Analitik Lengkap &amp; Efisiensi Jam Kerja →
            </Link>
          </div>
        </section>
      </div>

      {/* MODAL ONBOARDING / UBAH TIPE BISNIS */}
      <BusinessTypeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentType={tenant?.industri}
        isMandatory={!isTypeSelected}
      />
    </>
  );
}
