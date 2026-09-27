import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users,
  Search,
  Download,
  Filter,
  CheckCircle2,
  TrendingUp,
  Clock,
  HeartHandshake,
  ShoppingBag,
  Briefcase,
  Building2,
  Sparkles,
  Phone,
  MessageSquare,
  Plus,
  ArrowUpDown,
  UserCheck,
  Award,
  Wallet,
  Tag,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getChatLogs, getTenantMe, formatNumber } from "@/mock/api";

export const Route = createFileRoute("/app/pengelolaan-nomor")({
  head: () => ({
    meta: [
      { title: "Pengelolaan Nomor & Klien — Dashboard Balasin" },
      {
        name: "description",
        content: "Analisa data nomor kontak klien, tingkat respon, donatur/closing, dan ekspor laporan.",
      },
      { property: "og:title", content: "Pengelolaan Nomor & Klien — Dashboard Balasin" },
      { property: "og:description", content: "Analisa data nomor kontak klien dan status respon." },
    ],
  }),
  component: PengelolaanNomorPage,
});

interface ClientContact {
  id: string;
  nomor: string;
  nama: string;
  status: string;
  skorMinat: number; // 0 - 100
  totalInteraksi: number;
  terakhirKontak: string;
  ringkasanKebutuhan: string;
  nominal?: string;
}

// Data awal terkurasi untuk Skup Yayasan & Lembaga Sosial
const initialYayasanContacts: ClientContact[] = [
  {
    id: "c-y-1",
    nomor: "0812-8823-9901",
    nama: "H. Bambang Sudirman",
    status: "Donatur Tetap",
    skorMinat: 96,
    totalInteraksi: 14,
    terakhirKontak: "Hari ini, 10:15",
    ringkasanKebutuhan: "Rutin transfer santunan yatim bulanan & zakat penghasilan",
    nominal: "Rp 1.500.000 / bln",
  },
  {
    id: "c-y-2",
    nomor: "0857-1192-3344",
    nama: "Ibu Nurul Aini",
    status: "Sudah Transfer Donasi",
    skorMinat: 88,
    totalInteraksi: 6,
    terakhirKontak: "Hari ini, 09:30",
    ringkasanKebutuhan: "Transfer sedekah paket pangan dhuafa via QRIS",
    nominal: "Rp 350.000",
  },
  {
    id: "c-y-3",
    nomor: "0878-5542-1980",
    nama: "dr. Hendra Pratama",
    status: "Konfirmasi Jemput Donasi",
    skorMinat: 92,
    totalInteraksi: 8,
    terakhirKontak: "Kemarin, 16:45",
    ringkasanKebutuhan: "Minta jemput beras & sembako 50kg ke kediaman",
    nominal: "Sembako 50kg",
  },
  {
    id: "c-y-4",
    nomor: "0813-9081-7721",
    nama: "Bpk. Rahmat Hidayat",
    status: "Calon Donatur (Prospek)",
    skorMinat: 74,
    totalInteraksi: 4,
    terakhirKontak: "Kemarin, 14:10",
    ringkasanKebutuhan: "Menanyakan izin legalitas Dinsos dan proposal pembangunan asrama",
  },
  {
    id: "c-y-5",
    nomor: "0896-3321-4402",
    nama: "Ibu Siti Rohmah (Titip Doa)",
    status: "Titip Doa & Hajat",
    skorMinat: 86,
    totalInteraksi: 5,
    terakhirKontak: "2 hari lalu",
    ringkasanKebutuhan: "Titip doa kelancaran hajat keluarga & kesembuhan ibunda bersama santunan anak yatim",
  },
  {
    id: "c-y-6",
    nomor: "0821-6655-1234",
    nama: "Komunitas Berbagi Depok",
    status: "Donatur Tetap",
    skorMinat: 94,
    totalInteraksi: 11,
    terakhirKontak: "3 hari lalu",
    ringkasanKebutuhan: "Kolaborasi qurban & santunan akbar Idul Adha",
    nominal: "Rp 5.000.000",
  },
];

