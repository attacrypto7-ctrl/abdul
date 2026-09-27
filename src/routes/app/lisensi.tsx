import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  CalendarClock,
  CheckCircle2,
  Copy,
  KeyRound,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  activateLicenseApi,
  daysLeft,
  formatDate,
  formatNumber,
  getLicenseStatus,
  getMyLicenses,
  getWaNumbers,
} from "@/mock/api";

export const Route = createFileRoute("/app/lisensi")({
  head: () => ({
    meta: [
      { title: "Lisensi Tenant — Dashboard Balasin" },
      {
        name: "description",
        content: "Informasi masa berlaku lisensi, total pesan yang dibalas, dan status aktivasi.",
      },
      { property: "og:title", content: "Lisensi Tenant — Dashboard Balasin" },
      { property: "og:description", content: "Informasi lisensi dan status bot WhatsApp." },
    ],
  }),
  component: LisensiPage,
});

function LisensiPage() {
  const queryClient = useQueryClient();
  const { data: licenses = [] } = useQuery({ queryKey: ["my-licenses"], queryFn: getMyLicenses });
  const { data: licenseStatus } = useQuery({ queryKey: ["license-status"], queryFn: getLicenseStatus });
  const { data: waList = [] } = useQuery({ queryKey: ["wa"], queryFn: getWaNumbers });

  const [inputKode, setInputKode] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isActivating, setIsActivating] = useState(false);

  const latestLicense = licenses.find((l: any) => l.status === "aktif") ?? null;
  const isLicenseActive = Boolean(licenseStatus?.isActive || (latestLicense && latestLicense.status === "aktif"));
  const licenseEndDate = latestLicense?.berakhir || licenseStatus?.lisensiBerakhir || null;
  const sisaHari = licenseEndDate ? daysLeft(licenseEndDate) : 0;
  const activePlan = latestLicense?.plan || licenseStatus?.plan || null;
  const activeCode = latestLicense?.kode || licenseStatus?.kode || null;
  const totalChatDibalas = licenseStatus?.totalChatDibalas ?? licenseStatus?.chatBulanIni ?? 0;

  const hasLicenseData = Boolean(licenseEndDate || latestLicense || licenseStatus?.kode);


  const copyLicense = () => {
    if (activeCode) {
      navigator.clipboard?.writeText(activeCode);
      toast.success("Kode lisensi berhasil disalin!");
    }
  };

  const handleActivate = async () => {
    const code = inputKode.trim().toUpperCase();
    if (!code) {
      toast.error("Silakan masukkan kode lisensi.");
      return;
    }
    setIsActivating(true);
    try {
      await activateLicenseApi(code);
      toast.success("Lisensi berhasil diaktifkan!", {
        description: "Masa berlaku AI dan fitur balas iklan telah aktif.",
      });
      setDialogOpen(false);
      setInputKode("");
      queryClient.invalidateQueries({ queryKey: ["my-licenses"] });
      queryClient.invalidateQueries({ queryKey: ["license-status"] });
      queryClient.invalidateQueries({ queryKey: ["wa"] });
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengaktifkan kode lisensi. Pastikan kode benar.");
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Lisensi & Paket"
        description="Informasi masa aktif lisensi bisnis Anda, total pesan dibalas AI, dan aktivasi kode perpanjangan dari admin."
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <KeyRound className="size-4" /> Masukkan Kode Lisensi
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Aktivasi / Perpanjang Lisensi</DialogTitle>
                <DialogDescription>
                  Masukkan kode lisensi resmi yang Anda dapatkan dari Admin untuk mengaktifkan AI dan fitur Balas Iklan.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <Label htmlFor="kode-baru">Kode Lisensi</Label>
                <Input
                  id="kode-baru"
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  value={inputKode}
                  onChange={(e) => setInputKode(e.target.value.toUpperCase())}
                  className="font-mono uppercase tracking-wider"
                />
                <p className="text-xs text-muted-foreground">
                  Format alfanumerik. Setelah aktivasi, AI & Balas Iklan langsung aktif sesuai masa berlaku kode tanpa mengubah data akun Anda.
                </p>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={isActivating}>
                  Batal
                </Button>
                <Button onClick={handleActivate} disabled={isActivating}>
                  {isActivating ? "Mengaktifkan..." : "Aktivasi Sekarang"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Status Lisensi"
          value={isLicenseActive ? "Aktif" : (licenseEndDate ? "Expired" : "Belum Aktif")}
          icon={isLicenseActive ? ShieldCheck : ShieldAlert}
          tone={isLicenseActive ? "success" : "danger"}
          hint={hasLicenseData ? `Paket ${activePlan ?? "—"}` : "Perlu aktivasi admin"}
        />
        <StatCard
          label="Masa Berlaku"
          value={isLicenseActive ? `${sisaHari} Hari` : (licenseEndDate ? "Habis" : "-")}
          icon={CalendarClock}
          hint={licenseEndDate ? `Hingga ${formatDate(licenseEndDate)}` : "Perlu aktivasi"}
        />
        <StatCard
          label="Total Chat Dibalas"
          value={formatNumber(totalChatDibalas)}
          icon={MessageSquare}
          hint="Semua balasan AI & template"
        />
        <StatCard
          label="Nomor WA Terhubung"
          value={String(waList.length)}
          icon={Smartphone}
          hint="Nomor CS akun Anda"
        />
      </div>

      <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 p-4 text-xs text-muted-foreground flex items-center justify-between">
        <span>
          💡 <strong>Catatan:</strong> Seluruh data bisnis Anda (nomor WhatsApp, riwayat chat, dokumen pengetahuan, dan template iklan) tersimpan permanen di akun Anda dan tidak akan hilang saat masa lisensi habis. Lisensi hanya berfungsi menyalakan fitur AI dan balas iklan.
        </span>
      </div>

      {hasLicenseData ? (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Detail Lisensi</h2>
              <StatusPill
                label={isLicenseActive ? "aktif" : "expired"}
                tone={isLicenseActive ? "success" : "danger"}
              />
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Kode Lisensi:</span>
                <div className="flex items-center gap-2">
                  {activeCode ? (
                    <>
                      <code className="rounded bg-secondary px-2.5 py-1 font-mono text-xs text-foreground font-semibold">
                        {activeCode}
                      </code>
                      <Button size="sm" variant="ghost" onClick={copyLicense} title="Salin kode">
                        <Copy className="size-3.5" />
                      </Button>
                    </>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Tidak tersedia</span>
                  )}
                </div>
              </div>

              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Paket Langganan:</span>
                <span className="font-medium text-foreground">{activePlan}</span>
              </div>

              {latestLicense?.dibuat && (
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Tanggal Dibuat / Aktivasi:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(latestLicense.dibuat)}
                  </span>
                </div>
              )}

              {licenseEndDate && (
                <div className="flex justify-between border-b border-border pb-3">
                  <span className="text-muted-foreground">Berlaku Sampai:</span>
                  <span className="font-medium text-foreground">
                    {formatDate(licenseEndDate)} ({sisaHari > 0 ? `Sisa ${sisaHari} hari` : "Masa aktif habis"})
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Batas Balasan AI:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Unlimited (Selama masa aktif)
                </span>
              </div>
            </div>
          </div>

          <div className="panel p-6 space-y-6">
            <h2 className="text-base font-semibold">Ringkasan Penggunaan AI</h2>

            <div className="space-y-3">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-muted-foreground">Total Pesan Dibalas Bot:</span>
                <span className="text-2xl font-bold text-foreground">
                  {formatNumber(totalChatDibalas)} <span className="text-xs font-normal text-muted-foreground">chat</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Tidak ada batasan kuota pesan per bulan. Bot akan terus membalas otomatis selama lisensi Anda masih dalam masa berlaku.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Fitur Paket {activePlan ?? "—"} Termasuk:
              </h3>
              <ul className="space-y-2 text-xs text-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Balas Chat Otomatis AI (Unlimited selama aktif)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Template Balas Iklan Otomatis (Teks, Gambar & Video)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Dukungan 1 Akun WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                  Basis Pengetahuan Dokumen & FAQ Mandiri
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="panel mt-6 flex flex-col items-center justify-center p-12 text-center">
          <KeyRound className="size-12 text-muted-foreground opacity-30 mb-3" />
          <h2 className="text-base font-semibold">Belum Ada Lisensi Aktif</h2>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            Silakan masukkan kode lisensi yang Anda peroleh dari admin untuk mengaktifkan AI dan fitur bot WhatsApp.
          </p>
          <Button className="mt-4" onClick={() => setDialogOpen(true)}>
            <KeyRound className="size-4" /> Masukkan Kode Lisensi
          </Button>
        </div>
      )}
    </>
  );
}