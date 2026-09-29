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
  KeyRound,
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
    foto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face",
  },
  {
    nama: "Siti Rahmawati",
    bisnis: "Hijab & Gamis Syari (Solo)",
    hasil: "Hemat 2 CS Manual",
    isi: "Pertanyaan seputar bahan, ukuran LD, sama ongkir COD semuanya dijawab lancar sama AI. Pembeli ngerasa dilayani personal dan ramah banget.",
    bintang: 5,
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face",
  },
  {
    nama: "Hendro Wijaya",
    bisnis: "Gadget Accessories (Jakarta)",
    hasil: "Respon < 2 Detik",
    isi: "Scan QR 1 menit langsung jalan. Gak perlu laptop nyala seharian, server mereka yang handle. Ini beneran game changer buat jualan online.",
    bintang: 5,
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face",
  },
  {
    nama: "Dewi Lestari",
    bisnis: "Glow Skincare Official (Surabaya)",
    hasil: "Konversi Iklan +55%",
    isi: "Iklan Meta CTWA jadi maksimal banget hasilnya. Customer yang tanya variasi paket langsung dijelaskan detail lengkap dengan panduan pakai.",
    bintang: 5,
    foto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face",
  },
  {
    nama: "Budi Santoso",
    bisnis: "Kopi Nusantara Roastery (Malang)",
    hasil: "Order COD Melesat",
    isi: "Pelanggan paling suka toko yang fast respon. Pembeli repeat order makin banyak karena bot sigap kasih info promo terbaru setiap saat.",
    bintang: 5,
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face",
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
    q: "Bagaimana cara mendapatkan kode lisensi dan aktivasi bot WhatsApp?",
    a: "Sangat mudah! Lisensi dan aktivasi akun didapatkan resmi langsung dari Admin melalui WhatsApp. Anda cukup login dengan akun Google, lalu klik tombol 'Chat Admin untuk Aktivasi'. Admin akan memberikan kode lisensi resmi yang bisa langsung Anda masukkan di dashboard.",
  },
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
    a: "Untuk paket standar, 1 akun terhubung ke 1 nomor WhatsApp bisnis aktif. Anda bisa menambah slot nomor tambahan kapan saja dengan menghubungi Admin via WhatsApp.",
  },
  {
    q: "Apakah data pelanggan dan katalog saya aman?",
    a: "Sangat aman dan terisolasi. Percakapan pembeli, data nomor kontak, dan histori katalog Anda diisolasi per akun Google. Kami tidak menjual data pelanggan Anda ke pihak mana pun.",
  },
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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

  // Platform items with official SVGs and animations
  const platformItems = [
    {
      nama: "TikTok Shop & Ads",
      desc: "Balas Chat Otomatis",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-md shadow-cyan-500/20 animate-spin-slow">
          <svg className="size-5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.102a2.895 2.895 0 0 1 2.373-4.512c.277 0 .542.039.794.111V9.41a6.326 6.326 0 0 0-.794-.05 6.339 6.339 0 0 0-6.34 6.34 6.34 6.34 0 0 0 10.68 4.606l.128-.127a6.3 6.3 0 0 0 1.872-4.479V8.402a8.214 8.214 0 0 0 4.771 1.733V6.69c-.334-.002-.668-.004-1-.004z" />
          </svg>
        </div>
      ),
    },
    {
      nama: "WhatsApp Business",
      desc: "Pusat CS & Transaksi",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white shadow-md shadow-emerald-500/30 animate-wiggle">
          <svg className="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.162.043.222-.026.06-.068.256-.298.324-.4.068-.102.137-.085.23-.051.094.034.596.281.698.332.102.051.17.077.196.12.025.042.025.247-.119.652z" />
          </svg>
        </div>
      ),
    },
    {
      nama: "Meta Ads (Click-to-WA)",
      desc: "Instagram & Facebook",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md shadow-pink-500/20 animate-pulse-glow">
          <svg className="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </div>
      ),
    },
    {
      nama: "Shopee Seller Export",
      desc: "Katalog & Pengiriman",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EE4D2D] to-[#ff7337] text-white shadow-md shadow-orange-500/20 animate-wiggle">
          <svg className="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M19.98 10.82c-.05-.28-.27-.49-.55-.52l-3.32-.32-1.39-3.03c-.23-.51-.92-.51-1.15 0L12.18 10l-3.32.32c-.28.03-.5.24-.55.52-.05.28.07.57.3.73l2.49 1.79-.81 3.24c-.08.31.06.63.33.78.27.16.61.12.84-.09l2.74-2.45 2.74 2.45c.16.14.36.21.57.21.09 0 .19-.02.27-.06.27-.15.41-.47.33-.78l-.81-3.24 2.49-1.79c.23-.16.35-.45.3-.73z" />
          </svg>
        </div>
      ),
    },
    {
      nama: "Tokopedia Merchant",
      desc: "Info Stok & Variasi",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#03AC0E] to-[#42b549] text-white shadow-md shadow-emerald-500/20 animate-float-delayed">
          <svg className="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15.5h-2v-7h2v7zm4 0h-2v-7h2v7zm-2-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
          </svg>
        </div>
      ),
    },
    {
      nama: "Facebook Marketplace",
      desc: "Respon Kilat Iklan",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md shadow-blue-500/20 animate-spin-slow">
          <svg className="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <>
      <AmbientBackground />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 1. BRIGHT & CLEAN GLASSMORPHIC NAVBAR (CLEAN ORIGINAL)    */}
      {/* ══════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl transition-all duration-300 bg-white/95 dark:bg-zinc-900/95 border-b border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_25px_-5px_rgba(0,0,0,0.3)]">
        {/* Animated Gradient Border Beam at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent animate-border-beam" />

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo (Original Clean) */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/chatbot_wa.png"
              alt="Balasin Logo"
              className="h-8 w-8 rounded-lg object-contain transition-all duration-300 group-hover:scale-105 shadow-xs"
            />
            <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
              Balas<span className="text-emerald-500">in</span>
            </span>
          </Link>

          {/* Center Navigation Links (Clean Original Layout) */}
          <nav className="hidden items-center gap-1 rounded-full border border-zinc-200/80 bg-zinc-100/90 dark:border-zinc-700/80 dark:bg-zinc-800/80 p-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200 md:flex shadow-xs">
            <a
              href="#fitur"
              onClick={(e) => handleNavClick(e, "fitur")}
              className="rounded-full px-4 py-1.5 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xs dark:hover:bg-zinc-700 dark:hover:text-emerald-400"
            >
              Fitur
            </a>
            <a
              href="#simulasi"
              onClick={(e) => handleNavClick(e, "simulasi")}
              className="rounded-full px-4 py-1.5 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xs dark:hover:bg-zinc-700 dark:hover:text-emerald-400"
            >
              Simulasi
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => handleNavClick(e, "cara-kerja")}
              className="rounded-full px-4 py-1.5 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xs dark:hover:bg-zinc-700 dark:hover:text-emerald-400"
            >
              Cara Kerja
            </a>
            <a
              href="#testimoni"
              onClick={(e) => handleNavClick(e, "testimoni")}
              className="rounded-full px-4 py-1.5 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xs dark:hover:bg-zinc-700 dark:hover:text-emerald-400"
            >
              Testimoni
            </a>
            <a
              href="#faq"
              onClick={(e) => handleNavClick(e, "faq")}
              className="rounded-full px-4 py-1.5 transition-all hover:bg-white hover:text-emerald-600 hover:shadow-xs dark:hover:bg-zinc-700 dark:hover:text-emerald-400"
            >
              FAQ
            </a>
          </nav>

          {/* Action Buttons (Original Clean Layout) */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="size-9 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:border-emerald-500/40 shadow-xs" />

            {googleUser ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex cursor-pointer items-center gap-2.5 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-1 pr-3 transition-all hover:border-emerald-500/60 hover:bg-zinc-50 dark:hover:bg-zinc-700 focus-visible:outline-none shadow-xs">
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
                      <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {initials}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-sm font-semibold sm:inline-block text-zinc-800 dark:text-zinc-100">
                    {googleUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="size-3.5 text-zinc-500 dark:text-zinc-400" />
                </button>
                {isOpen && (
                  <div className="absolute top-full right-0 z-50 pt-2">
                    <div className="w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-2xl backdrop-blur-xl">
                      <div className="px-2.5 py-2">
                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{googleUser.name}</p>
                        <p className="mt-0.5 truncate text-xs text-zinc-500 dark:text-zinc-400">
                          {googleUser.email}
                        </p>
                      </div>
                      <div className="-mx-1 my-1.5 h-px bg-zinc-200 dark:bg-zinc-800" />
                      <Link
                        to="/app"
                        onClick={() => setIsOpen(false)}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400 outline-none hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <LayoutDashboard className="size-4" />
                        Buka Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowLogin(true);
                        }}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-zinc-700 dark:text-zinc-300 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <UserPlus className="size-4" />
                        Tambahkan Akun lain
                      </button>
                      <button
                        onClick={() => handleLogout()}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-sm text-red-500 dark:text-red-400 outline-none hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
                  className="hidden cursor-pointer text-sm font-bold text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-200 dark:hover:text-emerald-400 sm:inline-block"
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
                  className="relative group overflow-hidden flex cursor-pointer items-center gap-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95"
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
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold tracking-wide text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-spin" style={{ animationDuration: "8s" }} />
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
                  Tingkatkan omset toko Anda. AI ramah yang otomatis merespons klik iklan TikTok &amp;
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

                  {/* Chat Admin WhatsApp Button */}
                  <a
                    href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20WhatsApp%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-50/80 dark:bg-emerald-950/40 px-5 py-3.5 text-sm font-bold text-emerald-700 dark:text-emerald-300 transition-all hover:scale-105 hover:bg-emerald-100 shadow-xs"
                  >
                    <svg className="h-4 w-4 fill-current text-[#25D366]" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.162.043.222-.026.06-.068.256-.298.324-.4.068-.102.137-.085.23-.051.094.034.596.281.698.332.102.051.17.077.196.12.025.042.025.247-.119.652z" />
                    </svg>
                    <span>Chat Admin untuk Aktivasi</span>
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
                    <span>dari 1.200+ Penjual Online &amp; UMKM</span>
                  </div>
                </div>

                {/* Highlights Trio */}
                <div className="grid grid-cols-3 gap-4 border-t border-border/80 pt-6 text-left">
                  <div>
                    <strong className="block text-lg font-black text-emerald-500">100%</strong>
                    <span className="text-xs text-muted-foreground">Cloud Server Tanpa Mati</span>
                  </div>
                  <div>
                    <strong className="block text-lg font-black text-emerald-500">&lt; 2 Detik</strong>
                    <span className="text-xs text-muted-foreground">Kecepatan Balas Iklan</span>
                  </div>
                  <div>
                    <strong className="block text-lg font-black text-emerald-500">1 Menit</strong>
                    <span className="text-xs text-muted-foreground">Tinggal Scan QR</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Phone Mockup with 3 Dynamic Floating Badges */}
              <div className="relative flex justify-center lg:col-span-5">
                {/* Floating Badge 1 (Top Left): Live Chat Incoming */}
                <div className="absolute -top-6 -left-6 z-20 hidden items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-xl animate-float-delayed sm:flex">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-lg">
                    💬
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100">Chat Iklan Masuk</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">"Sneakers 42 promo diskon ada?"</p>
                  </div>
                </div>

                {/* Floating Badge 2 (Bottom Right): Instant Response */}
                <div className="absolute -bottom-6 -right-6 z-20 hidden items-center gap-3 rounded-2xl border border-emerald-500/40 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-xl animate-float sm:flex">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
                    ⚡
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Terbalas 0.8 Detik</span>
                      <CheckCheck className="h-3.5 w-3.5 text-sky-500" />
                    </div>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Katalog + Cek Ongkir Terkirim</p>
                  </div>
                </div>

                {/* Floating Badge 3 (Bottom Center): Order Conversion */}
                <div className="absolute -bottom-4 left-6 z-20 flex items-center gap-2 rounded-full border border-emerald-500/30 bg-white/95 dark:bg-zinc-900/95 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 shadow-xl backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
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
        {/* 3. PLATFORM INTEGRATION CONTINUOUS INFINITE MOVING MARQUEE */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="border-y border-border bg-card/40 py-8 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              ⚡ Terintegrasi Otomatis dengan Platform Favorit Anda
            </p>
          </div>

          {/* Marquee Wrapper with Gradient Fade on Sides */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="animate-marquee flex gap-6 items-center">
              {/* Duplicate array twice for seamless continuous infinite loop */}
              {[...platformItems, ...platformItems].map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-2xl border border-border bg-card/90 px-5 py-3 shadow-xs backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-500/50 hover:shadow-md cursor-pointer shrink-0 group"
                >
                  <div className="transition-transform duration-500 group-hover:scale-120 group-hover:rotate-6">
                    {p.logo}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-foreground">{p.nama}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
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
              { value: "24/7", label: "Respon Nonstop", desc: "Siaga tengah malam &amp; hari libur" },
              { value: "100%", label: "Cloud Based", desc: "Ponsel &amp; laptop bebas dimatikan" },
              { value: "+45%", label: "Peningkatan Closing", desc: "Calon pembeli gak kabur ke toko lain" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 text-center shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/30 hover:-translate-y-1"
              >
                <p className="text-3xl font-black text-emerald-500 sm:text-4xl">{stat.value}</p>
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
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
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
                <div className="col-span-4 text-emerald-600 dark:text-emerald-400">Balasin CS AI ✨</div>
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
                    <div className="col-span-4 flex items-center gap-2 font-bold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
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
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Simulasi Langsung
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-foreground md:text-3xl">
                Coba &amp; Rasakan Chat Balasin Bekerja
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
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
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
                      <div className="feature-icon flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
                        <f.icon className="size-6" />
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {f.tagline}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-foreground">{f.judul}</h3>
                    <p className={`text-sm leading-relaxed text-muted-foreground ${isWide ? "max-w-xl" : ""}`}>
                      {f.teks}
                    </p>

                    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
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
        {/* 8. DEDICATED LICENSE ACTIVATION NOTICE SECTION             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="aktivasi" className="py-20 bg-gradient-to-b from-card/30 to-card/70 border-t border-border">
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-3xl border-2 border-emerald-500/30 bg-card p-8 md:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="grid gap-8 md:grid-cols-12 items-center">
                <div className="md:col-span-7 space-y-4 text-left">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Informasi Lisensi Resmi Balasin</span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight">
                    Kode Aktivasi &amp; Lisensi Didapatkan Langsung dari Admin
                  </h2>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Untuk menjamin kestabilan server dan keamanan nomor WhatsApp bisnis Anda, seluruh aktivasi akun dan penerbitan kode lisensi resmi dilakukan secara langsung oleh Admin melalui WhatsApp.
                  </p>

                  <div className="space-y-3 pt-2 text-xs text-foreground font-medium">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">1</span>
                      <span>Daftar / Masuk akun menggunakan akun Google Anda</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">2</span>
                      <span>Chat Admin via WhatsApp untuk klaim atau perpanjangan kode lisensi</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">3</span>
                      <span>Masukkan kode di Dashboard &amp; AI langsung aktif membalas pelanggan 24/7!</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-6 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-4 animate-wiggle">
                    <svg className="h-9 w-9 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.162.043.222-.026.06-.068.256-.298.324-.4.068-.102.137-.085.23-.051.094.034.596.281.698.332.102.051.17.077.196.12.025.042.025.247-.119.652z" />
                    </svg>
                  </div>
                  <h3 className="font-extrabold text-foreground text-base">WhatsApp Resmi Admin</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-5">
                    Respon cepat &bull; Layanan aktivasi lisensi setiap hari
                  </p>
                  <a
                    href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20WhatsApp%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold py-3 px-5 text-sm shadow-md transition-all hover:scale-105 active:scale-95"
                  >
                    <span>Chat Admin untuk Aktivasi</span>
                    <ArrowRight className="size-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 9. TESTIMONIALS CONTINUOUS MOVING LOOP (NOT STATIC)       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="testimoni" className="py-20 border-y border-border bg-card/30 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Kisah Sukses Nyata
            </span>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground sm:text-4xl">
              Dipercaya oleh Penjual Online di Seluruh Indonesia
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Cerita nyata mereka yang omsetnya melesat setelah membalas chat otomatis dengan Balasin AI.
            </p>
          </div>

          {/* Continuous Infinite Moving Testimonials Marquee */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee-testimonials flex gap-6 items-stretch">
              {[...testimoniList, ...testimoniList].map((t, idx) => (
                <div
                  key={idx}
                  className="flex w-[350px] shrink-0 flex-col justify-between rounded-3xl border border-border bg-card/95 p-6 shadow-md backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-500/50 hover:shadow-xl cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex text-amber-400">
                        {[...Array(t.bintang)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {t.hasil}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                      "{t.isi}"
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/80 pt-4 flex items-center gap-3">
                    <img
                      src={t.foto}
                      alt={t.nama}
                      className="size-11 rounded-full object-cover ring-2 ring-emerald-500/30 shrink-0 shadow-xs"
                    />
                    <div className="min-w-0 flex-1 text-left">
                      <h4 className="font-bold text-foreground text-sm truncate">{t.nama}</h4>
                      <p className="text-[11px] text-muted-foreground truncate">{t.bisnis}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 10. HOW IT WORKS — 3 Steps                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="cara-kerja" className="mx-auto max-w-6xl px-6 py-20">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
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
                className="group relative flex flex-col justify-between rounded-3xl border border-border bg-card/60 p-7 shadow-sm transition-all hover:border-emerald-500/50 hover:bg-card hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-3xl font-black text-emerald-500/30">
                      {step.nomor}
                    </span>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
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
        {/* 11. FAQ ACCORDION                                         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="faq" className="border-t border-border py-20">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Punya Pertanyaan?
              </span>
              <h2 className="mt-1 text-3xl font-extrabold text-foreground sm:text-4xl">
                Pertanyaan Sering Diajukan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Semua hal yang perlu Anda ketahui tentang Balasin &amp; aktivasi lisensi.
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
                      <ChevronDown className="size-5 text-emerald-500" />
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
        {/* 12. FINAL HIGH-CONVERSION CTA BANNER                      */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-[36px] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 p-8 text-center text-white shadow-2xl md:p-14">
            {/* Background Glows */}
            <div className="pointer-events-none absolute -top-12 -right-12 size-60 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-60 rounded-full bg-black/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Mulai Sekarang Juga
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl md:text-5xl leading-tight">
                Siap Melayani Pelanggan 24 Jam Tanpa Pegal?
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-emerald-100 sm:text-base">
                Hubungkan WhatsApp bisnis Anda dan hubungi Admin untuk aktivasi lisensi resmi. Omset penjualan terus mengalir tanpa bikin pembeli menunggu!
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
                  Buka Dashboard Sekarang
                  <ArrowRight className="ml-2 size-5" />
                </Button>

                <a
                  href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20WhatsApp%20saya."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366] hover:bg-[#128C7E] px-8 py-4 font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95 text-base flex items-center justify-center gap-2"
                >
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.162.043.222-.026.06-.068.256-.298.324-.4.068-.102.137-.085.23-.051.094.034.596.281.698.332.102.051.17.077.196.12.025.042.025.247-.119.652z" />
                  </svg>
                  <span>Chat Admin via WhatsApp</span>
                </a>
              </div>

              <p className="mt-4 text-xs text-emerald-200">
                ✓ Layanan Aktivasi Cepat &bull; Admin Siap Membantu Setiap Hari
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 13. FOOTER                                                */}
        {/* ══════════════════════════════════════════════════════════ */}
        <footer className="border-t border-border/60 py-12 bg-card/20">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/chatbot_wa.png" alt="Balasin" className="h-7 w-7 rounded-lg object-contain" />
              <span className="text-base font-bold text-foreground">
                Balas<span className="text-emerald-500">in</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              © {new Date().getFullYear()} Balasin — Solusi Customer Service AI WhatsApp untuk UMKM &amp; Penjual Online.
            </p>

            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a
                href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20tanya%20aktivasi%20lisensi."
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-emerald-500 font-semibold"
              >
                Hubungi Admin via WhatsApp
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* 14. FLOATING STICKY WHATSAPP ADMIN BUTTON                  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <aside aria-label="Bantuan WhatsApp Admin" className="fixed bottom-6 right-6 z-50 flex items-center">
        <a
          href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20akun%20WhatsApp%20saya."
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-4 py-3 text-white shadow-[0_4px_25px_rgba(37,211,102,0.5)] transition-all hover:scale-105 hover:shadow-[0_6px_35px_rgba(37,211,102,0.7)] active:scale-95"
          title="Chat Admin WhatsApp untuk Aktivasi Lisensi"
        >
          {/* Animated Pulsing Ring */}
          <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 blur-xs animate-pulse-ring pointer-events-none" />

          {/* WhatsApp Icon with Wiggle Animation */}
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white shrink-0">
            <svg className="h-5 w-5 fill-current animate-wiggle" viewBox="0 0 24 24">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.162.043.222-.026.06-.068.256-.298.324-.4.068-.102.137-.085.23-.051.094.034.596.281.698.332.102.051.17.077.196.12.025.042.025.247-.119.652z" />
            </svg>
          </div>

          <div className="hidden sm:block text-left pr-1">
            <p className="text-[10px] font-semibold leading-none text-emerald-100">Butuh Aktivasi Lisensi?</p>
            <p className="text-xs font-black leading-tight text-white mt-0.5">Chat Admin via WhatsApp</p>
          </div>
        </a>
      </aside>
    </>
  );
}
