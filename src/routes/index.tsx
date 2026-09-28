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
  },
  {
    icon: Bot,
    judul: "Pintar Jawab Pertanyaan",
    tagline: "Hafal Semua Info Toko",
    teks: "AI otomatis menjawab pertanyaan seputar harga, varian produk, stok, hingga syarat komplain berdasarkan template info yang Anda siapkan.",
  },
  {
    icon: Store,
    judul: "Template Bisnis Siap Pakai",
    tagline: "Tanpa Bingung Menulis",
    teks: "Cukup isi form ringkas: profil toko, jam buka, kurir pengiriman, ketentuan COD, hingga garansi produk. AI langsung memahaminya.",
  },
  {
    icon: QrCode,
    judul: "Sambung WhatsApp 1 Menit",
    tagline: "Tinggal Scan QR",
    teks: "Sama mudahnya seperti login WhatsApp Web di komputer. Cukup pindai QR dari ponsel Anda dan sistem langsung aktif melayani.",
  },
  {
    icon: TrendingUp,
    judul: "Naikkan Peluang Penjualan",
    tagline: "Closing Lebih Cepat",
    teks: "Pembeli paling suka toko yang membalas instan. Jangan biarkan chat masuk di tengah malam basi karena CS sedang istirahat.",
  },
  {
    icon: ShieldCheck,
    judul: "Data Toko Aman & Privat",
    tagline: "100% Milik Anda",
    teks: "Informasi produk, nomor WhatsApp, dan percakapan pelanggan tersimpan aman dan terenkripsi khusus untuk akun Google Anda.",
  },
];

