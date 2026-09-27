import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Coins,
  HelpCircle,
  MessagesSquare,
  TrendingUp,
  HeartHandshake,
  Building2,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  Wallet,
  Users,
  Award,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatNumber, getAnalytics, getTenantMe } from "@/mock/api";

export const Route = createFileRoute("/app/analitik")({
  head: () => ({
    meta: [
      { title: "Analitik — Dashboard Balasin" },
      {
        name: "description",
        content: "Statistik pesan, efisiensi AI, dan analisa data topik pertanyaan donatur atau pelanggan.",
      },
      { property: "og:title", content: "Analitik — Dashboard Balasin" },
      { property: "og:description", content: "Statistik pesan dan analisa interaksi bisnis atau yayasan." },
    ],
  }),
  component: AnalitikPage,
});

// Data Simulasi Analisa Khusus Skup Yayasan & Lembaga Sosial
const dataYayasanProgram = [
  { program: "Santunan Anak Yatim", jumlah: 142, persen: 38 },
  { program: "Paket Pangan Dhuafa", jumlah: 98, persen: 26 },
  { program: "Zakat Penghasilan & Maal", jumlah: 68, persen: 18 },
  { program: "Jemput Donasi Sembako", jumlah: 45, persen: 12 },
  { program: "Bantuan Medis Darurat", jumlah: 24, persen: 6 },
];

const dataYayasanMetode = [
  { metode: "Transfer Bank Resmi (BSI/Mandiri)", jumlah: 215, persen: 62 },
  { metode: "QRIS Donasi Instan", jumlah: 90, persen: 26 },
  { metode: "Kurir Jemput Donasi ke Rumah", jumlah: 42, persen: 12 },
];

const pertanyaanDonaturTerpopuler = [
  { pertanyaan: "Ke mana nomor rekening resmi donasi yayasan?", jumlah: 154, kategori: "Rekening Resmi" },
  { pertanyaan: "Bagaimana alur titip doa & hajat bersama adik-adik yatim?", jumlah: 112, kategori: "Titip Doa & Hajat" },
  { pertanyaan: "Berapa nisab dan hitungan zakat penghasilan bulan ini?", jumlah: 98, kategori: "Kalkulator Zakat" },
  { pertanyaan: "Apakah ada layanan jemput donasi sembako/beras ke rumah?", jumlah: 67, kategori: "Jemput Donasi" },
  { pertanyaan: "Apakah yayasan memiliki izin resmi Kemenkumham & Dinsos?", jumlah: 35, kategori: "Transparansi & Legalitas" },
];

