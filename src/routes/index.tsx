import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bot,
  Zap,
  Eye,
  EyeOff,
  ChevronDown,
  LogOut,
  UserPlus,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  Phone,
  Video,
  MoreVertical,
  CheckCheck,
  Store,
  HelpCircle,
  ShieldCheck,
  QrCode,
  TrendingUp,
  Star,
  Clock,
  XCircle,
  MessageSquare,
  Award,
  Check,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AmbientBackground } from "@/components/ui/ambient-background";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE, saveSession } from "@/lib/api-client";
import { getGoogleUser, handleLogout, saveGoogleUser, type GoogleUser } from "@/lib/google-auth";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Balasin — CS AI WhatsApp Otomatis untuk Bisnis Anda" },
      {
        name: "description",
        content:
          "Balas chat pelanggan & respon iklan WhatsApp otomatis 24 jam nonstop dengan kecerdasan buatan. Tanpa bikin calon pembeli menunggu.",
      },
      { property: "og:title", content: "Balasin — CS AI WhatsApp Otomatis untuk Bisnis Anda" },
      {
        name: "og:description",
        content:
          "Sambungkan WhatsApp bisnis, lengkapi profil toko dari template, dan biarkan AI melayani pembeli seketika.",
      },
    ],
  }),
  component: Landing,
});

const fiturBisnis = [
  {
    icon: Zap,
    judul: "Balas Iklan Super Cepat",
    tagline: "Respon < 2 Detik",
    teks: "Saat calon pembeli klik iklan Instagram, TikTok, atau Facebook, bot langsung menyapa ramah dan mengirim katalog sebelum pembeli berpaling ke toko lain.",
    metric: "98% Chat Terjawab Instan",
  },
  {
    icon: Bot,
    judul: "Pintar Jawab Pertanyaan",
    tagline: "Hafal Semua Info Toko",
    teks: "AI otomatis menjawab pertanyaan seputar harga, varian produk, stok, hingga syarat komplain berdasarkan template info yang Anda siapkan.",
    metric: "Multi-Pertanyaan Sekaligus",
  },
  {
    icon: Store,
    judul: "Template Bisnis Siap Pakai",
    tagline: "Tanpa Bingung Menulis",
    teks: "Cukup isi form ringkas: profil toko, jam buka, kurir pengiriman, ketentuan COD, hingga garansi produk. AI langsung memahaminya.",
    metric: "Setup 1 Menit Selesai",
  },
  {
    icon: QrCode,
    judul: "Sambung WhatsApp 1 Menit",
    tagline: "Tinggal Scan QR",
    teks: "Sama mudahnya seperti login WhatsApp Web di komputer. Cukup pindai QR dari ponsel Anda dan sistem langsung aktif melayani.",
    metric: "Tanpa Biaya Server",
  },
  {
    icon: TrendingUp,
    judul: "Naikkan Peluang Penjualan",
    tagline: "Closing Lebih Cepat",
    teks: "Pembeli paling suka toko yang membalas instan. Jangan biarkan chat masuk di tengah malam basi karena CS sedang istirahat.",
    metric: "+45% Rasio Closing",
  },
  {
    icon: ShieldCheck,
    judul: "Data Toko Aman & Privat",
    tagline: "100% Milik Anda",
    teks: "Informasi produk, nomor WhatsApp, dan percakapan pelanggan tersimpan aman dan terenkripsi khusus untuk akun Google Anda.",
    metric: "Enkripsi End-to-End",
  },
];

const langkahMudah = [
  {
    nomor: "01",
    judul: "Pindai QR WhatsApp",
    teks: "Buka menu WhatsApp di ponsel Anda, scan QR code di dashboard. Nomor Anda langsung tersambung secara resmi.",
    badge: "10 Detik",
  },
  {
    nomor: "02",
    judul: "Pilih Template & Isi Info Toko",
    teks: "Pilih template panduan (jam buka, katalog, cara order, pengiriman COD). Tulis apa adanya, AI yang akan menyusun bahasa ramahnya.",
    badge: "Fleksibel",
  },
  {
    nomor: "03",
    judul: "AI Siaga Balas 24 Jam Nonstop",
    teks: "Nyalakan tombol otomatis. Setiap ada pesan baru atau klik dari iklan, bot langsung merespons ramah dan tuntas!",
    badge: "Otomatis 24/7",
  },
];