const langkahMudah = [
  {
    nomor: "01",
    judul: "Pindai QR WhatsApp",
    teks: "Buka menu WhatsApp di ponsel Anda, scan QR code di dashboard. Nomor Anda langsung tersambung secara resmi.",
  },
  {
    nomor: "02",
    judul: "Pilih Template & Isi Info Toko",
    teks: "Pilih template panduan (jam buka, katalog, cara order, pengiriman COD). Tulis apa adanya, AI yang akan menyusun bahasa ramahnya.",
  },
  {
    nomor: "03",
    judul: "AI Siaga Balas 24 Jam Nonstop",
    teks: "Nyalakan tombol otomatis. Setiap ada pesan baru atau klik dari iklan, bot langsung merespons ramah dan tuntas!",
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

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      try {
        if (event.data?.type === "GOOGLE_AUTH_SUCCESS") {
          const { token, user } = event.data as {
            token: string;
            user: { name: string; email: string; picture: string; avatarUrl?: string | null };
          };
          setOauthError(null);
          try {
            saveSession(token, "tenant");
            saveGoogleUser({
              ...user,
              avatarUrl: user.avatarUrl ?? user.picture ?? null,
              picture: user.picture || user.avatarUrl || "",
            });
          } catch {
            setOauthError("Gagal menyimpan sesi, coba lagi");
            return;
          }
          toast.success("Berhasil masuk dengan Google");
          setShowLogin(false);
          googleClickLockRef.current = false;
          navigate({ to: "/app" });
        }
        if (event.data?.type === "GOOGLE_AUTH_ERROR") {
          const msg = (event.data?.message as string) || "Autentikasi Google gagal";
          setOauthError(msg);
          toast.error(msg);
          googleClickLockRef.current = false;
        }
      } catch {
        setOauthError("Terjadi kesalahan saat memproses login Google");
        googleClickLockRef.current = false;
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [navigate]);

  const handleGoogleClick = () => {
    if (googleClickLockRef.current) return;
    googleClickLockRef.current = true;
    setOauthError(null);
    try {
      const origin = encodeURIComponent(window.location.origin);
      const popup = window.open(
        `${API_BASE}/auth/google?origin=${origin}`,
        "google_oauth",
        "width=500,height=600,left=200,top=100",
      );
      if (!popup) {
        setOauthError("Popup diblokir browser. Izinkan popup untuk login Google.");
        toast.error("Popup diblokir browser");
        googleClickLockRef.current = false;
        return;
      }
      const timer = window.setInterval(() => {
        if (popup.closed) {
          window.clearInterval(timer);
          googleClickLockRef.current = false;
        }
      }, 800);
      window.setTimeout(() => {
        googleClickLockRef.current = false;
        window.clearInterval(timer);
      }, 30000);
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
      <div className="surface-grid min-h-screen">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 mx-auto flex max-w-6xl items-center justify-between border-b border-border/40 bg-background/80 px-6 py-4 backdrop-blur-md">
          <Link to="/" className="flex items-center gap-2">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle className="size-9 rounded-xl" />
            {googleUser ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-card/60 p-1 pr-3 transition-colors hover:bg-accent focus-visible:outline-none">
                  <span className="relative flex size-8 shrink-0">
                    {avatarSrc && !avatarError ? (
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        onError={() => setAvatarError(true)}
                        className="size-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {initials}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-sm font-medium sm:inline-block">
                    {googleUser.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>
                {isOpen && (
                  <div className="absolute top-full right-0 pt-2 z-50">
                    <div className="w-56 rounded-xl border bg-card p-1.5 shadow-xl">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-semibold">{googleUser.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground truncate">
                          {googleUser.email}
                        </p>
                      </div>
                      <div className="-mx-1 my-1 h-px bg-border" />
                      <Link
                        to="/app"
                        onClick={() => setIsOpen(false)}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400 outline-none hover:bg-emerald-500/10"
                      >
                        <LayoutDashboard className="size-4" />
                        Buka Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          setShowLogin(true);
                        }}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none hover:bg-accent"
                      >
                        <UserPlus className="size-4" />
                        Tambahkan Akun lain
                      </button>
                      <button
                        onClick={() => handleLogout()}
                        className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none text-red-500 hover:bg-red-500/10"
                      >
                        <LogOut className="size-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowLogin(true)}
                className="cursor-pointer rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(16,185,129,0.35)] active:translate-y-0"
              >
                Masuk
              </button>
            )}
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
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {isError && (
                  <p className="text-red-500 text-xs mt-1 leading-tight">
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
                className="cursor-pointer w-full flex items-center justify-center gap-2 rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-medium shadow-xs hover:bg-accent transition-colors"
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
                <p className="text-amber-600 dark:text-amber-400 text-xs leading-tight rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 px-3 py-2">
                  {oauthError}
                </p>
              )}

              <Button
                type="submit"
                className="cursor-pointer w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white font-medium rounded-xl"
              >
                Masuk
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* HERO SECTION */}
        <section className="mx-auto max-w-6xl px-6 pt-12 pb-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-6">
            <Sparkles className="size-3.5" />
            <span>Customer Service AI Siap Pakai untuk UMKM & Bisnis Online</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground">
            Customer Service WhatsApp <br className="hidden sm:inline" />
            <span className="hero-glimmer">yang Membalas Otomatis</span> & Cerdas
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Sambungkan WhatsApp bisnis Anda dalam 1 menit. AI menjawab chat pelanggan, merespons
            klik iklan, dan melayani tanya-jawab produk seketika — tanpa bikin calon pembeli
            menunggu.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              className="cta-button rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-7 shadow-lg"
              onClick={() => {
                if (googleUser) {
                  navigate({ to: "/app" });
                } else {
                  setShowLogin(true);
                }
              }}
              type="button"
            >
              Mulai Sekarang Gratis
              <ArrowRight className="size-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-xl border-border bg-card/50 hover:bg-accent font-medium px-6"
              onClick={() => {
                const el = document.getElementById("simulasi-chat");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              type="button"
            >
              Lihat Contoh Simulasi
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Respon Balasan &lt; 2 Detik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Tanpa Koding &amp; Tanpa Server</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>Template Bisnis Sudah Tersedia</span>
            </div>
          </div>
        </section>

        {/* INTERACTIVE CHAT SIMULATION SECTION */}
        <section id="simulasi-chat" className="mx-auto max-w-5xl px-6 py-12">
          <div className="rounded-3xl border border-border bg-card/70 p-6 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center max-w-xl mx-auto mb-8">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
                Simulasi Langsung
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mt-1 text-foreground">
                Lihat Bagaimana Balasin Bekerja
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Pilih skenario di bawah untuk melihat contoh percakapan nyata saat calon pembeli
                menghubungi WhatsApp Anda.
              </p>
            </div>

            {/* Scenario Switcher Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {(Object.keys(simulasiChat) as Array<keyof typeof simulasiChat>).map((key) => {
                const item = simulasiChat[key];
                const active = skenarioAktif === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSkenarioAktif(key)}
                    className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      active
                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
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
            <div className="mx-auto max-w-md rounded-2xl overflow-hidden border border-border shadow-xl bg-[#e5ddd5] dark:bg-[#0b141a]">
              {/* WhatsApp App Bar */}
              <div className="bg-[#075e54] dark:bg-[#202c33] text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="size-10 rounded-full bg-emerald-700 flex items-center justify-center font-bold text-white text-sm">
                      👟
                    </div>
                    <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 border-2 border-[#075e54] dark:border-[#202c33]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold leading-tight">Toko Sneakers Official</h3>
                    <p className="text-[11px] text-emerald-200 dark:text-emerald-400 leading-tight">
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

              {/* Chat Messages Body */}
              <div className="p-4 space-y-3 min-h-[340px] flex flex-col justify-end bg-[radial-gradient(#0000000a_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px]">
                <div className="text-center my-1">
                  <span className="bg-white/80 dark:bg-[#182229] text-[10px] text-muted-foreground px-2.5 py-1 rounded-md shadow-xs">
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
                            ? "bg-[#d9fdd3] text-gray-900 dark:bg-[#005c4b] dark:text-white rounded-tr-xs"
                            : "bg-white text-gray-900 dark:bg-[#202c33] dark:text-gray-100 rounded-tl-xs"
                        }`}
                      >
                        {"media" in msg && msg.media && (
                          <div className="mb-2 p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-center">
                            <span className="text-[11px] font-medium block">
                              {(msg.media as { label: string }).label}
                            </span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
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

              {/* Chat Input Bar Mock */}
              <div className="bg-[#f0f2f5] dark:bg-[#202c33] p-2.5 flex items-center gap-2 border-t border-black/5 dark:border-white/5">
                <input
                  type="text"
                  readOnly
                  placeholder="Ketik pesan WhatsApp..."
                  className="flex-1 bg-white dark:bg-[#2a3942] rounded-full px-4 py-2 text-xs outline-none text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  className="size-8 rounded-full bg-[#00a884] text-white flex items-center justify-center shadow-xs"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3 STEPS HOW IT WORKS */}
        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              Sangat Mudah
            </span>
            <h2 className="text-3xl font-bold mt-1 text-foreground">
              3 Langkah Praktis untuk Memulai
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Tidak perlu keahlian teknis. Anda bisa mengaktifkan CS WhatsApp pintar ini dalam
              hitungan menit.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {langkahMudah.map((step) => (
              <div
                key={step.nomor}
                className="panel p-6 rounded-2xl relative flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
              >
                <div>
                  <span className="text-3xl font-black text-emerald-600/30 dark:text-emerald-400/20 font-mono">
                    {step.nomor}
                  </span>
                  <h3 className="text-lg font-bold mt-2 text-foreground">{step.judul}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{step.teks}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* KEY FEATURES GRID */}
        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
              Fitur Lengkap
            </span>
            <h2 className="text-3xl font-bold mt-1 text-foreground">
              Semua yang Dibutuhkan Penjual Online
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              Dirancang khusus untuk membantu toko melayani lebih banyak pelanggan tanpa kelelahan.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {fiturBisnis.map((f) => (
              <article
                key={f.judul}
                className="flex h-full flex-col panel feature-card p-6 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="feature-icon flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <f.icon className="size-5" />
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                    {f.tagline}
                  </span>
                </div>
                <h3 className="text-base font-bold text-foreground">{f.judul}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.teks}</p>
              </article>
            ))}
          </div>
        </section>

        {/* CTA FOOTER BANNER */}
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 md:p-12 text-white shadow-2xl text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 size-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Siap Melayani Pelanggan 24 Jam Tanpa Pegal?
              </h2>
              <p className="mt-4 text-emerald-100 text-sm md:text-base leading-relaxed">
                Sambungkan WhatsApp Anda sekarang. Biarkan AI membalas chat pembeli secepat kilat
                sehingga omset penjualan bisnis Anda terus mengalir.
              </p>
              <div className="mt-8 flex justify-center">
                <Button
                  size="lg"
                  className="rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold px-8 shadow-lg hover:shadow-xl transition-all"
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
                  <ArrowRight className="size-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-border/50 py-8 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Balasin — Solusi Cerdas Customer Service WhatsApp.</p>
        </footer>
      </div>
    </>
  );
}
