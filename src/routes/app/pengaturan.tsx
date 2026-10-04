import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Sparkles,
  Sliders,
  Shield,
  ShoppingBag,
  Briefcase,
  HeartHandshake,
  Stethoscope,
  GraduationCap,
  HelpCircle,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { BusinessTypeModal, BUSINESS_TYPES } from "@/components/business-type-modal";
import { getTenantMe, getLicenseStatus, formatDate } from "@/mock/api";

export const Route = createFileRoute("/app/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Dashboard Balasin" },
      {
        name: "description",
        content: "Kelola klasifikasi tipe bisnis dan profil akun WhatsApp Anda.",
      },
      { property: "og:title", content: "Pengaturan — Dashboard Balasin" },
      { property: "og:description", content: "Kelola tipe bisnis dan profil akun." },
    ],
  }),
  component: PengaturanPage,
});

function getIconForType(type?: string) {
  if (!type) return Building2;
  if (type.includes("Toko") || type.includes("Commerce")) return ShoppingBag;
  if (type.includes("Agency") || type.includes("Jasa")) return Briefcase;
  if (type.includes("Yayasan") || type.includes("Profit")) return HeartHandshake;
  if (type.includes("Klinik") || type.includes("Kesehatan")) return Stethoscope;
  if (type.includes("Sekolah") || type.includes("Edukasi")) return GraduationCap;
  return Building2;
}

function PengaturanPage() {
  const { data: tenant } = useQuery({ queryKey: ["tenant-me"], queryFn: getTenantMe });
  const { data: licenseStatus, isLoading: loadingLic } = useQuery({
    queryKey: ["license-status"],
    queryFn: getLicenseStatus,
  });
  const [modalOpen, setModalOpen] = useState(false);

  const currentType = tenant?.industri || "Belum Memilih";
  const TypeIcon = getIconForType(currentType);

  // Data lisensi REAL dari API
  const isLicenseActive = licenseStatus?.isActive ?? false;
  const activePlan = licenseStatus?.plan || null;
  const licenseEndDate = licenseStatus?.lisensiBerakhir || null;

  const currentTypeDetail = BUSINESS_TYPES.find((b) =>
    currentType.toLowerCase().includes(b.id.toLowerCase().split("/")[0].trim()),
  ) || {
    id: currentType,
    label: currentType,
    deskripsi: "Klasifikasi operasional disesuaikan dengan aktivitas usaha Anda.",
    tagline: "AI membalas chat secara otomatis sesuai konteks pertanyaan pelanggan.",
  };

  return (
    <>
      <PageHeader
        title="Pengaturan Bisnis"
        description="Sesuaikan klasifikasi bisnis dan konfigurasi akun Anda."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* KOLOM KIRI (2 COLUMNS): KLASIFIKASI & GAYA BAHASA */}
        <div className="space-y-6 lg:col-span-2">
          {/* KARTU 1: KLASIFIKASI TIPE BISNIS */}
          <section className="panel rounded-2xl p-6 relative overflow-hidden border border-emerald-500/20 bg-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TypeIcon className="size-6" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Tipe Bisnis Aktif
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                      Sedang Digunakan
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mt-0.5">
                    {currentTypeDetail.label}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                    {currentTypeDetail.deskripsi}
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold px-4 h-9 shadow-sm shrink-0"
              >
                <Sliders className="size-3.5 mr-1.5" />
                Ganti Tipe Bisnis
              </Button>
            </div>

            <div className="mt-5 rounded-xl bg-secondary/40 border border-border/50 p-3.5 text-xs text-muted-foreground flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Karakter Balasan AI:</strong> {currentTypeDetail.tagline}
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                Otomatis Menyesuaikan Template
              </span>
            </div>
          </section>
        </div>

        {/* KOLOM KANAN (1 COLUMN): INFORMASI AKUN & PANDUAN */}
        <div className="space-y-6">
          <section className="panel rounded-2xl p-5 border border-border bg-card">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
              <Shield className="size-4 text-emerald-500" />
              Informasi Akun &amp; Lisensi
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Nama Usaha / Tenant</span>
                <span className="font-semibold text-foreground">{tenant?.nama || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Email Terdaftar</span>
                <span className="font-mono text-foreground">{tenant?.email || "—"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Paket Layanan</span>
                {loadingLic ? (
                  <span className="text-muted-foreground italic">Memuat...</span>
                ) : (
                  <span
                    className={`font-semibold ${activePlan ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                  >
                    {activePlan || "Belum aktif"}
                  </span>
                )}
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Status Lisensi</span>
                {loadingLic ? (
                  <span className="text-muted-foreground italic">Memuat...</span>
                ) : (
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                      isLicenseActive
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-600 dark:text-red-400"
                    }`}
                  >
                    {isLicenseActive ? "✓ Aktif" : "✗ Tidak Aktif"}
                  </span>
                )}
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Masa Aktif Lisensi</span>
                {loadingLic ? (
                  <span className="text-muted-foreground italic">Memuat...</span>
                ) : licenseEndDate ? (
                  <span className="font-mono text-foreground">{formatDate(licenseEndDate)}</span>
                ) : (
                  <span className="text-muted-foreground italic">Belum ada data</span>
                )}
              </div>
            </div>
          </section>

          <section className="panel rounded-2xl p-5 border border-border/60 bg-secondary/30">
            <h4 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-emerald-500" />
              Dampak Penggantian Tipe Bisnis
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Saat Anda mengganti tipe bisnis (misal dari Toko ke Yayasan atau sebaliknya), sistem
              secara otomatis:
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground list-disc pl-4">
              <li>
                Menampilkan template tanya-jawab (FAQ) yang relevan di menu Basis Pengetahuan.
              </li>
              <li>Menyesuaikan indikator dan grafik di menu Analitik &amp; Performa.</li>
              <li>Mengelompokkan status nomor dan donatur/pelanggan di menu Pengelolaan Nomor.</li>
            </ul>
          </section>
        </div>
      </div>

      {/* MODAL UBAH TIPE BISNIS */}
      <BusinessTypeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        currentType={tenant?.industri}
        isMandatory={false}
      />
    </>
  );
}
