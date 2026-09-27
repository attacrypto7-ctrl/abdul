import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Search,
  Download,
  TrendingUp,
  HeartHandshake,
  ShoppingBag,
  Sparkles,
  Phone,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
  Tag,
  InboxIcon,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { getChatLogs, getTenantMe, formatNumber } from "@/mock/api";

export const Route = createFileRoute("/app/pengelolaan-nomor")({
  head: () => ({
    meta: [
      { title: "Pengelolaan Nomor & Klien — Dashboard Balasin" },
      {
        name: "description",
        content: "Analisa data nomor kontak klien dari riwayat chat, tingkat respon, dan ekspor laporan Excel.",
      },
      { property: "og:title", content: "Pengelolaan Nomor & Klien — Dashboard Balasin" },
      { property: "og:description", content: "Analisa data nomor kontak klien dan status respon." },
    ],
  }),
  component: PengelolaanNomorPage,
});

/**
 * Hitung skor ketertarikan dari data chat log nyata.
 * Skor dihitung berdasarkan: jumlah interaksi, status terakhir, dan keyakinan bot.
 */
function hitungSkorMinat(totalInteraksi: number, status: string, keyakinan: number): number {
  let skor = 40; // base
  // Interaksi lebih banyak = lebih tertarik
  skor += Math.min(totalInteraksi * 4, 30);
  // Keyakinan bot tinggi = pertanyaan relevan
  skor += Math.round(keyakinan * 20);
  // Status bonus
  if (status === "terjawab") skor += 10;
  else if (status === "diambil alih") skor += 5;
  return Math.min(100, Math.max(0, skor));
}

interface KontakData {
  nomor: string;
  nama: string;
  totalInteraksi: number;
  pesanTerakhir: string;
  waktuTerakhir: string;
  statusBot: string;
  keyakinanRataRata: number;
  skorMinat: number;
  statusKlien: string;
}

// Status klien yang bisa dipilih manual
const STATUS_OPTIONS = [
  "Prospek Baru",
  "Menunggu Tindak Lanjut",
  "Sudah Merespons",
  "Closing / Sudah Bayar",
  "Pelanggan Setia",
  "Tidak Aktif",
];

