import { Link, useNavigate } from "@tanstack/react-router";
import {
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
  Star,
  XCircle,
  Activity,
  Layers,
  Sparkle,
  Cpu,
  Server,
  Lock,
  MessageSquare,
  Clock,
  TrendingUp,
  BarChart3,
  Check,
  Flame,
  Smartphone,
  Sliders,
  Radio,
  ExternalLink,
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
import { API_BASE } from "@/lib/api-client";
import { getGoogleUser, handleLogout } from "@/lib/google-auth";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";

const langkahMudah = [
  {
    nomor: "01",
    judul: "Pindai QR WhatsApp",
    badge: "10 Detik Selesai",
    tagline: "Resmi WhatsApp Multi-Device",
    teks: "Buka menu WhatsApp Web di HP Anda, arahkan kamera ke QR code di dashboard. Nomor langsung terhubung aman ke cloud server Balasin.",
    detail: "Tanpa instal aplikasi tambahan di HP & ponsel bebas dimatikan kapan saja.",
  },
  {
    nomor: "02",
    judul: "Isi Template & Info Toko",
    badge: "Form Cepat & Fleksibel",
    tagline: "Smart Prompt Builder",
    teks: "Lengkapi data singkat: katalog produk, tarif & kurir COD, jam buka toko, dan garansi retur. AI otomatis menyusun bahasa CS yang ramah dan persuasif.",
    detail: "Tersedia preset siap pakai untuk Fashion, Skincare, Kuliner, & Gadget.",
  },
  {
    nomor: "03",
    judul: "AI Siaga Balas 24/7 Nonstop",
    badge: "Otomatisasi Penuh",
    tagline: "Zero Delay Response",
    teks: "Nyalakan saklar otomatis. Setiap ada klik dari iklan TikTok/IG atau pesan baru masuk, AI langsung menjawab tuntas dan mengunci orderan pembeli.",
    detail: "Prioritas penuh: Anda tetap bisa menyela dan balas manual di HP kapan saja.",
  },
];

const presetTemplatePreview = {
  fashion: {
    nama: "Fashion & Pakaian",
    pertanyaan: "Kak, LD 110 warna Sage Green masih ada? Bisa bayar COD ke Palembang?",
    jawaban: "Halo Kak! 👋 Masih ready banget ya untuk ukuran L (LD 110) varian Sage Green. Bahan katun rayon premium jatuh & adem. Bisa banget COD ke Palembang via J&T Express. Mau sekalian kami pesankan sekarang kak?",
  },
  skincare: {
    nama: "Skincare & Beauty",
    pertanyaan: "Kak apakah serum ini aman buat kulit beruntusan & jerawat aktif?",
    jawaban: "Halo Kak! ✨ Aman banget ya, serum ini mengandung 2% Salicylic Acid & Ceramide, sudah BPOM resmi dan formulanya gentle untuk meredakan kemerahan jerawat aktif. Mau dikirim hari ini kak?",
  },
  kuliner: {
    nama: "Kuliner & F&B",
    pertanyaan: "Min, frozen food pempek ada paket komplit? Kirim ke Surabaya tahan berapa hari?",
    jawaban: "Halo Kak! Ada kak, Paket Komplit isi 20 pcs (Kapal Selam + Lenjer) sudah kemasan vacuum beku, tahan 4 hari di perjalanan dan dapat cuko kental pedas gurih. Siap kirim via Paxel hari ini ya kak!",
  },
  gadget: {
    nama: "Aksesoris Gadget",
    pertanyaan: "Headphone wireless ini ada garansi gak min? Kalau rusak bisa tukar baru?",
    jawaban: "Halo Kak! 🎧 Ada Garansi Resmi Tukar Baru 12 Bulan ganti unit langsung jika ada cacat pabrik. Sudah include kabel Type-C & pouch gratis kak. Mau diambil warna Hitam atau Putih kak?",
  },
};

const simulasiChatData = {
  iklan: {
    label: "Balas Iklan Instagram/TikTok (CTWA)",
    leadPertanyaan: "Halo kak, saya tertarik dengan promo Sneakers Sport di iklan Instagram. Masih diskon?",
    leadWaktu: "13:40",
    botReplies: [
      {
        teks: "Halo Kak! 👋 Salam kenal dari Sneakers Official Store. Promo diskon 30% masih berlaku sampai malam ini ya!",
        waktu: "13:40",
        media: {
          tipe: "produk",
          gambar: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=320&fit=crop",
          nama: "Sneakers AeroSport Pro 2026",
          hargaAsli: "Rp 359.000",
          hargaPromo: "Rp 249.000",
          diskon: "Diskon 30%",
          spek: "Size 39 - 44 • Insole Memory Foam Anti-Pegal • Ready Kirim",
        },
      },
      {
        teks: "Rencana mau dikirim ke kota mana kak? Biar sekalian kami bantu cek promo Gratis Ongkir & voucher COD-nya ya kak 😊",
        waktu: "13:40",
      },
    ],
  },
  faq: {
    label: "Tanya Jawab COD & Garansi Ukuran",
    leadPertanyaan: "Bisa bayar COD gak kak? Kalau nanti sepatunya kekecilan apakah boleh ditukar?",
    leadWaktu: "14:15",
    botReplies: [
      {
        teks: "Bisa banget bayar di tempat (COD) kak! Kami bekerjasama resmi dengan J&T Express & SiCepat untuk pembayaran tunai saat kurir sampai di rumah 🚚",
        waktu: "14:15",
      },
      {
        teks: "Untuk ukuran jangan khawatir ya kak, toko kami ada Garansi Bebas Tukar Size 7 Hari setelah paket tiba jika kurang pas. Cukup chat admin, kami bantu proses retur tukarnya dengan cepat!",
        waktu: "14:15",
      },
    ],
  },
  lokasi: {
    label: "Jam Operasional & Alamat Toko",
    leadPertanyaan: "Kak kalau mau datang langsung ke toko bisa? Buka sampai jam berapa ya?",
    leadWaktu: "15:02",
    botReplies: [
      {
        teks: "Bisa banget kak! Toko fisik kami buka setiap hari Senin - Minggu dari jam 09.00 - 21.00 WIB ✨",
        waktu: "15:02",
      },
      {
        teks: "📍 Alamat toko: Ruko Boulevard Green No. 12, Jakarta Barat (tersedia parkir luas & free fitting room). Kami tunggu kedatangannya ya kak!",
        waktu: "15:02",
      },
    ],
  },
};

const testimoniList = [
  {
    nama: "Rian Pratama",
    bisnis: "Owner SneakerPoint (Bandung)",
    hasil: "Closing Naik 40% & Iklan Anti-Boncos",
    isi: "Jujur awalnya skeptis, apa iya bot bisa ngelayanin pembeli senatural CS asli. Pas dicoba di iklan TikTok & IG Ads, kaget banget. Jam 1 sampai jam 4 subuh yang biasanya chat dianggurin sampe pagi dan leads pada kabur ke toko sebelah, langsung dibalas detik itu juga sama katalognya. Pas bangun jam 6 pagi, tau-tau udah ada 18 orderan COD baru masuk di mutasi. Iklan gak pernah boncos lagi!",
    bintang: 5,
    inisial: "RP",
    gradien: "linear-gradient(135deg, #059669, #34d399)",
    lokasi: "Bandung, Jawa Barat",
  },
  {
    nama: "Siti Rahmawati",
    bisnis: "Owner Al-Madina Hijab & Gamis (Solo)",
    hasil: "Hemat Biaya 2 CS Tiap Bulan",
    isi: "Admin saya dulu keteteran tiap kali live TikTok kelar, bisa 300+ chat numpuk nanyain LD, panjang baju, sama bahan gerah apa nggak. Semenjak pake Balasin, template info toko kita input sekali aja, AI-nya pinter banget ngejawabnya luwes kayak manusia asli, nyebut 'Kakak' ramah banget. Kita bisa hemat gaji 2 CS manual dan pembeli gak nunggu berjam-jam.",
    bintang: 5,
    inisial: "SR",
    gradien: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    lokasi: "Solo, Jawa Tengah",
  },
  {
    nama: "Hendro Wijaya",
    bisnis: "Gadget Hub & Accessories (Glodok, Jakarta)",
    hasil: "Konversi Naik dari 12% ke 38%",
    isi: "Yang paling saya suka itu gak perlu nyalain laptop seharian di toko. Cukup scan QR dari HP sekali, sistem jalan di cloud mereka. Pembeli marketplace yang klik iklan Click-to-WA langsung ditangkep, dikasih link variasi warna, langsung checkout transfer BCA. Pembeli paling benci toko yang slow respon, begitu langsung dibalas, closing rate melesat.",
    bintang: 5,
    inisial: "HW",
    gradien: "linear-gradient(135deg, #0284c7, #38bdf8)",
    lokasi: "Jakarta Barat",
  },
  {
    nama: "Dewi Lestari",
    bisnis: "Founder Glow Skin Official (Surabaya)",
    hasil: "Orderan Tanggal Kembar Tembus 3x",
    isi: "Customer skincare itu detail banget, nanya nomor BPOM, urutan pemakaian krim siang malam, cocok gak buat jerawat batu. AI Balasin jawabnya runtut dan meyakinkan banget. Yang tadinya cuma iseng nanya-nanya malah jadi beli sepaket lengkap 4 produk. Ngebantu banget pas promo tanggal kembar!",
    bintang: 5,
    inisial: "DL",
    gradien: "linear-gradient(135deg, #e11d48, #fb7185)",
    lokasi: "Surabaya, Jawa Timur",
  },
  {
    nama: "Budi Santoso",
    bisnis: "Kopi Lereng Kawi Roastery (Malang)",
    hasil: "Repeat Order Langganan Naik 2x",
    isi: "Paling kesel kalo pembeli nanya 'Kak ada beans arabika giling halus?' pas kita lagi sibuk roasting kopi di dapur. Begitu lambat 10 menit aja pembelinya udah pindah toko sebelah. Sekarang gak pernah kejadian lagi. Balasan < 2 detik bikin pembeli ngerasa dihargai, repeat order langganan cafe naik 2x lipat.",
    bintang: 5,
    inisial: "BS",
    gradien: "linear-gradient(135deg, #d97706, #fbbf24)",
    lokasi: "Malang, Jawa Timur",
  },
];

const perbandinganFitur = [
  {
    fitur: "Kecepatan Respon Pesan",
    manual: "15 - 60 Menit (Bisa berjam-jam di jam malam)",
    balasin: "< 2 Detik (Instan di detik yang sama)",
  },
  {
    fitur: "Jam Kerja Operasional",
    manual: "Maksimal 8 - 10 Jam/Hari (Libur saat malam)",
    balasin: "24 Jam Nonstop 7 Hari Penuh Tanpa Cuti",
  },
  {
    fitur: "Konsistensi Jawaban",
    manual: "Sering typo, lelah, emosi, & lupa info promo",
    balasin: "100% Akurat sesuai katalog & info toko",
  },
  {
    fitur: "Biaya Operasional",
    manual: "Rp 2,5jt - Rp 4jt / CS per bulan + biaya lembur",
    balasin: "Jauh lebih hemat tanpa rekrut & training ulang",
  },
  {
    fitur: "Kapasitas Chat Bersamaan",
    manual: "Maksimal 3 - 5 chat sekaligus sudah keteteran",
    balasin: "Ratusan chat terjawab serentak tanpa antre",
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

export function Landing() {
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [oauthError, setOauthError] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [skenarioAktif, setSkenarioAktif] = useState("iklan");
  const [isTyping, setIsTyping] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Interactive Simulator state
  const [customInput, setCustomInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [activeTemplateTab, setActiveTemplateTab] = useState("fashion");

  const timeoutRef = useRef(null);
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

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Scroll detection for dynamic sticky capsule navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Synchronize chat messages with scenario
  useEffect(() => {
    const scenario = simulasiChatData[skenarioAktif];
    if (scenario) {
      setIsTyping(true);
      setChatMessages([
        { pengirim: "user", teks: scenario.leadPertanyaan, waktu: scenario.leadWaktu },
      ]);
      const timer = setTimeout(() => {
        setIsTyping(false);
        setChatMessages([
          { pengirim: "user", teks: scenario.leadPertanyaan, waktu: scenario.leadWaktu },
          ...scenario.botReplies.map((b) => ({ ...b, pengirim: "bot" })),
        ]);
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [skenarioAktif]);

  // Handle custom interactive message send in simulator
  const handleSendCustomMessage = (e) => {
    if (e) e.preventDefault();
    if (!customInput.trim()) return;

    const userText = customInput.trim();
    setCustomInput("");

    // Add user message
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    
    setChatMessages((prev) => [
      ...prev,
      { pengirim: "user", teks: userText, waktu: currentTime },
    ]);

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "Halo Kak! Salam kenal dari toko kami. Pesanan kakak sudah kami catat ya! Ada yang bisa kami bantu lagi untuk pengirimannya? 😊";
      
      const lower = userText.toLowerCase();
      if (lower.includes("cod") || lower.includes("bayar")) {
        botResponse = "Bisa banget bayar di tempat (COD) kak! Kurir kami siap antar langsung ke alamat kakak tanpa ribet transfer ✨";
      } else if (lower.includes("harga") || lower.includes("diskon") || lower.includes("promo")) {
        botResponse = "Untuk promo hari ini masih dapat potongan 30% + voucher gratis ongkir ya kak! Mau dibantu amankan stoknya sekarang?";
      } else if (lower.includes("stok") || lower.includes("ready") || lower.includes("ukuran")) {
        botResponse = "Stok dan variasi ukuran ready lengkap kak! Mau dikirim hari ini sebelum jam 17.00 WIB?";
      }

      setChatMessages((prev) => [
        ...prev,
        { pengirim: "bot", teks: botResponse, waktu: currentTime },
      ]);
    }, 850);
  };

  // Dynamic document title
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

  // Scroll Reveal: animate elements into view when they enter the viewport
  useEffect(() => {
    const revealSelectors = '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale';
    const els = document.querySelectorAll(revealSelectors);
    if (!els.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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

  const handleManualLogin = (e) => {
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

  // Platform items with official SVGs
  const platformItems = [
    {
      nama: "TikTok Shop & Ads",
      desc: "Balas Chat Otomatis",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-md shadow-cyan-500/20">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#25D366] to-[#128C7E] text-white shadow-md shadow-emerald-500/30">
          <svg className="size-5 fill-current" viewBox="0 0 24 24">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.17.077.196.12.025.042.025.247-.119.652z" />
          </svg>
        </div>
      ),
    },
    {
      nama: "Meta Ads (Click-to-WA)",
      desc: "Instagram & Facebook",
      logo: (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white shadow-md shadow-pink-500/20">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#EE4D2D] to-[#ff7337] text-white shadow-md shadow-orange-500/20">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#03AC0E] to-[#42b549] text-white shadow-md shadow-emerald-500/20">
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
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1877F2] text-white shadow-md shadow-blue-500/20">
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
      {/* 1. DYNAMIC STICKY FLOATING CAPSULE NAVBAR (NAS.COM STYLE)  */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div className="fixed top-4 inset-x-0 z-50 mx-auto max-w-5xl px-4 pointer-events-none transition-all duration-300">
        <header
          className={`pointer-events-auto mx-auto flex items-center justify-between rounded-full border border-zinc-200/80 dark:border-zinc-800/90 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 ${
            isScrolled ? "py-2 px-5 sm:px-6 scale-[0.98] border-emerald-500/30" : "py-3 px-6 sm:px-7"
          }`}
        >
          {/* Left: Logo with Live Pulsing Green Dot */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src="/chatbot_wa.png"
                alt="Balasin"
                className="h-8 w-8 rounded-full object-contain transition-transform duration-300 group-hover:scale-110 shadow-xs"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-zinc-950" />
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                Balas<span className="text-emerald-500">in</span>
              </span>
            </div>
          </Link>

          {/* Center: Clean Nav Links with hover underline indicator */}
          <nav className="hidden items-center gap-1 sm:gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 md:flex">
            <a
              href="#fitur"
              onClick={(e) => handleNavClick(e, "fitur")}
              className="relative rounded-full px-3.5 py-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            >
              Fitur Unggulan
            </a>
            <a
              href="#simulasi"
              onClick={(e) => handleNavClick(e, "simulasi")}
              className="relative rounded-full px-3.5 py-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            >
              Simulasi Chat
            </a>
            <a
              href="#cara-kerja"
              onClick={(e) => handleNavClick(e, "cara-kerja")}
              className="relative rounded-full px-3.5 py-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            >
              Cara Pakai
            </a>
            <a
              href="#perbandingan"
              onClick={(e) => handleNavClick(e, "perbandingan")}
              className="relative rounded-full px-3.5 py-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            >
              Keuntungan ROI
            </a>
            <a
              href="#testimoni"
              onClick={(e) => handleNavClick(e, "testimoni")}
              className="relative rounded-full px-3.5 py-1.5 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
            >
              Testimoni
            </a>
          </nav>

          {/* Right: Theme Toggle & CTA / User Dropdown */}
          <div className="flex items-center gap-2.5">
            <ThemeToggle className="size-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 hover:border-emerald-500/40" />

            {googleUser ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex cursor-pointer items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100/80 dark:bg-zinc-900/80 p-1 pr-3 transition-all hover:border-emerald-500/60 focus-visible:outline-none">
                  <span className="relative flex size-7 shrink-0">
                    {avatarSrc && !avatarError ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="size-7 rounded-full object-cover ring-2 ring-emerald-500/30"
                      />
                    ) : (
                      <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {initials}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-xs font-bold sm:inline-block text-zinc-900 dark:text-zinc-100">
                    {googleUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="size-3 text-zinc-400" />
                </button>
                {isOpen && (
                  <div className="absolute top-full right-0 z-50 pt-2">
                    <div className="w-56 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-2 shadow-2xl backdrop-blur-xl">
                      <div className="px-2.5 py-2">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{googleUser.name}</p>
                        <p className="mt-0.5 truncate text-[10px] text-zinc-500 dark:text-zinc-400">
                          {googleUser.email}
                        </p>
                      </div>
                      <div className="-mx-1 my-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                      <Link
                        to="/app"
                        onClick={() => setIsOpen(false)}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 outline-none hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                      >
                        <LayoutDashboard className="size-3.5" />
                        Buka Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowLogin(true);
                        }}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-zinc-700 dark:text-zinc-300 outline-none hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <UserPlus className="size-3.5" />
                        Tambahkan Akun Lain
                      </button>
                      <button
                        onClick={() => handleLogout()}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-xl px-2.5 py-2 text-xs text-red-500 dark:text-red-400 outline-none hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="size-3.5" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="hidden cursor-pointer text-xs font-bold text-zinc-700 transition-colors hover:text-emerald-600 dark:text-zinc-300 dark:hover:text-emerald-400 sm:inline-block px-3 py-1.5"
                >
                  Masuk
                </button>
                <button
                  onClick={() => setShowLogin(true)}
                  className="relative group overflow-hidden flex cursor-pointer items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 text-xs font-extrabold shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all hover:scale-105 active:scale-95"
                >
                  <span className="relative z-10 flex items-center gap-1">
                    <span>Mulai Sekarang</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </button>
              </div>
            )}
          </div>
        </header>
      </div>

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-2xl">
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
            <DialogTitle className="text-center text-xl font-bold tracking-tight">
              Masuk ke Akun Balasin
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Akses instan dashboard CS AI WhatsApp bisnis Anda
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
                className={`rounded-xl border-zinc-200 dark:border-zinc-800 ${isError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                  className={`rounded-xl border-zinc-200 dark:border-zinc-800 ${isError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
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
                  Email atau kata sandi tidak cocok. Gunakan tombol Google di bawah untuk akses langsung.
                </p>
              )}
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-background px-2 text-xs text-muted-foreground font-semibold">
                ATAU
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogleClick}
              className="flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 px-4 py-3 text-sm font-semibold shadow-xs transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
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
              className="w-full cursor-pointer rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-zinc-950 font-bold text-white py-3"
            >
              Masuk
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500 selection:text-black">
        {/* ══════════════════════════════════════════════════════════ */}
        {/* 2. SPLIT HERO SECTION (BOLD NAS.COM STYLE)                 */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 tech-grid-bg">
          {/* Ambient Glowing Orbs */}
          <div className="pointer-events-none absolute top-10 left-1/4 h-[400px] w-[550px] rounded-full bg-emerald-500/15 blur-[140px] animate-pulse-glow" />
          <div className="pointer-events-none absolute top-36 right-10 h-[350px] w-[500px] rounded-full bg-teal-500/15 blur-[130px] animate-pulse-glow" />

          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Left Column: Oversized Typography & High-Impact Copy */}
              <div className="space-y-6 text-center lg:col-span-7 lg:text-left">
                {/* Floating Ribbon Tag */}
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-500 animate-spin" style={{ animationDuration: "9s" }} />
                  <span>AI WhatsApp Automation for High-Growth Commerce</span>
                </div>

                {/* Main Headline (Oversized & Punchy) */}
                <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-black leading-[1.06] tracking-tight text-zinc-900 dark:text-white">
                  CS WhatsApp Pintar,{" "}
                  <span className="hero-glimmer">
                    Balas Otomatis 24 Jam
                  </span>{" "}
                  Nonstop.
                </h1>

                {/* Description */}
                <p className="mx-auto max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg lg:mx-0">
                  Tingkatkan omset toko Anda. AI ramah yang otomatis merespons klik iklan TikTok &amp;
                  Instagram Ads, melayani tanya-jawab produk, dan closing pembeli seketika dalam hitungan detik.
                </p>

                {/* Dual High-Conversion CTA Buttons */}
                <div className="flex flex-col items-center gap-3.5 pt-2 sm:flex-row lg:justify-start">
                  <button
                    onClick={() => {
                      if (googleUser) {
                        navigate({ to: "/app" });
                      } else {
                        setShowLogin(true);
                      }
                    }}
                    className="relative group overflow-hidden flex w-full items-center justify-center gap-3 rounded-full bg-emerald-500 hover:bg-emerald-400 px-8 py-4 text-base font-extrabold text-zinc-950 shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all hover:scale-105 active:scale-95 sm:w-auto cursor-pointer"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Zap className="h-5 w-5 fill-current" />
                      <span>Hubungkan WhatsApp Sekarang</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                  </button>

                  {/* Chat Admin WhatsApp Button */}
                  <a
                    href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20WhatsApp%20saya."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-emerald-500/40 bg-zinc-100/90 dark:bg-zinc-900/90 px-6 py-4 text-sm font-bold text-zinc-900 dark:text-zinc-100 transition-all hover:scale-105 hover:border-emerald-500/80 shadow-xs sm:w-auto"
                  >
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white">
                      <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.634.044-1.282-.128-.85-.226-1.523-.626-2.196-1.299-.958-.958-1.554-2.146-1.637-2.316-.083-.17-.234-.488-.234-.933 0-.445.234-.664.318-.749.085-.085.185-.106.247-.106.062 0 .125.001.179.003.058.002.136-.022.213.161.085.202.289.704.314.756.025.053.042.115.008.183-.034.068-.051.11-.102.17-.051.06-.107.133-.153.179-.051.051-.104.106-.045.207.06.101.265.438.568.708.391.349.721.457.823.508.102.051.162.043.222-.026.06-.068.256-.298.324-.4.068-.102.137-.085.23-.051.094.034.596.281.698.332.102.051.17.077.196.12.025.042.025.247-.119.652z" />
                      </svg>
                    </div>
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
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-bold text-emerald-400 ring-2 ring-background">
                      +1k
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                      ))}
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">4.9/5</span>
                    <span>dari 1.200+ Penjual Online &amp; UMKM Indonesia</span>
                  </div>
                </div>

                {/* Highlights Trio */}
                <div className="grid grid-cols-3 gap-4 border-t border-zinc-200 dark:border-zinc-800/80 pt-6 text-left">
                  <div>
                    <strong className="block text-xl font-black text-emerald-500">100%</strong>
                    <span className="text-xs text-muted-foreground">Cloud Server Tanpa Mati</span>
                  </div>
                  <div>
                    <strong className="block text-xl font-black text-emerald-500">&lt; 2 Detik</strong>
                    <span className="text-xs text-muted-foreground">Kecepatan Balas Iklan</span>
                  </div>
                  <div>
                    <strong className="block text-xl font-black text-emerald-500">1 Menit</strong>
                    <span className="text-xs text-muted-foreground">Tinggal Scan QR</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Phone Mockup with 3 Dynamic Floating Badges */}
              <div className="relative flex justify-center lg:col-span-5">
                {/* Floating Badge 1 (Top Left): Live Chat Incoming */}
                <div className="absolute -top-6 -left-6 z-20 hidden items-center gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 p-3 shadow-2xl backdrop-blur-xl animate-float-delayed sm:flex">
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
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 font-bold text-zinc-950">
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
                  <span>💰 Order Masuk COD: Rp 389.000</span>
                </div>

                {/* The Phone Container */}
                <div className="w-full max-w-[360px] rounded-[44px] border-4 border-zinc-700/80 bg-zinc-800 p-3 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] animate-float">
                  {/* Phone Speaker Notch */}
                  <div className="mx-auto mb-2 h-1.5 w-16 rounded-full bg-zinc-700" />

                  {/* Inner Phone Screen */}
                  <div className="flex w-full flex-col overflow-hidden rounded-[32px] bg-[#0b141a] text-xs font-sans">
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
        {/* 3. INFINITE TRUST & RESEARCH-BACKED METRIC MARQUEE         */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="scroll-reveal border-y border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/50 py-10 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              ⚡ Terintegrasi Otomatis dengan Ekosistem Penjualan Anda
            </p>
          </div>

          {/* Marquee Wrapper 1: Platform Integration */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] mb-8">
            <div className="animate-marquee flex gap-6 items-center">
              {[...platformItems, ...platformItems].map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 px-5 py-3 shadow-xs backdrop-blur-md transition-all hover:scale-105 hover:border-emerald-500/50 cursor-pointer shrink-0 group"
                >
                  <div className="transition-transform duration-500 group-hover:scale-115">
                    {p.logo}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{p.nama}</p>
                    <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Marquee Wrapper 2: Real Benchmark Data (Harvard Business Review & Meta Research) */}
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                {
                  value: "21x Lipat",
                  label: "Peluang Kualifikasi Leads",
                  desc: "Riset Harvard Business Review (HBR) respon dalam 5 menit",
                  highlight: "HBR Research",
                },
                {
                  value: "78%",
                  label: "Membeli dari Penjawab Pertama",
                  desc: "Riset Lead Response Management (InsideSales Study)",
                  highlight: "Market Data",
                },
                {
                  value: "< 2 Detik",
                  label: "Respon Kilat AI Balasin",
                  desc: "Balas chat iklan tanpa jeda di tengah malam & hari libur",
                  highlight: "Benchmark",
                },
                {
                  value: "99.98%",
                  label: "Uptime Cloud Server",
                  desc: "Ponsel & laptop bebas dimatikan, sistem tetap aktif",
                  highlight: "Cloud SLA",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 p-6 text-center shadow-sm backdrop-blur-md transition-all hover:border-emerald-500/40 hover:-translate-y-1"
                >
                  <div className="mb-2 flex justify-center">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {stat.highlight}
                    </span>
                  </div>
                  <p className="text-3xl font-black text-emerald-500 sm:text-4xl">{stat.value}</p>
                  <p className="mt-1 text-sm font-bold text-zinc-900 dark:text-zinc-100">{stat.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{stat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 4. REVISI FITUR UNGGULAN: DATA RISET & RICH 3D ICONS       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="fitur" className="scroll-reveal py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-3xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
                <Sparkle className="size-3.5 text-emerald-400" />
                Fitur Unggulan Berbasis Riset
              </span>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Teknologi yang Terbukti Mengubah Klik Iklan Menjadi Closingan
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Bukan sekadar bot teks biasa. Dibangun di atas data riset kecepatan respon penjualan e-commerce global &amp; infrastruktur cloud mandiri.
              </p>
            </div>

            {/* Asymmetric Bento Box (4 Cards) dengan Desain & Icon Kaya Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 (Large - col-span 2): Speed-to-Lead + Interactive Benchmark Sine Wave */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-8 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Rich Multi-Layered Glowing Icon Container */}
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-zinc-950 shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/40">
                        <Zap className="size-7 fill-current text-zinc-950 animate-wiggle" />
                      </div>
                      <span className="absolute -top-1 -right-2 rounded-full bg-emerald-400 text-zinc-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                        &lt; 2s
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Speed-to-Lead Advantage
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Studi Harvard Business Review</p>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
                    Respon Instan Sebelum Pembeli Pindah ke Kompetitor
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
                    Riset <em>MIT &amp; Harvard Business Review</em> membuktikan bahwa penjual yang merespons lead dalam 5 menit memiliki peluang closing <strong>21x lebih besar</strong>. AI Balasin menyapa dalam 0.8 detik, mengirim foto katalog, dan mengamankan nomor pesanan sebelum calon pembeli menutup WhatsApp.
                  </p>
                </div>

                {/* Visual Realtime Latency Wave Chart with Realistic Data Indicators */}
                <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold mb-3">
                    <div className="flex items-center gap-2 text-emerald-500">
                      <Activity className="size-4 animate-pulse" />
                      <span>Benchmark Kecepatan Respon &amp; Retensi Pembeli</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-500" />
                        Balasin AI: 0.82 Detik
                      </span>
                      <span className="flex items-center gap-1.5 font-mono text-[11px] text-red-400">
                        <span className="size-2 rounded-full bg-red-500" />
                        CS Manual: 42+ Menit
                      </span>
                    </div>
                  </div>

                  <svg className="w-full h-18 overflow-visible" viewBox="0 0 500 70" preserveAspectRatio="none">
                    <path
                      d="M0 45 Q 60 15, 125 45 T 250 45 T 375 45 T 500 45"
                      fill="none"
                      stroke="rgba(16, 185, 129, 0.2)"
                      strokeWidth="3"
                    />
                    <path
                      d="M0 45 Q 60 15, 125 45 T 250 45 T 375 45 T 500 45"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      className="animate-wave-flow"
                    />
                  </svg>

                  <div className="mt-3 grid grid-cols-3 gap-2 border-t border-zinc-200 dark:border-zinc-800/80 pt-3 text-[11px]">
                    <div>
                      <span className="text-muted-foreground block">Klik Iklan Masuk</span>
                      <strong className="text-zinc-900 dark:text-zinc-200">Detik ke-0.0s</strong>
                    </div>
                    <div className="text-center">
                      <span className="text-emerald-500 font-bold block">Balasin CS Terkirim</span>
                      <strong className="text-emerald-400">Detik ke-0.8s (Closing Rate +45%)</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-red-400 block">CS Biasa Menjawab</span>
                      <strong className="text-zinc-400">Menit ke-42.0m (Drop Rate 78%)</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 (Medium - col-span 1): QR Code Scan 1 Minute with Laser Scanner Visual */}
              <div className="md:col-span-1 group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-8 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Rich Multi-Layered Icon */}
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 ring-2 ring-indigo-400/30">
                        <QrCode className="size-7" />
                      </div>
                      <span className="absolute -top-1 -right-2 rounded-full bg-sky-400 text-zinc-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                        1 Menit
                      </span>
                    </div>
                    <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-600 dark:text-sky-400">
                      Multi-Device API
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
                    Koneksi QR Sekali, Aktif Selamanya
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Sama mudahnya seperti login WhatsApp Web di komputer. Cukup pindai QR dari ponsel Anda dan bot langsung aktif melayani pembeli tanpa perlu laptop menyala.
                  </p>
                </div>

                {/* Animated Laser Scanner Viewfinder Box */}
                <div className="mt-6 flex flex-col items-center justify-center p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80">
                  <div className="relative p-3 rounded-2xl bg-white text-zinc-950 shadow-lg border-2 border-emerald-500/40">
                    {/* Corner Target Brackets */}
                    <div className="absolute top-1 left-1 size-3 border-t-2 border-l-2 border-emerald-500" />
                    <div className="absolute top-1 right-1 size-3 border-t-2 border-r-2 border-emerald-500" />
                    <div className="absolute bottom-1 left-1 size-3 border-b-2 border-l-2 border-emerald-500" />
                    <div className="absolute bottom-1 right-1 size-3 border-b-2 border-r-2 border-emerald-500" />

                    <QrCode className="size-20 text-zinc-900" />
                    {/* Animated Moving Laser Beam */}
                    <div className="absolute inset-x-2 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_10px_#10b981] animate-laser-scan" />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-bold text-emerald-500">Session Cloud: Terhubung &amp; Terenkripsi</span>
                  </div>
                </div>
              </div>

              {/* Card 3 (Medium - col-span 1): Dynamic Store Knowledge Base Simulator */}
              <div className="md:col-span-1 group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-8 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Rich Multi-Layered Icon */}
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25 ring-2 ring-orange-400/30">
                        <Store className="size-7" />
                      </div>
                      <span className="absolute -top-1 -right-2 rounded-full bg-amber-400 text-zinc-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                        Siap Pakai
                      </span>
                    </div>
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      Smart Knowledge
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
                    Template Bisnis Indonesia Siap Pakai
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Cukup pilih jenis bisnis Anda. AI langsung menguasai katalog, kurir COD (J&amp;T, SiCepat), ketentuan retur ukuran, hingga alamat toko fisik.
                  </p>
                </div>

                {/* Interactive Category Tabs with Live Response Preview */}
                <div className="mt-6 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(presetTemplatePreview).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveTemplateTab(cat)}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                          activeTemplateTab === cat
                            ? "bg-amber-500 text-zinc-950 shadow-xs scale-105"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-foreground"
                        }`}
                      >
                        {presetTemplatePreview[cat].nama.split(" ")[0]}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80 p-3 text-[11px] leading-relaxed">
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium italic">
                      "{presetTemplatePreview[activeTemplateTab].pertanyaan}"
                    </p>
                    <div className="mt-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-emerald-800 dark:text-emerald-300 font-semibold">
                      ⚡ AI Balasin: {presetTemplatePreview[activeTemplateTab].jawaban}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 (Large - col-span 2): Enterprise Privacy & Cloud Infrastructure */}
              <div className="md:col-span-2 group relative overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-8 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    {/* Rich Multi-Layered Icon */}
                    <div className="relative">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 text-zinc-950 shadow-lg shadow-teal-500/25 ring-2 ring-emerald-400/40">
                        <Server className="size-7 fill-current text-zinc-950" />
                      </div>
                      <span className="absolute -top-1 -right-2 rounded-full bg-emerald-400 text-zinc-950 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider shadow-xs">
                        99.98%
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Cloud Native Isolation
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">Enkripsi End-to-End</p>
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mb-2">
                    Keamanan Privasi Terenkripsi &amp; Server Mandiri
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
                    Data pembeli, riwayat chat, dan katalog produk Anda diisolasi per akun Google menggunakan standar keamanan AES-256. Sistem kami berjalan mandiri di high-availability cloud cluster tanpa menghabiskan kuota atau baterai ponsel Anda.
                  </p>
                </div>

                {/* Cloud Infrastructure Status Grid */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Server SLA</span>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <span className="block text-2xl font-black text-emerald-500">99.98%</span>
                    <span className="text-[11px] text-muted-foreground">High Availability Cluster</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Beban HP Anda</span>
                      <span className="text-[10px] font-bold text-emerald-400">Aman</span>
                    </div>
                    <span className="block text-2xl font-black text-emerald-500">0 Watt</span>
                    <span className="text-[11px] text-muted-foreground">Ponsel bebas mati / lowbat</span>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/90 dark:bg-zinc-950/80 p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted-foreground">Privasi Data</span>
                      <Lock className="size-3.5 text-emerald-400" />
                    </div>
                    <span className="block text-2xl font-black text-emerald-500">AES-256</span>
                    <span className="text-[11px] text-muted-foreground">Isolasi sandboxing per akun</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 5. REVISI SIMULASI CHAT INTERAKTIF LEBIH HIDUP & FLEKSIBEL  */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="simulasi" className="scroll-reveal-scale mx-auto max-w-5xl px-4 sm:px-6 py-24">
          <div className="rounded-[40px] border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-950/85 p-6 shadow-2xl backdrop-blur-2xl md:p-10">
            <div className="mx-auto mb-8 max-w-2xl text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
                <Smartphone className="size-3.5 text-emerald-400" />
                Simulasi WhatsApp Interaktif
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Uji Coba Langsung Cara AI Membalas Pembeli
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Klik tombol skenario cepat atau ketik sendiri pertanyaan di kolom chat untuk melihat respon cerdas AI secara langsung.
              </p>
            </div>

            {/* Quick Skenario Chips */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {Object.keys(simulasiChatData).map((key) => {
                const item = simulasiChatData[key];
                const active = skenarioAktif === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSkenarioAktif(key)}
                    className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                      active
                        ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/25 scale-105"
                        : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 border border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {key === "iklan" && <Zap className="size-3.5" />}
                    {key === "faq" && <HelpCircle className="size-3.5" />}
                    {key === "lokasi" && <Store className="size-3.5" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Realistic High-Fidelity WhatsApp App Frame */}
            <div className="mx-auto max-w-lg overflow-hidden rounded-3xl border-2 border-zinc-300 dark:border-zinc-800 bg-[#e5ddd5] shadow-2xl dark:bg-[#0b141a]">
              {/* WhatsApp Business Header Bar */}
              <div className="flex items-center justify-between bg-[#075e54] px-4 py-3 text-white dark:bg-[#202c33] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src="/chatbot_wa.png"
                      alt="Avatar"
                      className="size-10 rounded-full object-cover ring-2 ring-emerald-400 shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#075e54] bg-emerald-400 dark:border-[#202c33]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold leading-tight">Sneakers Official Store</h3>
                      <span className="rounded-full bg-emerald-500/30 px-1.5 py-0.2 text-[9px] font-extrabold text-emerald-200">
                        OFFICIAL
                      </span>
                    </div>
                    <p className="text-[11px] leading-tight text-emerald-200 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {isTyping ? "Sedang mengetik balasan..." : "Online • CS AI Aktif 24/7"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/80">
                  <button
                    type="button"
                    onClick={() => toast.info("Fitur panggilan suara via WhatsApp bot siap dihubungkan.")}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Panggilan Telepon"
                  >
                    <Phone className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toast.info("Simulasi interaktif siap melayani chat pembeli.")}
                    className="p-1 hover:text-white transition-colors cursor-pointer"
                    title="Panggilan Video"
                  >
                    <Video className="size-4" />
                  </button>
                  <MoreVertical className="size-4 cursor-pointer hover:text-white" />
                </div>
              </div>

              {/* Chat Messages Body with Realistic Media & Bubbles */}
              <div className="flex min-h-[380px] max-h-[460px] overflow-y-auto flex-col justify-end space-y-3 bg-[radial-gradient(#0000000c_1px,transparent_1px)] p-4 [background-size:16px_16px] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)]">
                <div className="my-1 text-center">
                  <span className="rounded-md bg-white/80 dark:bg-[#182229] px-3 py-1 text-[10px] text-muted-foreground shadow-xs font-semibold">
                    Hari Ini &bull; Terhubung Otomatis via Balasin AI
                  </span>
                </div>

                {chatMessages.map((msg, idx) => {
                  const isUser = msg.pengirim === "user";
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} animate-bubble-pop`}
                    >
                      <div
                        className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
                          isUser
                            ? "rounded-tr-xs bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-white"
                            : "rounded-tl-xs bg-white text-gray-900 dark:bg-[#202c33] dark:text-gray-100"
                        }`}
                      >
                        {/* Realistic Product Card inside Bot Reply */}
                        {msg.media && msg.media.tipe === "produk" && (
                          <div className="mb-2.5 overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5">
                            <img
                              src={msg.media.gambar}
                              alt={msg.media.nama}
                              className="h-32 w-full object-cover rounded-t-xl"
                            />
                            <div className="p-2.5 text-left">
                              <span className="inline-block rounded-md bg-emerald-500 text-zinc-950 font-black text-[9px] px-2 py-0.5 mb-1">
                                {msg.media.diskon}
                              </span>
                              <h4 className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                                {msg.media.nama}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                                  {msg.media.hargaPromo}
                                </span>
                                <span className="line-through text-[10px] text-muted-foreground">
                                  {msg.media.hargaAsli}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                {msg.media.spek}
                              </p>

                              {/* Interactive Action Buttons */}
                              <div className="mt-2.5 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomInput("Saya mau pesan yang ukuran 42 warna Hitam ya min");
                                  }}
                                  className="flex-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold py-1.5 text-[10px] text-center transition-all cursor-pointer"
                                >
                                  📦 Pesan Sekarang (COD)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCustomInput("Bisa tolong cek ongkir gratis ke Surabaya kak?");
                                  }}
                                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-1.5 text-[10px] cursor-pointer"
                                >
                                  Cek Ongkir
                                </button>
                              </div>
                            </div>
                          </div>
                        )}

                        <p className="whitespace-pre-line">{msg.teks}</p>

                        <div
                          className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
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

                {/* Bouncing Typing Dots */}
                {isTyping && (
                  <div className="flex flex-col items-start animate-bubble-pop">
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-xs bg-white dark:bg-[#202c33] px-4 py-2.5 shadow-sm">
                      <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-typing-1" />
                      <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-typing-2" />
                      <span className="size-2 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-typing-3" />
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive WhatsApp Input Form: User Can Type & Send */}
              <form
                onSubmit={handleSendCustomMessage}
                className="flex items-center gap-2 border-t border-black/5 bg-[#f0f2f5] p-2.5 dark:border-white/5 dark:bg-[#202c33]"
              >
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Ketik pertanyaan untuk coba chat..."
                  className="flex-1 rounded-full bg-white px-4 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-muted-foreground outline-none dark:bg-[#2a3942] border border-black/5"
                />
                <button
                  type="submit"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all"
                  title="Kirim Pesan"
                >
                  <Send className="size-3.5" />
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 6. REVISI TATA CARA PEMAKAIAN / AKTIVASI DENGAN GAMBARAN    */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="cara-kerja" className="scroll-reveal mx-auto max-w-6xl px-4 sm:px-6 py-24">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              <Sliders className="size-3.5 text-emerald-400" />
              Alur Setup 3 Menit
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              3 Langkah Praktis Mulai Mengotomatisasi Toko
            </h2>
            <p className="mt-3 text-sm sm:text-base text-muted-foreground">
              Tidak perlu sewa programmer atau server mahal. Langsung aktif melayani pembeli dalam hitungan menit.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {langkahMudah.map((step, idx) => (
              <div
                key={step.nomor}
                className="group relative flex flex-col justify-between rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 p-7 shadow-sm backdrop-blur-xl transition-all hover:border-emerald-500/50 hover:-translate-y-1.5"
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-4xl font-black text-emerald-500">
                      {step.nomor}
                    </span>
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100 mb-1">{step.judul}</h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-3">{step.tagline}</p>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 mb-6">{step.teks}</p>

                  {/* Rich Visual Mini-Graphic per Step */}
                  {idx === 0 && (
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 p-4 text-center">
                      <div className="relative mx-auto size-24 p-2 bg-white rounded-xl shadow-md border border-emerald-500/30 overflow-hidden">
                        <QrCode className="size-full text-zinc-900" />
                        <div className="absolute inset-x-2 h-1 bg-emerald-500 rounded-full animate-laser-scan" />
                      </div>
                      <span className="mt-3 block text-[11px] font-bold text-emerald-500">
                        Scan QR Sekali • Cloud Terhubung
                      </span>
                    </div>
                  )}

                  {idx === 1 && (
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 p-4 space-y-2 text-left">
                      <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 dark:text-zinc-300 border-b border-border pb-1.5">
                        <span>Form Profil Toko</span>
                        <span className="text-emerald-500">Siap Pakai</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Katalog Produk: Otomatis &amp; Rapi</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Sistem Bayar COD: J&amp;T &bull; SiCepat</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        <span>Garansi 7 Hari: Format Ramah Pembeli</span>
                      </div>
                    </div>
                  )}

                  {idx === 2 && (
                    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 p-4 text-center">
                      <div className="relative mx-auto size-16 rounded-full border-2 border-emerald-500/40 flex items-center justify-center bg-emerald-500/10">
                        <Radio className="size-7 text-emerald-500 animate-pulse" />
                        <div className="absolute inset-0 rounded-full border border-emerald-400/50 animate-ping opacity-30" />
                      </div>
                      <span className="mt-3 block text-[11px] font-black text-emerald-500">
                        Siaga Nonstop Jam 02:45 Subuh
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Balas Iklan Instan Tanpa Delay
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800/80 pt-3 text-[11px] text-muted-foreground">
                  ✓ {step.detail}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 7. IMPACT & ROI COMPARISON CARDS (CONVENTIONAL VS BALASIN) */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="perbandingan" className="scroll-reveal py-24 border-y border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/50 dark:bg-zinc-950/50">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Perbandingan Nyata
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Kenapa Harus Beralih ke Balasin AI?
              </h2>
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Perbandingan langsung antara CS manual konvensional dengan sistem CS AI Balasin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Conventional Store Card */}
              <div className="rounded-3xl border border-red-500/20 bg-white/70 dark:bg-zinc-900/50 p-8 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                    <XCircle className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">CS Manual Konvensional</h3>
                    <p className="text-xs text-red-500 font-semibold">Tinggi biaya, rentan kehilangan leads iklan</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
                  {perbandinganFitur.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-zinc-200 dark:border-zinc-800/80 pb-3">
                      <XCircle className="size-4 shrink-0 text-red-500 mt-0.5" />
                      <div>
                        <strong className="block text-xs font-bold text-zinc-900 dark:text-zinc-200">
                          {item.fitur}
                        </strong>
                        <span className="text-xs">{item.manual}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Balasin Store Card (Glowing Neon Pulse) */}
              <div className="relative rounded-3xl border border-emerald-500/50 bg-white/95 dark:bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl animate-border-pulse">
                <div className="absolute top-4 right-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400">
                  REKOMENDASI SELLER ✨
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/30">
                    <Zap className="size-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Balasin CS AI</h3>
                    <p className="text-xs text-emerald-500 font-bold">Otomatis 24/7, respon kilat tanpa lelah</p>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-200">
                  {perbandinganFitur.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 border-b border-emerald-500/20 pb-3">
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                      <div>
                        <strong className="block text-xs font-bold text-zinc-900 dark:text-zinc-100">
                          {item.fitur}
                        </strong>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {item.balasin}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 8. REVISI TESTIMONI ASLI SELLER INDONESIA (BUKAN AI)       */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="testimoni" className="scroll-reveal py-24 overflow-hidden relative">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center mb-12">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3">
              <Star className="size-3.5 fill-current text-amber-400" />
              Cerita Nyata Penjual Online
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Kata Mereka yang Sudah Pakai Balasin AI
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Bukan ulasan rekayasa. Ini pengalaman asli owner toko online di Indonesia setelah mengaktifkan bot WhatsApp otomatis.
            </p>
          </div>

          {/* Continuous Infinite Moving Testimonials Marquee */}
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
            <div className="animate-marquee-testimonials flex gap-6 items-stretch">
              {[...testimoniList, ...testimoniList].map((t, idx) => (
                <div
                  key={idx}
                  className="flex w-[380px] shrink-0 flex-col justify-between rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 p-6 shadow-md backdrop-blur-xl transition-all hover:scale-105 hover:border-emerald-500/50 cursor-pointer"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex text-amber-400">
                        {[...Array(t.bintang)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {t.hasil}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 italic">
                      "{t.isi}"
                    </p>
                  </div>

                  <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800/80 pt-4 flex items-center gap-3">
                    <div
                      className="size-12 rounded-full shrink-0 shadow-lg ring-2 ring-emerald-500/40 flex items-center justify-center font-bold text-sm select-none text-white"
                      style={{ background: t.gradien }}
                      aria-hidden="true"
                    >
                      {t.inisial}
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">{t.nama}</h4>
                        <span className="text-[10px] text-emerald-500 font-bold">✓ Terverifikasi</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{t.bisnis}</p>
                      <p className="text-[10px] text-zinc-400 truncate">{t.lokasi}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 9. FAQ ACCORDION                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section id="faq" className="scroll-reveal border-t border-zinc-200/80 dark:border-zinc-800/80 py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="mb-12 text-center">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Punya Pertanyaan?
              </span>
              <h2 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                Pertanyaan Sering Diajukan
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Semua hal yang perlu Anda ketahui tentang Balasin &amp; aktivasi lisensi resmi.
              </p>
            </div>

            <div className="space-y-4">
              {faqItems.map((faq, idx) => (
                <details
                  key={idx}
                  className="group rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 p-6 shadow-xs backdrop-blur-xl transition-all hover:border-emerald-500/40 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between text-base font-bold text-zinc-900 dark:text-zinc-100">
                    <span>{faq.q}</span>
                    <span className="ml-4 shrink-0 transition duration-300 group-open:-rotate-180">
                      <ChevronDown className="size-5 text-emerald-500" />
                    </span>
                  </summary>
                  <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* 10. BOLD HIGH-CONVERSION BANNER & CLEAN FOOTER             */}
        {/* ══════════════════════════════════════════════════════════ */}
        <section className="scroll-reveal-scale mx-auto max-w-5xl px-4 sm:px-6 pb-24">
          <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-8 text-center text-white shadow-2xl md:p-14">
            {/* Background Glows */}
            <div className="pointer-events-none absolute -top-12 -right-12 size-64 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-64 rounded-full bg-black/30 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Mulai Sekarang Juga
              </span>

              <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Siap Melayani Pelanggan 24 Jam Tanpa Pegal?
              </h2>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-emerald-100">
                Hubungkan WhatsApp bisnis Anda dan hubungi Admin untuk aktivasi lisensi resmi. Omset penjualan terus mengalir tanpa bikin pembeli menunggu!
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  className="relative group overflow-hidden rounded-full bg-white px-8 py-6 font-extrabold text-emerald-950 shadow-xl transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95 text-base w-full sm:w-auto cursor-pointer"
                  onClick={() => {
                    if (googleUser) {
                      navigate({ to: "/app" });
                    } else {
                      setShowLogin(true);
                    }
                  }}
                  type="button"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Buka Dashboard Sekarang
                    <ArrowRight className="size-5" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-200/50 to-transparent animate-light-sweep" />
                </Button>

                <a
                  href="https://wa.me/6285215902047?text=Halo%20Admin%20Balasin%2C%20saya%20ingin%20aktivasi%20lisensi%20WhatsApp%20saya."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-[#25D366] hover:bg-[#128C7E] px-8 py-4 font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95 text-base flex items-center justify-center gap-2 w-full sm:w-auto"
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

        {/* Clean Footer */}
        <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 py-12 bg-white/50 dark:bg-zinc-950/50">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2.5">
              <img src="/chatbot_wa.png" alt="Balasin" className="h-7 w-7 rounded-full object-contain" />
              <span className="text-base font-black text-zinc-900 dark:text-zinc-100">
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
      {/* 11. FLOATING STICKY WHATSAPP ADMIN BUTTON                  */}
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

export default Landing;
