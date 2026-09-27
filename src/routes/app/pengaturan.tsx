import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  Sparkles,
  Sliders,
  Bot,
  Shield,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Briefcase,
  HeartHandshake,
  Stethoscope,
  GraduationCap,
  MessageCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { BusinessTypeModal, BUSINESS_TYPES } from "@/components/business-type-modal";
import { getTenantMe, getLicenses } from "@/mock/api";

export const Route = createFileRoute("/app/pengaturan")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Dashboard Balasin" },
      {
        name: "description",
        content: "Kelola klasifikasi tipe bisnis, gaya bahasa AI, dan preferensi bot WhatsApp Anda.",
      },
      { property: "og:title", content: "Pengaturan — Dashboard Balasin" },
      { property: "og:description", content: "Kelola tipe bisnis dan preferensi bot." },
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
  const { data: licenses = [] } = useQuery({ queryKey: ["licenses"], queryFn: getLicenses });
  const [modalOpen, setModalOpen] = useState(false);

  // Bot language personality preferences (saved locally)
  const [gayaBahasa, setGayaBahasa] = useState<string>("ramah");
  const [panggilanKlien, setPanggilanKlien] = useState<string>("kak");
  const [isSaved, setIsSaved] = useState(false);

  const currentType = tenant?.industri || "Belum Memilih";
  const TypeIcon = getIconForType(currentType);
  const activeLic = licenses[0] ?? null;

  const currentTypeDetail = BUSINESS_TYPES.find((b) =>
    currentType.toLowerCase().includes(b.id.toLowerCase().split("/")[0].trim()),
  ) || {
    id: currentType,
    label: currentType,
    deskripsi: "Klasifikasi operasional disesuaikan dengan aktivitas usaha Anda.",
    tagline: "AI membalas chat secara otomatis sesuai konteks pertanyaan pelanggan.",
  };

  const handleSavePreferences = () => {
    setIsSaved(true);
    toast.success("Pengaturan gaya bahasa dan kepribadian bot berhasil disimpan!");
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <>
      <PageHeader
        title="Pengaturan Bisnis &amp; Bot"
        description="Sesuaikan klasifikasi bisnis, nada komunikasi bot AI, dan konfigurasi profil akun Anda."
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

          {/* KARTU 2: GAYA BAHASA & KEPRIBADIAN BOT */}
          <section className="panel rounded-2xl p-6 border border-border bg-card">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Bot className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  Gaya Bahasa &amp; Nada Komunikasi AI
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tentukan bagaimana AI menyapa dan menjawab pesan pelanggan di WhatsApp.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Nada Bicara Bot
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { id: "ramah", label: "Ramah & Hangat", hint: "Sopan, bersahabat, banyak senyum emoji 😊" },
                    { id: "formal", label: "Formal & Profesional", hint: "Baku, rapi, cocok untuk instansi/B2B" },
                    { id: "santai", label: "Santai & Komunikatif", hint: "Gaul, santai, cocok untuk target Gen-Z" },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setGayaBahasa(item.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        gayaBahasa === item.id
                          ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/30"
                          : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <span className="font-semibold block text-foreground mb-1">
                        {item.label}
                      </span>
                      <span className="text-[11px] text-muted-foreground leading-snug block">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-semibold text-foreground block mb-2">
                  Panggilan untuk Lawan Bicara (Pelanggan / Donatur)
                </label>
                <div className="grid gap-2.5 sm:grid-cols-4">
                  {[
                    { id: "kak", label: "Kak / Kakak", for: "Umum & Toko" },
                    { id: "mas_mbak", label: "Mas / Mbak", for: "Akrab" },
                    { id: "bapak_ibu", label: "Bapak / Ibu", for: "Formal & Instansi" },
                    { id: "sahabat", label: "Sahabat Dermawan", for: "Khusus Yayasan" },
                  ].map((p) => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setPanggilanKlien(p.id)}
                      className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                        panggilanKlien === p.id
                          ? "border-emerald-500 bg-emerald-500/10 font-bold text-emerald-600 dark:text-emerald-400"
                          : "border-border bg-card text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <span>{p.label}</span>
                      <span className="block text-[10px] text-muted-foreground font-normal mt-0.5">
                        {p.for}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end">
                <Button
                  onClick={handleSavePreferences}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs px-5 h-9"
                >
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                  {isSaved ? "Tersimpan!" : "Simpan Pengaturan"}
                </Button>
              </div>
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
                <span className="font-semibold text-foreground">{tenant?.nama || "Bisnis Saya"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Email Terdaftar</span>
                <span className="font-mono text-foreground">{tenant?.email || "user@gmail.com"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/40">
                <span className="text-muted-foreground">Paket Layanan</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {activeLic ? activeLic.plan : "Starter"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Masa Aktif Lisensi</span>
                <span className="font-mono text-muted-foreground">
                  {activeLic ? activeLic.berakhir : "Permanen / Aktif"}
                </span>
              </div>
            </div>
          </section>

          <section className="panel rounded-2xl p-5 border border-border/60 bg-secondary/30">
            <h4 className="text-xs font-bold text-foreground mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="size-3.5 text-emerald-500" />
              Dampak Penggantian Tipe Bisnis
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Saat Anda mengganti tipe bisnis (misal dari Toko ke Yayasan atau sebaliknya), sistem secara otomatis:
            </p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground list-disc pl-4">
              <li>Menampilkan template tanya-jawab (FAQ) yang relevan di menu Basis Pengetahuan.</li>
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