function PengelolaanNomorPage() {
  const queryClient = useQueryClient();
  const { data: tenant } = useQuery({ queryKey: ["tenant-me"], queryFn: getTenantMe });
  const { data: logs = [], isLoading, refetch } = useQuery({
    queryKey: ["chats"],
    queryFn: getChatLogs,
  });

  const isYayasan =
    Boolean(tenant?.industri?.includes("Yayasan")) ||
    Boolean(tenant?.industri?.includes("Profit")) ||
    Boolean(tenant?.industri?.includes("Sosial"));

  // Map overrides status klien (manual per nomor)
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  // State search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterScore, setFilterScore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // =====================================================================
  // PROSES DATA REAL DARI CHAT LOGS (AUTO SYNC)
  // =====================================================================
  const kontak: KontakData[] = useMemo(() => {
    if (!logs || logs.length === 0) return [];

    // Grup per nomor
    const grouped: Record<string, typeof logs> = {};
    for (const log of logs) {
      if (!log.nomor) continue;
      if (!grouped[log.nomor]) grouped[log.nomor] = [];
      grouped[log.nomor].push(log);
    }

    return Object.entries(grouped).map(([nomor, chatLogs]) => {
      const totalInteraksi = chatLogs.length;
      const lastLog = chatLogs[chatLogs.length - 1];
      const rataRataKeyakinan =
        chatLogs.reduce((a: number, c: any) => a + (c.keyakinan ?? 0.5), 0) / totalInteraksi;

      const skorMinat = hitungSkorMinat(totalInteraksi, lastLog?.status ?? "", rataRataKeyakinan);
      const namaDefault = lastLog?.kontak ?? nomor;

      return {
        nomor,
        nama: namaDefault,
        totalInteraksi,
        pesanTerakhir: lastLog?.pesanTerakhir ?? "",
        waktuTerakhir: lastLog?.waktu ?? "",
        statusBot: lastLog?.status ?? "terjawab",
        keyakinanRataRata: Math.round(rataRataKeyakinan * 100),
        skorMinat,
        statusKlien: statusOverrides[nomor] ?? "Prospek Baru",
      };
    });
  }, [logs, statusOverrides]);

  // Filter
  const filteredKontak = useMemo(() => {
    return kontak.filter((c) => {
      const matchSearch =
        c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nomor.includes(searchQuery) ||
        c.pesanTerakhir.toLowerCase().includes(searchQuery.toLowerCase());

      let matchScore = true;
      if (filterScore === "high") matchScore = c.skorMinat >= 80;
      else if (filterScore === "med") matchScore = c.skorMinat >= 60 && c.skorMinat < 80;
      else if (filterScore === "low") matchScore = c.skorMinat < 60;

      const matchStatus = filterStatus === "all" || c.statusKlien === filterStatus;

      return matchSearch && matchScore && matchStatus;
    });
  }, [kontak, searchQuery, filterScore, filterStatus]);

  // Summary metrics (dari data real)
  const totalKontak = kontak.length;
  const closingCount = kontak.filter((c) =>
    ["Closing / Sudah Bayar", "Pelanggan Setia"].includes(c.statusKlien)
  ).length;
  const minatTinggiCount = kontak.filter((c) => c.skorMinat >= 80).length;
  const rataRataSkor =
    totalKontak > 0
      ? Math.round(kontak.reduce((a, c) => a + c.skorMinat, 0) / totalKontak)
      : 0;

  // Ubah status klien (manual override, disimpan di state lokal)
  const handleUpdateStatus = (nomor: string, newStat: string) => {
    setStatusOverrides((prev) => ({ ...prev, [nomor]: newStat }));
    toast.success(`Status diperbarui menjadi "${newStat}"`);
  };

  // Warna badge status bot
  const getBotStatusBadge = (status: string) => {
    if (status === "terjawab") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    if (status === "perlu manusia") return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    if (status === "diambil alih") return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    return "bg-muted text-muted-foreground border-border";
  };

  // =====================================================================
  // EKSPOR EXCEL (XLSX) — BUKAN CSV
  // =====================================================================
  const handleExportExcel = () => {
    if (kontak.length === 0) {
      toast.error("Tidak ada data kontak untuk diekspor. Pastikan bot sudah menerima pesan.");
      return;
    }

    const rows = filteredKontak.map((c, i) => {
      let kategori = "Sedang";
      if (c.skorMinat >= 85) kategori = "Sangat Tinggi";
      else if (c.skorMinat >= 70) kategori = "Tinggi";
      else if (c.skorMinat < 50) kategori = "Rendah";

      return {
        "No": i + 1,
        "Nama Kontak": c.nama,
        "Nomor WhatsApp": c.nomor,
        "Status Klien": c.statusKlien,
        "Status Bot Terakhir": c.statusBot,
        "Skor Ketertarikan (%)": c.skorMinat,
        "Kategori Minat": kategori,
        "Rata-rata Keyakinan Bot (%)": c.keyakinanRataRata,
        "Total Interaksi Chat": c.totalInteraksi,
        "Pesan Terakhir": c.pesanTerakhir,
        "Waktu Terakhir": c.waktuTerakhir,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);

    // Auto column width
    const colWidths = [
      { wch: 4 },   // No
      { wch: 24 },  // Nama
      { wch: 18 },  // Nomor
      { wch: 22 },  // Status Klien
      { wch: 20 },  // Status Bot
      { wch: 10 },  // Skor %
      { wch: 16 },  // Kategori
      { wch: 14 },  // Keyakinan
      { wch: 8 },   // Interaksi
      { wch: 40 },  // Pesan
      { wch: 18 },  // Waktu
    ];
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    const sheetName = isYayasan ? "Data Donatur" : "Data Pelanggan";
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `Laporan_Klien_${isYayasan ? "Donatur" : "Pelanggan"}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, fileName);

    toast.success(`Laporan Excel berhasil diunduh: ${fileName}`);
  };

  return (
    <>
      <PageHeader
        title="Pengelolaan Nomor & Klien"
        description="Data kontak diambil otomatis dari riwayat chat bot. Pantau minat, ubah status klien, dan ekspor laporan Excel."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => {
                refetch();
                queryClient.invalidateQueries({ queryKey: ["chats"] });
                toast.info("Memperbarui data kontak...");
              }}
              variant="outline"
              size="sm"
              className="rounded-xl flex items-center gap-2 text-xs"
              disabled={isLoading}
            >
              <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
              Sinkron Data
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              size="sm"
              className="rounded-xl flex items-center gap-2 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
              disabled={kontak.length === 0}
            >
              <Download className="size-3.5" />
              <span>Ekspor Excel (.xlsx)</span>
            </Button>
          </div>
        }
      />

      {/* BANNER INFO AUTO-SYNC */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            {isYayasan ? <HeartHandshake className="size-5" /> : <ShoppingBag className="size-5" />}
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
              </span>
              <h2 className="text-xs font-bold text-foreground">
                Data Real-time dari Riwayat Chat Bot
              </h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                Auto Sync
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Kontak dikumpulkan otomatis dari setiap interaksi WhatsApp yang masuk. Tidak perlu input manual.
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          <Link to="/app/percakapan">Lihat Riwayat Chat →</Link>
        </Button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isYayasan ? "Total Kontak Donatur" : "Total Kontak Pelanggan"}
          value={totalKontak > 0 ? formatNumber(totalKontak) : "—"}
          icon={Users}
          hint={totalKontak > 0 ? "Dari riwayat chat bot" : "Belum ada interaksi"}
        />
        <StatCard
          label={isYayasan ? "Donatur Closing/Aktif" : "Closing / Sudah Bayar"}
          value={closingCount > 0 ? formatNumber(closingCount) : "—"}
          icon={CheckCircle2}
          tone={closingCount > 0 ? "success" : "default"}
          hint="Status diperbarui manual oleh Anda"
        />
        <StatCard
          label="Minat Sangat Tinggi"
          value={minatTinggiCount > 0 ? `${minatTinggiCount} Kontak` : "—"}
          icon={TrendingUp}
          tone={minatTinggiCount > 0 ? "success" : "default"}
          hint="Skor ketertarikan ≥ 80%"
        />
        <StatCard
          label="Rata-rata Skor Ketertarikan"
          value={totalKontak > 0 ? `${rataRataSkor}%` : "—"}
          icon={Sparkles}
          hint={totalKontak > 0 ? "Dihitung dari data chat real" : "Belum ada data"}
        />
      </div>

      {/* FILTER & PENCARIAN BAR */}
      <div className="panel mt-6 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 min-w-[220px] max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, nomor, atau isi pesan..."
              className="pl-9 h-9 text-xs rounded-xl bg-secondary/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Minat:</span>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Minat</option>
              <option value="high">Sangat Tinggi (≥80%)</option>
              <option value="med">Sedang (60–79%)</option>
              <option value="low">Rendah (&lt;60%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABEL DATA KONTAK */}
      <div className="panel mt-4 rounded-2xl overflow-hidden border border-border bg-card">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <RefreshCw className="size-8 text-muted-foreground/40 animate-spin" />
            <p className="text-sm text-muted-foreground">Memuat data kontak dari riwayat chat...</p>
          </div>
        ) : kontak.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center px-4">
            <InboxIcon className="size-10 text-muted-foreground/30" />
            <p className="text-sm font-medium text-muted-foreground">Belum Ada Data Kontak</p>
            <p className="text-xs text-muted-foreground/70 max-w-xs">
              Data kontak akan muncul otomatis setelah bot WhatsApp Anda aktif dan menerima pesan masuk dari pelanggan.
            </p>
            <Button asChild size="sm" variant="outline" className="rounded-xl text-xs mt-1">
              <Link to="/app/whatsapp">Sambungkan WhatsApp →</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="py-3.5 px-4">Kontak & Nomor WA</th>
                    <th className="py-3.5 px-4">Skor & Minat</th>
                    <th className="py-3.5 px-4">Status Bot</th>
                    <th className="py-3.5 px-4">Pesan Terakhir</th>
                    <th className="py-3.5 px-4 text-center">Interaksi</th>
                    <th className="py-3.5 px-4">Status Klien</th>
                    <th className="py-3.5 px-4 text-center">WA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredKontak.length > 0 ? (
                    filteredKontak.map((c) => (
                      <tr key={c.nomor} className="hover:bg-secondary/20 transition-colors">
                        {/* Kontak */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              {c.nama.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{c.nama}</p>
                              <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] mt-0.5">
                                <Phone className="size-3 text-emerald-500" />
                                <span>{c.nomor}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Skor */}
                        <td className="py-3.5 px-4 min-w-[130px]">
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="font-bold text-foreground font-mono">{c.skorMinat}%</span>
                              <span
                                className={`font-semibold ${
                                  c.skorMinat >= 80
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : c.skorMinat >= 60
                                      ? "text-blue-600 dark:text-blue-400"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {c.skorMinat >= 85 ? "Sangat Tinggi" : c.skorMinat >= 70 ? "Tinggi" : c.skorMinat >= 60 ? "Sedang" : "Rendah"}
                              </span>
                            </div>
                            <Progress value={c.skorMinat} className="h-1.5" />
                          </div>
                        </td>

                        {/* Status Bot */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBotStatusBadge(c.statusBot)}`}
                          >
                            <Tag className="size-3" />
                            {c.statusBot === "terjawab"
                              ? "Terjawab"
                              : c.statusBot === "perlu manusia"
                                ? "Perlu Admin"
                                : "Diambil Alih"}
                          </span>
                        </td>

                        {/* Pesan Terakhir */}
                        <td className="py-3.5 px-4 max-w-[200px]">
                          <p className="text-[11px] text-foreground line-clamp-2 leading-relaxed">
                            {c.pesanTerakhir || <span className="text-muted-foreground italic">—</span>}
                          </p>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">
                            {c.waktuTerakhir}
                          </span>
                        </td>

                        {/* Interaksi */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground bg-secondary/50 px-2 py-0.5 rounded-lg border border-border/40">
                            <MessageSquare className="size-3 text-muted-foreground" />
                            {c.totalInteraksi}
                          </span>
                        </td>

                        {/* Status Klien (manual) */}
                        <td className="py-3.5 px-4">
                          <select
                            value={c.statusKlien}
                            onChange={(e) => handleUpdateStatus(c.nomor, e.target.value)}
                            className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors min-w-[140px]"
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>

                        {/* Buka WA */}
                        <td className="py-3.5 px-4 text-center">
                          <a
                            href={`https://wa.me/${c.nomor.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Buka di WhatsApp"
                            className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:scale-105 transition-all duration-200 mx-auto"
                          >
                            <Phone className="size-3.5" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                        Tidak ada kontak yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* FOOTER TABEL */}
            <div className="p-3 border-t border-border/60 bg-secondary/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
              <span>
                Menampilkan <strong>{filteredKontak.length}</strong> dari {kontak.length} kontak
              </span>
              <span className="text-[11px]">
                Data diperbarui otomatis dari riwayat chat bot WhatsApp.
              </span>
            </div>
          </>
        )}
      </div>
    </>
  );
}