// Data awal terkurasi untuk Skup Bisnis & Toko / E-Commerce
const initialTokoContacts: ClientContact[] = [
  {
    id: "c-t-1",
    nomor: "0812-7788-9900",
    nama: "Dimas Anggara",
    status: "Sudah Transfer (Closing)",
    skorMinat: 98,
    totalInteraksi: 12,
    terakhirKontak: "Hari ini, 11:20",
    ringkasanKebutuhan: "Pembelian Paket Hemat 3 Pcs + Ongkir J&T COD",
    nominal: "Rp 245.000",
  },
  {
    id: "c-t-2",
    nomor: "0856-4433-2211",
    nama: "Ibu Clarissa",
    status: "Pelanggan Setia (Repeat)",
    skorMinat: 95,
    totalInteraksi: 19,
    terakhirKontak: "Hari ini, 08:45",
    ringkasanKebutuhan: "Repeat order serum wajah 2 botol pengiriman instan",
    nominal: "Rp 320.000",
  },
  {
    id: "c-t-3",
    nomor: "0877-9900-1122",
    nama: "Rian Saputra",
    status: "Menunggu Pembayaran",
    skorMinat: 82,
    totalInteraksi: 5,
    terakhirKontak: "Kemarin, 19:15",
    ringkasanKebutuhan: "Sudah isi form alamat, menunggu transfer BCA invoice #1042",
    nominal: "Rp 189.000",
  },
  {
    id: "c-t-4",
    nomor: "0813-2233-4455",
    nama: "Amanda Putri",
    status: "Prospek Potensial",
    skorMinat: 72,
    totalInteraksi: 4,
    terakhirKontak: "Kemarin, 13:00",
    ringkasanKebutuhan: "Tanya stok warna lilac & estimasi sampai Bandung",
  },
  {
    id: "c-t-5",
    nomor: "0895-1122-3344",
    nama: "Fajar Nugraha",
    status: "Tanya Ongkir & Promo",
    skorMinat: 55,
    totalInteraksi: 3,
    terakhirKontak: "2 hari lalu",
    ringkasanKebutuhan: "Minta katalog promo diskon payday gratis ongkir",
  },
  {
    id: "c-t-6",
    nomor: "0822-7711-8899",
    nama: "Toko Grosir Berkah",
    status: "Sudah Transfer (Closing)",
    skorMinat: 96,
    totalInteraksi: 16,
    terakhirKontak: "3 hari lalu",
    ringkasanKebutuhan: "Order partai besar 2 lusin langsung kirim kargo",
    nominal: "Rp 2.400.000",
  },
];