function AnalitikPage() {
  const { data } = useQuery({ queryKey: ["analytics"], queryFn: getAnalytics });
  const { data: tenant } = useQuery({ queryKey: ["tenant-me"], queryFn: getTenantMe });

  const isYayasanTenant =
    Boolean(tenant?.industri?.includes("Yayasan")) ||
    Boolean(tenant?.industri?.includes("Profit")) ||
    Boolean(tenant?.industri?.includes("Sosial"));

  const chatHarian = data?.chatHarian ?? [];
  const pertanyaanTeratas = data?.pertanyaanTeratas ?? [];

  const totalChatMingguan = (chatHarian as { chat: number; gagal: number }[]).reduce(
    (a, c) => a + c.chat,
    0,
  );
  const totalGagalMingguan = (chatHarian as { chat: number; gagal: number }[]).reduce(
    (a, c) => a + c.gagal,
    0,
  );
  const suksesPersen =
    totalChatMingguan > 0
      ? Math.round(((totalChatMingguan - totalGagalMingguan) / totalChatMingguan) * 100)
      : 98;
  const maxPertanyaan = pertanyaanTeratas[0]?.jumlah || 1;

  return (
    <>
      <PageHeader
        title="Analitik & Performa"
        description="Pantau volume interaksi chat masuk, efisiensi balasan otomatis AI, dan topik yang paling sering ditanyakan."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
              {isYayasanTenant ? (
                <>
                  <HeartHandshake className="size-3.5 text-emerald-500" />
                  <span>Klasifikasi: Yayasan &amp; Sosial</span>
                </>
              ) : (
                <>
                  <Building2 className="size-3.5 text-emerald-500" />
                  <span>Klasifikasi: {tenant?.industri || "Toko & Bisnis Komersial"}</span>
                </>
              )}
            </span>
            <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
              <Link to="/app/pengaturan">Ganti di Pengaturan</Link>
            </Button>
          </div>
        }
      />

      {/* ========================================================= */}
      {/* MODE YAYASAN & LEMBAGA SOSIAL */}
      {/* ========================================================= */}
      {isYayasanTenant ? (
        <>
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <HeartHandshake className="size-5" />
              </span>
              <div>
                <h2 className="text-xs font-bold text-foreground">
                  Analisa Khusus Lembaga Sosial &amp; Yayasan
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Memantau minat program kebaikan, pertanyaan donatur, dan efisiensi respon layanan kemanusiaan.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-card px-3 py-1 rounded-full border border-border">
              Akuntabilitas 100% Terjaga
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Interaksi Donatur"
              value={formatNumber(347)}
              icon={MessagesSquare}
              hint="Chat donatur & titip doa minggu ini"
            />
            <StatCard
              label="Respon Instan Otomatis"
              value="99.4%"
              icon={TrendingUp}
              tone="success"
              hint="Langsung dijawab < 2 detik"
            />
            <StatCard
              label="Jam Kerja Pengurus Hemat"
              value="24 Jam"
              icon={Clock}
              hint="Waktu admin yayasan yang dihemat"
            />
            <StatCard
              label="Program Kebaikan Aktif"
              value="5 Program"
              icon={Award}
              hint="ZISWAF, Yatim, Pangan, dll"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            {/* Chart Sebaran Minat Program */}
            <div className="panel p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Program Kebaikan Paling Banyak Ditanyakan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Distribusi ketertarikan calon donatur terhadap program yayasan
                  </p>
                </div>
                <div className="space-y-3.5 mt-4">
                  {dataYayasanProgram.map((item) => (
                    <div key={item.program} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{item.program}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{item.jumlah} chat</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {item.persen}%
                          </span>
                        </div>
                      </div>
                      <Progress value={item.persen} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-5 text-[11px] text-muted-foreground border-t border-border/40 pt-3">
                💡 <em>Insight:</em> Program Santunan Anak Yatim dan Pangan Dhuafa menjadi program favorit dengan interaksi tertinggi.
              </p>
            </div>

            {/* Metode Donasi yang Diminati */}
            <div className="panel p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Pilihan Kanal Penyaluran Donatur
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Kanal yang paling sering diminta petunjuknya oleh donatur
                  </p>
                </div>
                <div className="space-y-3.5 mt-4">
                  {dataYayasanMetode.map((m) => (
                    <div key={m.metode} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-foreground">{m.metode}</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {m.persen}%
                        </span>
                      </div>
                      <Progress value={m.persen} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 p-3 rounded-xl bg-secondary/40 border border-border/60 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground block mb-0.5">
                  Rekomendasi Operasional:
                </span>
                Sertakan QRIS resmi dan nomor rekening BSI/Mandiri dalam template profil yayasan agar donatur dapat mentransfer tanpa jeda.
              </div>
            </div>
          </div>

          {/* Top Pertanyaan Donatur */}
          <div className="panel mt-6 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Pertanyaan Donatur &amp; Titip Doa Paling Sering Muncul
                </h3>
                <p className="text-xs text-muted-foreground">
                  Dikelola dan dijawab otomatis oleh AI berdasarkan template yayasan Anda
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                100% Terjawab Cepat
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {pertanyaanDonaturTerpopuler.map((p, idx) => (
                <div
                  key={p.pertanyaan}
                  className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-secondary/30 border border-border/40 hover:bg-secondary/60 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {idx + 1}
                    </span>
                    <p className="text-xs font-medium text-foreground">{p.pertanyaan}</p>
                  </div>
                  <div className="flex items-center gap-3 ml-auto">
                    <span className="text-[11px] bg-card px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {p.kategori}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {p.jumlah} kali
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* ========================================================= */
        /* MODE UMUM (BISNIS / TOKO / E-COMMERCE)                    */
        /* ========================================================= */
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Pesan Masuk"
              value={formatNumber(totalChatMingguan || 128)}
              icon={MessagesSquare}
              hint="Chat pelanggan minggu ini"
            />
            <StatCard
              label="Efisiensi Balasan Otomatis"
              value={totalChatMingguan > 0 ? `${suksesPersen}%` : "98%"}
              icon={TrendingUp}
              tone="success"
              hint="Dijawab tuntas oleh AI"
            />
            <StatCard
              label="Estimasi Jam Kerja Hemat"
              value={`${Math.max(1, Math.round(((totalChatMingguan || 128) * 4) / 60))} Jam`}
              icon={Coins}
              hint="Waktu CS yang dihemat"
            />
            <StatCard
              label="Topik Pertanyaan Populer"
              value={String(pertanyaanTeratas.length || 5)}
              icon={HelpCircle}
              hint="Pertanyaan paling sering muncul"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="panel p-5 rounded-2xl">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Volume Chat 7 Hari Terakhir</h3>
                <p className="text-xs text-muted-foreground">
                  Jumlah chat dijawab bot vs dialihkan ke admin manusia
                </p>
              </div>
              {chatHarian.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chatHarian}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="hari" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="chat" name="Dijawab Otomatis" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="gagal" name="Dialihkan ke Admin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                  Belum ada data aktivitas chat.
                </div>
              )}
            </div>

            <div className="panel p-5 rounded-2xl">
              <div className="mb-4">
                <h3 className="text-sm font-semibold">Rasio Kecepatan &amp; Kepuasan</h3>
                <p className="text-xs text-muted-foreground">Perbandingan respon instan vs waktu tunggu</p>
              </div>
              <div className="h-72 flex flex-col justify-center space-y-5 px-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Respon Kilat (&lt; 2 Detik)</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">96%</span>
                  </div>
                  <Progress value={96} className="h-2.5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Akurasi Jawaban dari FAQ</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">94%</span>
                  </div>
                  <Progress value={94} className="h-2.5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Tingkat Kepuasan Pelanggan</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">98%</span>
                  </div>
                  <Progress value={98} className="h-2.5" />
                </div>
              </div>
            </div>
          </div>

          <div className="panel mt-6 p-5 rounded-2xl">
            <h3 className="text-sm font-semibold">Pertanyaan Paling Sering Diajukan</h3>
            <p className="text-xs text-muted-foreground">
              Bisa digunakan untuk memperkaya data FAQ dan materi promosi iklan Anda.
            </p>

            {pertanyaanTeratas.length > 0 ? (
              <div className="mt-5 space-y-4">
                {pertanyaanTeratas.map((p: { pertanyaan: string; jumlah: number }, index: number) => (
                  <div key={p.pertanyaan} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {index + 1}. {p.pertanyaan}
                      </span>
                      <span className="text-muted-foreground">{formatNumber(p.jumlah)} kali</span>
                    </div>
                    <Progress value={(p.jumlah / maxPertanyaan) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                Belum ada data pertanyaan yang terhimpun.
              </p>
            )}
          </div>
        </>
      )}
    </>
  );
}