const simulasiChat = {
  iklan: {
    label: "Balas Iklan Otomatis (CTWA)",
    pesan: [
      {
        pengirim: "user",
        teks: "Halo kak, saya tertarik dengan promo Sneakers Sport di Instagram. Masih diskon?",
        waktu: "13:40",
      },
      {
        pengirim: "bot",
        teks: "Halo Kak! 👋 Salam kenal dari Sneakers Official Store. Promo diskon 30% masih berlaku sampai malam ini ya!",
        waktu: "13:40",
        media: {
          tipe: "gambar",
          label: "📸 Katalog Promo Sneakers Sport 2026.jpg",
          keterangan: "Tersedia ukuran 39 - 44, bahan breathable & sol empuk anti-slip.",
        },
      },
      {
        pengirim: "bot",
        teks: "Rencana mau dikirim ke kota mana kak? Biar sekalian kami bantu cek promo Gratis Ongkirnya ya kak 😊",
        waktu: "13:40",
      },
    ],
  },
  faq: {
    label: "Tanya Jawab Produk (AI)",
    pesan: [
      {
        pengirim: "user",
        teks: "Bisa bayar COD gak kak? Kalau nanti kekecilan apakah boleh ditukar?",
        waktu: "14:15",
      },
      {
        pengirim: "bot",
        teks: "Bisa banget bayar di tempat (COD) kak! Kami bekerjasama dengan kurir J&T Express & SiCepat untuk pembayaran saat barang sampai di rumah 🚚",
        waktu: "14:15",
      },
      {
        pengirim: "bot",
        teks: "Untuk ukuran jangan khawatir ya kak, ada Garansi Tukar Ukuran 7 Hari setelah paket diterima jika ukuran kurang pas, asalkan tag masih utuh. Aman banget kak! Ada yang mau dipesan sekarang kak?",
        waktu: "14:15",
      },
    ],
  },
  lokasi: {
    label: "Jam Buka & Toko Fisik",
    pesan: [
      {
        pengirim: "user",
        teks: "Kak kalau mau datang langsung ke toko bisa? Buka sampai jam berapa ya?",
        waktu: "15:02",
      },
      {
        pengirim: "bot",
        teks: "Bisa banget kak! Toko fisik kami buka setiap hari Senin - Minggu dari jam 09.00 - 21.00 WIB ✨",
        waktu: "15:02",
      },
      {
        pengirim: "bot",
        teks: "📍 Alamat kami: Ruko Boulevard Green No. 12, Jakarta Barat (tersedia parkir luas & free fitting room). Kami tunggu kedatangannya ya kak!",
        waktu: "15:02",
      },
    ],
  },
};

const testimoniList = [
  {
    nama: "Rian Pratama",
    bisnis: "Owner SneakerPoint (Bandung)",
    hasil: "Closing naik 40%",
    isi: "Dulu iklan TikTok boncos karena pas malam hari gak ada yang balas chat pembeli. Pakai Balasin, jam 2 pagi pun langsung direspon dan dikasih katalog. Langsung transfer!",
    bintang: 5,
  },
  {
    nama: "Siti Rahmawati",
    bisnis: "Hijab & Gamis Syari (Solo)",
    hasil: "Hemat 2 CS Manual",
    isi: "Pertanyaan seputar bahan, ukuran LD, sama ongkir COD semuanya dijawab lancar sama AI. Pembeli ngerasa dilayani personal dan ramah banget.",
    bintang: 5,
  },
  {
    nama: "Hendro Wijaya",
    bisnis: "Gadget Accessories (Jakarta)",
    hasil: "Respon < 2 Detik",
    isi: "Scan QR 1 menit langsung jalan. Gak perlu laptop nyala seharian, server mereka yang handle. Ini beneran game changer buat jualan online.",
    bintang: 5,
  },
];

const perbandinganFitur = [
  {
    fitur: "Kecepatan Respon Pesan",
    manual: "15 - 60 Menit (Bisa berjam-jam)",
    balasin: "< 2 Detik (Instan)",
  },
  {
    fitur: "Jam Kerja Operasional",
    manual: "Maksimal 8 - 10 Jam/Hari",
    balasin: "24 Jam Nonstop 7 Hari Penuh",
  },
  {
    fitur: "Konsistensi Jawaban",
    manual: "Sering typo, lelah & lupa promo",
    balasin: "100% Akurat sesuai template toko",
  },
  {
    fitur: "Biaya Operasional",
    manual: "Rp 2,5jt - Rp 4jt / CS per bulan",
    balasin: "Jauh lebih hemat tanpa biaya lembur",
  },
  {
    fitur: "Kapasitas Chat Bersamaan",
    manual: "Maksimal 3-5 chat sekaligus",
    balasin: "Ratusan chat terjawab serentak",
  },
];