function PengelolaanNomorPage() {
  const { data: tenant } = useQuery({ queryKey: ["tenant-me"], queryFn: getTenantMe });
  const { data: logs = [] } = useQuery({ queryKey: ["chats"], queryFn: getChatLogs });

  const isYayasan =
    Boolean(tenant?.industri?.includes("Yayasan")) ||
    Boolean(tenant?.industri?.includes("Profit")) ||
    Boolean(tenant?.industri?.includes("Sosial"));

  // State contacts
  const [contacts, setContacts] = useState<ClientContact[]>(() => {
    return isYayasan ? initialYayasanContacts : initialTokoContacts;
  });

  // State search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterScore, setFilterScore] = useState("all");

  // Modal Tambah Kontak Baru
  const [modalOpen, setModalOpen] = useState(false);
  const [newNomor, setNewNomor] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newStatus, setNewStatus] = useState(
    isYayasan ? "Calon Donatur (Prospek)" : "Prospek Potensial",
  );
  const [newCatatan, setNewCatatan] = useState("");

  // Daftar opsi status dinamis
  const statusOptions = useMemo(() => {
    if (isYayasan) {
      return [
        "Donatur Tetap",
        "Sudah Transfer Donasi",
        "Konfirmasi Jemput Donasi",
        "Calon Donatur (Prospek)",
        "Titip Doa & Hajat",
        "Perlu Tindak Lanjut",
      ];
    }
    return [
      "Sudah Transfer (Closing)",
      "Pelanggan Setia (Repeat)",
      "Menunggu Pembayaran",
      "Prospek Potensial",
      "Tanya Ongkir & Promo",
      "Perlu Tindak Lanjut",
    ];
  }, [isYayasan]);

  // Filtered contacts
  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      const matchSearch =
        c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.nomor.includes(searchQuery) ||
        c.ringkasanKebutuhan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = filterStatus === "all" || c.status === filterStatus;

      let matchScore = true;
      if (filterScore === "high") matchScore = c.skorMinat >= 80;
      else if (filterScore === "med") matchScore = c.skorMinat >= 60 && c.skorMinat < 80;
      else if (filterScore === "low") matchScore = c.skorMinat < 60;

      return matchSearch && matchStatus && matchScore;
    });
  }, [contacts, searchQuery, filterStatus, filterScore]);

  // Summary Metrics
  const totalContacts = contacts.length;
  const closingOrDonaturCount = contacts.filter(
    (c) =>
      c.status.includes("Donatur Tetap") ||
      c.status.includes("Sudah Transfer") ||
      c.status.includes("Repeat") ||
      c.status.includes("Closing"),
  ).length;

  const highInterestCount = contacts.filter((c) => c.skorMinat >= 80).length;
  const followUpCount = contacts.filter(
    (c) =>
      c.status.includes("Prospek") ||
      c.status.includes("Menunggu") ||
      c.status.includes("Tindak Lanjut") ||
      c.status.includes("Titip Doa") ||
      c.status.includes("Doa"),
  ).length;

  const rataRataSkor = Math.round(
    contacts.reduce((acc, curr) => acc + curr.skorMinat, 0) / (totalContacts || 1),
  );

  // Status Badge Colors
  const getStatusBadge = (status: string) => {
    if (status.includes("Tetap") || status.includes("Closing") || status.includes("Repeat")) {
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
    if (status.includes("Transfer") || status.includes("Jemput")) {
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30";
    }
    if (status.includes("Prospek") || status.includes("Menunggu")) {
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
    if (status.includes("Titip Doa") || status.includes("Doa")) {
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
    }
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
  };

  // Ubah status klien
  const handleUpdateStatus = (id: string, newStat: string) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStat } : c)),
    );
    toast.success(`Status klien berhasil diperbarui menjadi "${newStat}"`);
  };

  // Tambah Kontak Baru
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNomor.trim() || !newNama.trim()) {
      toast.error("Nomor WhatsApp dan Nama Klien wajib diisi!");
      return;
    }
    const created: ClientContact = {
      id: `c-custom-${Date.now()}`,
      nomor: newNomor.trim(),
      nama: newNama.trim(),
      status: newStatus,
      skorMinat: 75,
      totalInteraksi: 1,
      terakhirKontak: "Baru saja",
      ringkasanKebutuhan: newCatatan.trim() || "Kontak ditambahkan secara manual",
    };
    setContacts((prev) => [created, ...prev]);
    toast.success("Kontak klien baru berhasil dicatat!");
    setModalOpen(false);
    setNewNomor("");
    setNewNama("");
    setNewCatatan("");
  };

  // EKSPOR LAPORAN CSV
  const handleExportCSV = () => {
    if (contacts.length === 0) {
      toast.error("Tidak ada data nomor klien untuk diekspor!");
      return;
    }

    // Header CSV
    const headers = [
      "No",
      "Nama Klien",
      "Nomor WhatsApp",
      "Status Klien",
      "Skor Ketertarikan (%)",
      "Kategori Respon",
      "Total Interaksi Chat",
      "Terakhir Kontak",
      "Kebutuhan / Catatan",
      "Nominal Donasi / Order",
    ];

    // Rows
    const rows = contacts.map((c, index) => {
      let kategoriRespon = "Sedang";
      if (c.skorMinat >= 85) kategoriRespon = "Sangat Tinggi";
      else if (c.skorMinat >= 70) kategoriRespon = "Tinggi";
      else if (c.skorMinat < 50) kategoriRespon = "Rendah";

      return [
        index + 1,
        `"${c.nama.replace(/"/g, '""')}"`,
        `"${c.nomor}"`,
        `"${c.status.replace(/"/g, '""')}"`,
        c.skorMinat,
        `"${kategoriRespon}"`,
        c.totalInteraksi,
        `"${c.terakhirKontak}"`,
        `"${c.ringkasanKebutuhan.replace(/"/g, '""')}"`,
        `"${(c.nominal || "-").replace(/"/g, '""')}"`,
      ].join(",");
    });

    // Gabungkan dengan BOM UTF-8 agar Excel membuka karakter dengan sempurna
    const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const dateStr = new Date().toISOString().split("T")[0];
    const fileName = `Laporan_Analisa_Klien_${isYayasan ? "Yayasan" : "Toko"}_${dateStr}.csv`;

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Laporan CSV berhasil diunduh: ${fileName}`);
  };

  return (
    <>
      <PageHeader
        title="Pengelolaan Nomor &amp; Klien"
        description="Analisa nomor pelanggan/donatur, pantau tingkat respon dan closing, serta ekspor laporan data berkala."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="rounded-xl flex items-center gap-2 text-xs border-emerald-500/30 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
            >
              <Download className="size-3.5" />
              <span>Ekspor Laporan (CSV)</span>
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-2 text-xs font-semibold"
            >
              <Plus className="size-3.5" />
              <span>Tambah Kontak</span>
            </Button>
          </div>
        }
      />

      {/* BANNER KLASIFIKASI BISNIS */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-6 flex flex-wrap items-center justify-between gap-3 shadow-xs card-hover-lift">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            {isYayasan ? <HeartHandshake className="size-5" /> : <ShoppingBag className="size-5" />}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-500"></span>
              </span>
              <h2 className="text-xs font-bold text-foreground">
                {isYayasan ? "Kamus Data: Yayasan & Lembaga Sosial" : `Kamus Data: ${tenant?.industri || "Toko & E-Commerce"}`}
              </h2>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-2 py-0.5 rounded-full">
                Sesuai Tipe Bisnis
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isYayasan
                ? "Menilai loyalitas donatur tetap, konfirmasi zakat/sedekah, hingga permohonan titip doa para jamaah & donatur."
                : "Menilai kecepatan closing, repeat order pelanggan setia, dan tindak lanjut keranjang checkout."}
            </p>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
          <Link to="/app/pengaturan">Ganti di Pengaturan</Link>
        </Button>
      </div>

      {/* SUMMARY STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={isYayasan ? "Total Kontak Donatur" : "Total Nomor Pelanggan"}
          value={formatNumber(totalContacts)}
          icon={Users}
          hint="Kontak terdaftar & berinteraksi"
        />
        <StatCard
          label={isYayasan ? "Donatur Tetap & Transfer" : "Closing / Sudah Bayar"}
          value={formatNumber(closingOrDonaturCount)}
          icon={CheckCircle2}
          tone="success"
          hint={isYayasan ? "Donatur aktif menyalurkan" : "Berhasil transaksi closing"}
        />
        <StatCard
          label="Minat Sangat Tinggi"
          value={`${highInterestCount} Kontak`}
          icon={TrendingUp}
          tone="success"
          hint="Skor respon di atas 80%"
        />
        <StatCard
          label="Rata-rata Skor Minat"
          value={`${rataRataSkor}%`}
          icon={Sparkles}
          hint="Tingkat ketertarikan AI"
        />
      </div>

      {/* FILTER & PENCARIAN BAR */}
      <div className="panel mt-6 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2 min-w-[260px] max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, nomor WhatsApp, atau kebutuhan..."
              className="pl-9 h-9 text-xs rounded-xl bg-secondary/30"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Status */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Status:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Status</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Respon */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Respon:</span>
            <select
              value={filterScore}
              onChange={(e) => setFilterScore(e.target.value)}
              className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">Semua Respon</option>
              <option value="high">Sangat Tinggi (&ge;80%)</option>
              <option value="med">Sedang (60-79%)</option>
              <option value="low">Rendah (&lt;60%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABEL DATA NOMOR & KLIEN */}
      <div className="panel mt-4 rounded-2xl overflow-hidden border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="py-3.5 px-4">Kontak &amp; Nomor WA</th>
                <th className="py-3.5 px-4">Klasifikasi / Status</th>
                <th className="py-3.5 px-4">Skor Respon &amp; Minat</th>
                <th className="py-3.5 px-4">Ringkasan Kebutuhan</th>
                <th className="py-3.5 px-4">Interaksi</th>
                <th className="py-3.5 px-4 text-right">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-secondary/20 transition-colors">
                    {/* Kontak & Nomor */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-0.5">
                          {contact.nama.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{contact.nama}</p>
                          <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] mt-0.5">
                            <Phone className="size-3 text-emerald-500" />
                            <span>{contact.nomor}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          contact.status,
                        )}`}
                      >
                        <Tag className="size-3" />
                        {contact.status}
                      </span>
                      {contact.nominal && (
                        <p className="text-[10px] text-muted-foreground font-medium mt-1 font-mono">
                          {contact.nominal}
                        </p>
                      )}
                    </td>

                    {/* Skor Respon */}
                    <td className="py-3.5 px-4 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-foreground font-mono">
                            {contact.skorMinat}%
                          </span>
                          <span
                            className={`font-semibold ${
                              contact.skorMinat >= 80
                                ? "text-emerald-600 dark:text-emerald-400"
                                : contact.skorMinat >= 60
                                  ? "text-blue-600 dark:text-blue-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {contact.skorMinat >= 85
                              ? "Sangat Tinggi"
                              : contact.skorMinat >= 70
                                ? "Tinggi"
                                : "Sedang"}
                          </span>
                        </div>
                        <Progress value={contact.skorMinat} className="h-1.5" />
                      </div>
                    </td>

                    {/* Ringkasan Kebutuhan */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-[11px] text-foreground line-clamp-2 leading-relaxed">
                        {contact.ringkasanKebutuhan}
                      </p>
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">
                        Terakhir: {contact.terakhirKontak}
                      </span>
                    </td>

                    {/* Interaksi */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-foreground bg-secondary/50 px-2 py-0.5 rounded-lg border border-border/40">
                        <MessageSquare className="size-3 text-muted-foreground" />
                        {contact.totalInteraksi} chat
                      </span>
                    </td>

                    {/* Action Ubah Status & WhatsApp */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select
                          value={contact.status}
                          onChange={(e) => handleUpdateStatus(contact.id, e.target.value)}
                          className="h-8 rounded-lg border border-border bg-card px-2 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer transition-colors"
                        >
                          {statusOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <a
                          href={`https://wa.me/${contact.nomor.replace(/[^0-9]/g, "").replace(/^0/, "62")}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka WhatsApp Klien"
                          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white hover:scale-105 transition-all duration-200"
                        >
                          <Phone className="size-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Tidak ada nomor klien yang cocok dengan filter atau kata kunci.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER TABEL */}
        <div className="p-3 border-t border-border/60 bg-secondary/20 flex flex-wrap items-center justify-between text-xs text-muted-foreground">
          <span>
            Menampilkan <strong>{filteredContacts.length}</strong> dari {contacts.length} nomor kontak
          </span>
          <span className="text-[11px]">
            💡 Seluruh data nomor dapat langsung diekspor ke Microsoft Excel atau Spreadsheet.
          </span>
        </div>
      </div>

      {/* DIALOG TAMBAH KONTAK */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground">
              Tambah Kontak Klien Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Catat nomor calon pelanggan atau donatur baru untuk dianalisa oleh sistem Balasin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddContact} className="space-y-3.5 mt-2">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Nama Klien / Donatur <span className="text-red-500">*</span>
              </label>
              <Input
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                placeholder="Contoh: Bpk. Ahmad Dahlan"
                className="h-9 text-xs rounded-xl"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Nomor WhatsApp <span className="text-red-500">*</span>
              </label>
              <Input
                value={newNomor}
                onChange={(e) => setNewNomor(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="h-9 text-xs rounded-xl font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Status / Klasifikasi
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-9 rounded-xl border border-border bg-card px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {statusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Catatan Kebutuhan Singkat
              </label>
              <Input
                value={newCatatan}
                onChange={(e) => setNewCatatan(e.target.value)}
                placeholder={isYayasan ? "Contoh: Tanya rekening santunan yatim" : "Contoh: Tanya produk grosir"}
                className="h-9 text-xs rounded-xl"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
                className="rounded-xl text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold"
              >
                Simpan Kontak
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