const faqItems = [
  {
    q: "Apakah komputer atau laptop saya harus menyala terus?",
    a: "Tidak perlu sama sekali! Sistem Balasin berjalan 100% di cloud server kami. Begitu WhatsApp Anda tersambung lewat scan QR, sistem akan membalas otomatis 24 jam nonstop meskipun ponsel Anda mati atau laptop dimatikan.",
  },
  {
    q: "Apakah saya masih bisa membalas chat secara manual di HP?",
    a: "Bisa banget! Kapan saja Anda mengetik balasan manual di WhatsApp ponsel Anda, sistem AI otomatis memberi prioritas penuh kepada Anda dan tidak akan memotong pembicaraan.",
  },
  {
    q: "Bagaimana jika pembeli bertanya hal di luar info toko?",
    a: "AI Balasin dilatih khusus untuk bersikap sopan. Jika ada pertanyaan spesifik yang belum ada di template, AI akan menjawab secara bijak dan memberitahu pembeli bahwa CS pemilik toko akan segera mengeceknya.",
  },
  {
    q: "Berapa nomor WhatsApp yang bisa disambungkan?",
    a: "Untuk paket standar, 1 akun terhubung ke 1 nomor WhatsApp bisnis aktif. Anda bisa menambah slot nomor tambahan kapan saja melalui dashboard admin.",
  },
  {
    q: "Apakah data pelanggan dan katalog saya aman?",
    a: "Sangat aman dan terisolasi. Percakapan pembeli, data nomor kontak, dan histori katalog Anda diisolasi per akun Google. Kami tidak menjual data pelanggan Anda ke pihak mana pun.",
  },
  {
    q: "Apakah ada biaya tersembunyi atau kontrak mengikat?",
    a: "Tidak ada! Anda bisa mulai gratis tanpa kartu kredit. Anda bebas berhenti kapan saja tanpa komitmen jangka panjang.",
  },
];

const platformLogos = [
  { nama: "WhatsApp Business", label: "WhatsApp Official", icon: "💬" },
  { nama: "Meta Ads (Click-to-WA)", label: "Instagram & FB Ads", icon: "🎯" },
  { nama: "TikTok Ads", label: "TikTok Shop / Ads", icon: "🎵" },
  { nama: "Shopee", label: "Shopee Export Chat", icon: "🛍️" },
  { nama: "Tokopedia", label: "Tokopedia Seller", icon: "📦" },
];

function Landing() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [skenarioAktif, setSkenarioAktif] = useState<"iklan" | "faq" | "lokasi">("iklan");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const googleClickLockRef = useRef(false);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  useEffect(() => {
    const fullTitle = "Balasin — CS AI WhatsApp Otomatis   ";
    const workerScript = `
      const titleText = ${JSON.stringify(fullTitle)};
      const len = titleText.length;
      const speedMs = 220;
      const startTime = Date.now();
      setInterval(() => {
        const elapsed = Date.now() - startTime;
        const charOffset = Math.floor(elapsed / speedMs) % len;
        const currentTitle = titleText.substring(charOffset) + titleText.substring(0, charOffset);
        postMessage(currentTitle);
      }, 100);
    `;
    const blob = new Blob([workerScript], { type: "application/javascript" });
    const blobUrl = URL.createObjectURL(blob);
    const worker = new Worker(blobUrl);
    worker.onmessage = (e) => {
      document.title = e.data;
    };
    return () => {
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const sync = () => {
      setGoogleUser(getGoogleUser());
      setAvatarError(false);
    };
    sync();
    window.addEventListener("balasin:auth-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("balasin:auth-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    setAvatarError(false);
  }, [googleUser?.avatarUrl, googleUser?.picture]);

  const handleGoogleClick = () => {
    if (googleClickLockRef.current) return;
    googleClickLockRef.current = true;
    setOauthError(null);
    try {
      const origin = encodeURIComponent(window.location.origin);
      window.location.href = `${API_BASE}/auth/google?origin=${origin}`;
    } catch {
      setOauthError("Gagal membuka login Google. Coba lagi.");
      toast.error("Gagal membuka login Google");
      googleClickLockRef.current = false;
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !email.includes("@") || password.length < 6) {
      setIsError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }
    setIsError(false);
    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setIsError(true);
    }, 300);
  };

  const avatarSrc = googleUser?.avatarUrl || googleUser?.picture || null;
  const initials = googleUser
    ? googleUser.name
        .split(" ")
        .map((p) => p.charAt(0).toUpperCase())
        .slice(0, 2)
        .join("") || "?"
    : "?";

  return (
    <>
      <AmbientBackground />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. STICKY GLASSMORPHIC MODERN NAVBAR                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl transition-all duration-300 bg-zinc-950/85 dark:bg-zinc-950/85 bg-white/90 border-b border-zinc-800/60 dark:border-zinc-800/80 border-zinc-200/80 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
        {/* Animated Gradient Border Beam at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent animate-border-beam" />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo & Live Status Chip */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img
                  src="/chatbot_wa.png"
                  alt="Balasin Logo"
                  className="h-8 w-8 rounded-lg object-contain transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-md shadow-emerald-500/20"
                />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-100 dark:text-zinc-100 text-zinc-900">
                Balas<span className="text-emerald-400">in</span>
              </span>
            </Link>

            {/* Live Status Badge */}
            <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-400 shadow-inner">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>AI CS Online 24/7</span>
            </div>
          </div>

          {/* Center Navigation Links with Hover Glow */}
          <nav className="hidden items-center gap-1 rounded-full border border-zinc-800/60 bg-zinc-900/60 p-1 text-xs font-semibold text-zinc-300 dark:border-zinc-800/80 dark:bg-zinc-900/60 border-zinc-200/80 bg-zinc-100/80 text-zinc-700 md:flex">
            <a
              href="#fitur"
              className="rounded-full px-3.5 py-1.5 transition-all hover:bg-emerald-500/15 hover:text-emerald-400 dark:hover:text-emerald-400 hover:text-emerald-600"
            >
              Fitur Utama
            </a>
            <a
              href="#perbandingan"
              className="rounded-full px-3.5 py-1.5 transition-all hover:bg-emerald-500/15 hover:text-emerald-400 dark:hover:text-emerald-400 hover:text-emerald-600"
            >
              Kenapa Balasin?
            </a>
            <a
              href="#simulasi"
              className="rounded-full px-3.5 py-1.5 transition-all hover:bg-emerald-500/15 hover:text-emerald-400 dark:hover:text-emerald-400 hover:text-emerald-600"
            >
              Simulasi Chat
            </a>
            <a
              href="#testimoni"
              className="rounded-full px-3.5 py-1.5 transition-all hover:bg-emerald-500/15 hover:text-emerald-400 dark:hover:text-emerald-400 hover:text-emerald-600"
            >
              Testimoni
            </a>
            <a
              href="#faq"
              className="rounded-full px-3.5 py-1.5 transition-all hover:bg-emerald-500/15 hover:text-emerald-400 dark:hover:text-emerald-400 hover:text-emerald-600"
            >
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="size-9 rounded-xl border border-zinc-800 hover:border-emerald-500/40" />

            {googleUser ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex cursor-pointer items-center gap-2.5 rounded-full border border-emerald-500/30 bg-zinc-900/80 p-1 pr-3 transition-all hover:border-emerald-500/60 hover:bg-zinc-800 focus-visible:outline-none shadow-sm">
                  <span className="relative flex size-8 shrink-0">
                    {avatarSrc && !avatarError ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="size-8 rounded-full object-cover ring-2 ring-emerald-500/30"
                      />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-400">
                        {initials}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-sm font-semibold sm:inline-block text-zinc-100">
                    {googleUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="size-3.5 text-zinc-400" />
                </button>
                {isOpen && (
                  <div className="absolute top-full right-0 z-50 pt-2">
                    <div className="w-56 rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl backdrop-blur-xl">
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-bold text-zinc-100">{googleUser.name}</p>
                        <p className="mt-0.5 truncate text-xs text-zinc-400">
                          {googleUser.email}
                        </p>
                      </div>
                      <div className="-mx-1 my-1.5 h-px bg-zinc-800" />
                      <Link
                        to="/app"
                        onClick={() => setIsOpen(false)}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-emerald-400 outline-none hover:bg-emerald-500/10 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Buka Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowLogin(true);
                        }}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-zinc-300 outline-none hover:bg-zinc-900 transition-colors"
                      >
                        <UserPlus className="size-4" />
                        Tambahkan Akun lain
                      </button>
                      <button
                        onClick={() => handleLogout()}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-red-400 outline-none hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="size-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLogin(true)}
                  className="hidden cursor-pointer text-sm font-semibold text-zinc-300 transition-colors hover:text-emerald-400 dark:text-zinc-300 dark:hover:text-emerald-400 text-zinc-700 hover:text-emerald-600 sm:inline-block"
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    if (googleUser) {
                      navigate({ to: "/app" });
                    } else {
                      setShowLogin(true);
                    }
                  }}
                  className="relative group overflow-hidden flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 px-4 py-2 text-sm font-bold text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all hover:scale-105 hover:shadow-[0_0_28px_rgba(52,211,153,0.6)] active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span>Mulai Sekarang</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <style>{`
            @keyframes shake {
              0%, 100% { transform: translateX(0); }
              10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
              20%, 40%, 60%, 80% { transform: translateX(5px); }
            }
            .shake-animation {
              animation: shake 0.5s ease-in-out;
            }
          `}</style>
          <DialogHeader className="items-center">
            <div className="mb-2">
              <BrandLogo size="lg" />
            </div>
            <DialogTitle className="text-center text-xl font-semibold">
              Masuk dengan Akun Google
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Akses dashboard CS AI WhatsApp bisnis Anda
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleManualLogin}
            className={`space-y-4 pt-2 ${isShaking ? "shake-animation" : ""}`}
          >
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="Email bisnis atau pribadi"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isError) setIsError(false);
                }}
                className={isError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">
                Kata Sandi
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (isError) setIsError(false);
                  }}
                  className={isError ? "border-red-500 focus-visible:ring-red-500" : ""}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {isError && (
                <p className="mt-1 text-xs leading-tight text-red-500">
                  Email atau kata sandi tidak cocok. Gunakan tombol Google di bawah untuk akses
                  langsung.
                </p>
              )}
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-background px-2 text-xs text-muted-foreground">
                ATAU
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium shadow-xs transition-colors hover:bg-accent"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Lanjutkan dengan Akun Google</span>
            </button>
            {oauthError && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-tight text-amber-600 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                {oauthError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-[#1a73e8] font-medium text-white hover:bg-[#1557b0]"
            >
              Masuk
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background text-foreground">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. HERO SECTION — Animated Split Layout with Floating Cards */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-12 pb-20 tech-grid-bg">
          {/* Ambient Glowing Orbs */}
          <div className="pointer-events-none absolute top-10 left-1/4 h-[350px] w-[500px] rounded-full bg-emerald-500/15 blur-[130px] animate-pulse-glow" />
          <div className="pointer-events-none absolute top-32 right-10 h-[300px] w-[450px] rounded-full bg-teal-500/15 blur-[120px] animate-pulse-glow" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
              {/* Left Column: Copywriting & Social Proof */}
              <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
                {/* Announcement Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-400 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400 animate-spin" style={{ animationDuration: "8s" }} />
                  <span>Teknologi AI CS WhatsApp untuk Penjual Online</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                  CS WhatsApp Pintar{" "}
                  <br className="hidden sm:inline" />
                  <span className="hero-glimmer">
                    Balas Otomatis 24 Jam
                  </span>{" "}
                  Nonstop.
                </h1>

                {/* Description */}
                <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                  Tingkatkan omset toko Anda. AI ramah yang otomatis merespons klik iklan TikTok &
                  Instagram Ads, melayani tanya-jawab produk, dan closing pembeli seketika dalam hitungan detik.
                </p>

                {/* Primary CTA Area */}
                <div className="flex flex-col items-center gap-4 pt-2 sm:flex-row lg:justify-start">
                  <button
                    onClick={() => {
                      if (googleUser) {
                        navigate({ to: "/app" });
                      } else {
                        setShowLogin(true);
                      }
                    }}
                    className="cta-button group flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 px-8 py-4 text-base font-extrabold text-zinc-950 shadow-[0_0_30px_rgba(52,211,153,0.45)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(52,211,153,0.7)] sm:w-auto"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M21.35 11.1h-9.17v2.73h5.51c-.33 2.11-2.18 3.67-4.51 3.67-2.7 0-4.9-2.2-4.9-4.9s2.2-4.9 4.9-4.9c1.21 0 2.31.45 3.16 1.19l2.05-2.05C16.98 5.46 14.65 4.6 12 4.6 7.8 4.6 4.4 8 4.4 12.2s3.4 7.6 7.6 7.6c4.39 0 7.3-3.08 7.3-7.44 0-.58-.05-1.01-.15-1.26z"
                      />
                    </svg>
                    <span>Hubungkan WhatsApp Sekarang</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </button>

                  <a
                    href="#simulasi"
                    className="rounded-full border border-zinc-700/80 bg-zinc-900/60 px-5 py-3.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-emerald-500/40 hover:bg-zinc-800 hover:text-white"
                  >
                    Lihat Contoh Simulasi
                  </a>
                </div>

                {/* Rating & Trust Ribbon */}
                <div className="flex flex-col items-center justify-center gap-3 pt-2 text-xs text-muted-foreground sm:flex-row lg:justify-start">
                  <div className="flex -space-x-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-2 ring-background">
                      RP
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-2 ring-background">
                      SR
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-600 text-[10px] font-bold text-white ring-2 ring-background">
                      HW
                    </span>
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white ring-2 ring-background">
                      +1k
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-foreground">4.9/5</span>
                    <span>dari 1.200+ Penjual Online & UMKM</span>
                  </div>
                </div>

                {/* Highlights Trio */}
                <div className="grid grid-cols-3 gap-4 border-t border-border/80 pt-6 text-left">
                  <div>
                    <strong className="block text-lg font-black text-emerald-400">100%</strong>
                    <span className="text-xs text-muted-foreground">Cloud Server Tanpa Mati</span>
                  </div>
                  <div>
                    <strong className="block text-lg font-black text-emerald-400">&lt; 2 Detik</strong>
                    <span className="text-xs text-muted-foreground">Kecepatan Balas Iklan</span>
                  </div>
                  <div>
                    <strong className="block text-lg font-black text-emerald-400">1 Menit</strong>
                    <span className="text-xs text-muted-foreground">Tinggal Scan QR</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Phone Mockup with 3 Dynamic Floating Badges */}
              <div className="relative flex justify-center lg:col-span-5">
                {/* Floating Badge 1 (Top Left): Live Chat Incoming */}
                <div className="absolute -top-6 -left-6 z-20 hidden items-center gap-3 rounded-2xl border border-zinc-700/80 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-xl animate-float-delayed sm:flex">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-lg">
                    💬
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-100">Chat Iklan Masuk</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    </div>
                    <p className="text-[10px] text-zinc-400">"Sneakers 42 promo diskon ada?"</p>
                  </div>
                </div>

                {/* Floating Badge 2 (Bottom Right): Instant Response */}
                <div className="absolute -bottom-6 -right-6 z-20 hidden items-center gap-3 rounded-2xl border border-emerald-500/40 bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-xl animate-float sm:flex">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400 font-bold text-zinc-950">
                    ⚡
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                      <span>Terbalas 0.8 Detik</span>
                      <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                    </div>
                    <p className="text-[10px] text-zinc-400">Katalog + Cek Ongkir Terkirim</p>
                  </div>
                </div>

                {/* Floating Badge 3 (Bottom Center): Order Conversion */}
                <div className="absolute -bottom-4 left-6 z-20 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-zinc-900/95 px-3 py-1.5 text-[10px] font-bold text-emerald-300 shadow-xl backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>💰 Order Masuk: Rp 389.000 (COD)</span>
                </div>

                {/* The Phone Container with gentle float */}
                <div className="w-full max-w-[350px] rounded-[42px] border-4 border-zinc-700/80 bg-zinc-800 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] animate-float">
                  {/* Phone Speaker Notch */}
                  <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-zinc-700" />

                  {/* Inner Phone Screen */}
                  <div className="flex w-full flex-col overflow-hidden rounded-[30px] bg-[#0b141a] text-xs font-sans">
                    {/* WhatsApp App Header */}
                    <div className="flex items-center gap-3 border-b border-zinc-800 bg-[#1f2c34] px-4 py-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-sm">
                        👟
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-zinc-100">Sneakers Official Store</p>
                        <p className="text-[10px] font-medium text-emerald-400">Online &bull; Balas Otomatis AI</p>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Phone className="h-3.5 w-3.5" />
                        <MoreVertical className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Chat Messages Body */}
                    <div className="min-h-[330px] space-y-3 bg-[#0b141a] p-3">
                      <div className="my-1 text-center">
                        <span className="rounded-md bg-[#182229] px-2 py-0.5 text-[9px] text-zinc-400">Hari Ini</span>
                      </div>

                      {/* Incoming Customer */}
                      <div className="flex justify-start">
                        <div className="relative max-w-[85%] rounded-lg rounded-tl-none bg-[#202c33] p-2.5 text-zinc-200 shadow-sm">
                          <p>Halo min, promo diskon sepatu sportnya masih ada?</p>
                          <span className="mt-1 block text-right text-[9px] text-zinc-400">13:40</span>
                        </div>
                      </div>

                      {/* Outgoing AI Bot */}
                      <div className="flex justify-end">
                        <div className="relative max-w-[85%] rounded-lg rounded-tr-none bg-[#005c4b] p-2.5 text-zinc-100 shadow-sm">
                          <p className="mb-0.5 font-semibold text-emerald-200">Halo Kak! 👋</p>
                          <p>Promo diskon 30% masih berlaku sampai malam ini ya. Ukuran ready 39-44.</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-emerald-300">
                            <span>13:40</span>
                            <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                          </div>
                        </div>
                      </div>

                      {/* Outgoing Follow-up */}
                      <div className="flex justify-end">
                        <div className="relative max-w-[85%] rounded-lg rounded-tr-none bg-[#005c4b] p-2.5 text-zinc-100 shadow-sm">
                          <p>Rencana mau dikirim ke kota mana kak? Biar sekalian kami bantu cek promo Gratis Ongkirnya ya kak 😊</p>
                          <div className="mt-1 flex items-center justify-end gap-1 text-[9px] text-emerald-300">
                            <span>13:40</span>
                            <CheckCheck className="h-3.5 w-3.5 text-sky-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dummy Input Field */}
                    <div className="flex items-center gap-2 border-t border-zinc-800 bg-[#202c33] p-2">
                      <div className="flex-1 rounded-full bg-[#2a3942] px-3 py-1.5 text-[10px] text-zinc-500">
                        Ketik pesan...
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 font-bold text-zinc-950">
                        ➤
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 3. PLATFORM INTEGRATION TICKER                            */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="border-y border-border bg-card/30 py-8">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Terintegrasi Mulus dengan Ekosistem Penjualan Anda
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8">
              {platformLogos.map((p) => (
                <div
                  key={p.nama}
                  className="flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-xs font-semibold text-foreground shadow-xs transition-all hover:border-emerald-500/40 hover:bg-card"
                >
                  <span className="text-base">{p.icon}</span>
                  <span>{p.nama}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 4. SOCIAL PROOF & KEY METRICS BAR                         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="py-16">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-6 sm:grid-cols-4">
            {[
              { value: "< 2 Detik", label: "Kecepatan Respon", desc: "Langsung balas saat calon pembeli chat" },
              { value: "24/7", label: "Respon Nonstop", desc: "Siaga tengah malam & hari libur" },
              { value: "100%", label: "Cloud Based", desc: "Ponsel & laptop bebas dimatikan" },
              { value: "+45%", label: "Peningkatan Closing", desc: "Calon pembeli gak kabur ke toko lain" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 text-center shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/30"
              >
                <p className="text-3xl font-black text-emerald-400 sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm font-bold text-foreground">{stat.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 5. COMPARISON MATRIX: CS MANUAL VS BALASIN AI             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="perbandingan" className="py-20 bg-card/20 border-y border-border">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Perbandingan Nyata
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                Kenapa Harus Beralih ke Balasin AI?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Lihat perbedaan signifikan performa CS Manual konvensional dibandingkan dengan CS AI Balasin.
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl">
              <div className="grid grid-cols-12 border-b border-border bg-muted/60 p-4 text-xs font-bold uppercase tracking-wider sm:p-5 sm:text-sm">
                <div className="col-span-4 text-muted-foreground">Kriteria</div>
                <div className="col-span-4 text-red-500">CS Manual Konvensional</div>
                <div className="col-span-4 text-emerald-400">Balasin CS AI ✨</div>
              </div>

              <div className="divide-y divide-border text-xs sm:text-sm">
                {perbandinganFitur.map((item, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-12 items-center p-4 transition-colors hover:bg-muted/30 sm:p-5"
                  >
                    <div className="col-span-4 font-semibold text-foreground">
                      {item.fitur}
                    </div>
                    <div className="col-span-4 flex items-center gap-2 text-muted-foreground">
                      <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                      <span>{item.manual}</span>
                    </div>
                    <div className="col-span-4 flex items-center gap-2 font-bold text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                      <span>{item.balasin}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 6. INTERACTIVE CHAT SIMULATOR                             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="simulasi" className="mx-auto max-w-5xl px-6 py-24">
          <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-2xl backdrop-blur-xl md:p-8">
            <div className="mx-auto mb-8 max-w-xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Simulasi Langsung
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">
                Coba & Rasakan Chat Balasin Bekerja
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Klik tab skenario di bawah untuk melihat bagaimana AI menjawab chat pelanggan dengan bahasa ramah dan katalog visual.
              </p>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {(Object.keys(simulasiChat) as Array<keyof typeof simulasiChat>).map((key) => {
                const item = simulasiChat[key];
                const active = skenarioAktif === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSkenarioAktif(key)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:text-sm ${
                      active
                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {key === "iklan" && <Zap className="size-4" />}
                    {key === "faq" && <HelpCircle className="size-4" />}
                    {key === "lokasi" && <Store className="size-4" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Realistic WhatsApp Mockup Frame */}
            <div className="mx-auto max-w-md overflow-hidden rounded-2xl border border-border bg-[#e5ddd5] shadow-2xl dark:bg-[#0b141a]">
              {/* App Bar */}
              <div className="flex items-center justify-between bg-[#075e54] px-4 py-3 text-white dark:bg-[#202c33]">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex size-10 items-center justify-center rounded-full bg-emerald-700 text-sm font-bold text-white">
                      👟
                    </div>
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#075e54] bg-emerald-400 dark:border-[#202c33]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-tight">Toko Sneakers Official</h3>
                    <p className="text-[11px] leading-tight text-emerald-200 dark:text-emerald-400">
                      Online • Balas Otomatis Aktif
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="size-4 cursor-pointer hover:text-white" />
                  <Video className="size-4 cursor-pointer hover:text-white" />
                  <MoreVertical className="size-4 cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex min-h-[340px] flex-col justify-end space-y-3 bg-[radial-gradient(#0000000a_1px,transparent_1px)] p-4 [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)]">
                <div className="my-1 text-center">
                  <span className="rounded-md bg-white/80 px-2.5 py-1 text-[10px] text-muted-foreground shadow-xs dark:bg-[#182229]">
                    Hari ini
                  </span>
                </div>

                {simulasiChat[skenarioAktif].pesan.map((msg, idx) => {
                  const isUser = msg.pengirim === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? "rounded-tr-xs bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-white"
                            : "rounded-tl-xs bg-white text-gray-900 dark:bg-[#202c33] dark:text-gray-100"
                        }`}
                      >
                        {"media" in msg && msg.media && (
                          <div className="mb-2 rounded-xl border border-black/10 bg-black/5 p-2 text-center dark:border-white/10 dark:bg-white/5">
                            <span className="block text-[11px] font-medium">
                              {(msg.media as { label: string }).label}
                            </span>
                            <span className="mt-0.5 block text-[10px] text-muted-foreground">
                              {(msg.media as { keterangan: string }).keterangan}
                            </span>
                          </div>
                        )}
                        <p>{msg.teks}</p>
                        <div
                          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                            isUser
                              ? "text-emerald-700 dark:text-emerald-200"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span>{msg.waktu}</span>
                          <CheckCheck className="size-3 text-[#53bdeb]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chat Input Bar */}
              <div className="flex items-center gap-2 border-t border-black/5 bg-[#f0f2f5] p-2.5 dark:border-white/5 dark:bg-[#202c33]">
                <input
                  type="text"
                  readOnly
                  placeholder="Ketik pesan WhatsApp..."
                  className="flex-1 rounded-full bg-white px-4 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground dark:bg-[#2a3942]"
                />
                <button
                  type="button"
                  className="flex size-8 items-center justify-center rounded-full bg-[#00a884] text-white shadow-xs"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 7. BENTO GRID FEATURES                                    */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="fitur" className="py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Fitur Lengkap
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                Didesain Spesifik untuk Penjual Online
              </h2>
              <p className="mt-3 text-sm text-muted-foreground sm:text-base">
                Semua instrumen yang Anda butuhkan untuk meningkatkan omset dan melayani ribuan pembeli tanpa repot.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {fiturBisnis.map((f, idx) => {
                const isWide = idx === 0 || idx === 5;
                return (
                  <div
                    key={f.judul}
                    className={`feature-card group relative overflow-hidden rounded-3xl border border-border bg-card/60 p-8 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-xl ${
                      isWide ? "md:col-span-2" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="feature-icon flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                        <f.icon className="size-6" />
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
                        {f.tagline}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-foreground">{f.judul}</h3>
                    <p className={`text-sm leading-relaxed text-muted-foreground ${isWide ? "max-w-xl" : ""}`}>
                      {f.teks}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <Check className="h-4 w-4" />
                      <span>{f.metric}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 8. TESTIMONIALS / PROVEN SUCCESS                          */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="testimoni" className="py-20 border-y border-border bg-card/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Kisah Sukses
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
                Dipercaya oleh Penjual Online di Seluruh Indonesia
              </h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Cerita nyata mereka yang omsetnya melesat setelah menggunakan Balasin AI.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {testimoniList.map((t, idx) => (
                <div
                  key={idx}
                  className="flex flex-col justify-between rounded-3xl border border-border bg-card p-7 shadow-sm transition-all hover:border-emerald-500/40 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex text-amber-400 mb-4">
                      {[...Array(t.bintang)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-300 dark:text-zinc-300 text-zinc-700">
                      "{t.isi}"
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-foreground text-sm">{t.nama}</h4>
                        <p className="text-xs text-muted-foreground">{t.bisnis}</p>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                        {t.hasil}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 9. HOW IT WORKS — 3 Steps                                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="cara-kerja" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Sangat Mudah
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
              3 Langkah Praktis untuk Memulai
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tidak perlu keahlian koding atau sewa server. Sambungkan nomor Anda dan bot langsung aktif.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {langkahMudah.map((step) => (
              <div
                key={step.nomor}
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card/60 p-7 shadow-sm transition-all hover:border-emerald-500/50 hover:bg-card"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-3xl font-black text-emerald-400/30">
                      {step.nomor}
                    </span>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">{step.judul}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.teks}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 10. FAQ ACCORDION                                         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="faq" className="border-t border-border py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Punya Pertanyaan?
              </span>
              <h2 className="mt-1 text-3xl font-extrabold text-foreground sm:text-4xl">
                Pertanyaan Sering Diajukan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Semua hal yang perlu Anda ketahui sebelum menggunakan Balasin.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-2xl border border-border bg-card/40 p-5 shadow-xs transition-all hover:border-emerald-500/30 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-semibold text-foreground">
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 transition duration-300 group-open:-rotate-180">
                      <ChevronDown className="size-5 text-emerald-400" />
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 11. FINAL HIGH-CONVERSION CTA BANNER                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-8 text-center text-white shadow-2xl md:p-14">
            {/* Background Glows */}
            <div className="pointer-events-none absolute -top-12 -right-12 size-60 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-60 rounded-full bg-black/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Mulai Gratis Hari Ini
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl leading-tight">
                Siap Melayani Pelanggan 24 Jam Tanpa Pegal?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-emerald-100 sm:text-base">
                Sambungkan WhatsApp Anda sekarang. Biarkan AI membalas pesan pembeli secepat kilat
                sehingga omset penjualan bisnis Anda terus mengalir tanpa henti.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-white px-8 py-6 font-extrabold text-emerald-900 shadow-xl transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95 text-base"
                  onClick={() => {
                    if (googleUser) {
                      navigate({ to: "/app" });
                    } else {
                      setShowLogin(true);
                    }
                  }}
                  type="button"
                >
                  Hubungkan WhatsApp Sekarang
                  <ArrowRight className="ml-2 size-5" />
                </Button>
              </div>

              <p className="mt-4 text-xs text-emerald-200">
                ✓ Setup 1 Menit &bull; Tanpa Kartu Kredit &bull; Tanpa Sewa Server
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 12. FOOTER                                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <footer className="border-t border-border/60 py-12 bg-card/20">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/chatbot_wa.png" alt="Balasin" className="h-7 w-7 rounded-lg object-contain" />
              <span className="text-base font-bold text-foreground">
                Balas<span className="text-emerald-400">in</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Balasin — Solusi Customer Service AI WhatsApp untuk UMKM & Penjual Online.
            </p>

            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="#" className="transition-colors hover:text-emerald-400">Syarat & Ketentuan</a>
              <a href="#" className="transition-colors hover:text-emerald-400">Kebijakan Privasi</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
