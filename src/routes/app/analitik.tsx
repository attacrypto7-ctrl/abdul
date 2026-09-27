import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Coins,
  HelpCircle,
  MessagesSquare,
  TrendingUp,
  BarChart2,
  InboxIcon,
  RefreshCw,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { formatNumber, getAnalytics } from "@/mock/api";

export const Route = createFileRoute("/app/analitik")({
  head: () => ({
    meta: [
      { title: "Analitik — Dashboard Balasin" },
      {
        name: "description",
        content: "Statistik pesan, efisiensi AI, dan topik pertanyaan yang paling sering diajukan pelanggan.",
      },
      { property: "og:title", content: "Analitik — Dashboard Balasin" },
      { property: "og:description", content: "Statistik pesan dan analisa interaksi bot WhatsApp bisnis Anda." },
    ],
  }),
  component: AnalitikPage,
});

function EmptyChart({ label }: { label: string }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/20 text-center px-4">
      <InboxIcon className="size-8 text-muted-foreground/40" />
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/60">Data akan muncul otomatis setelah bot aktif menerima pesan.</p>
    </div>
  );
}

function AnalitikPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["analytics"],
    queryFn: getAnalytics,
  });

  const chatHarian: { hari: string; chat: number; gagal: number }[] = data?.chatHarian ?? [];
  const pertanyaanTeratas: { pertanyaan: string; jumlah: number }[] = data?.pertanyaanTeratas ?? [];

  const totalChat = chatHarian.reduce((a, c) => a + c.chat, 0);
  const totalGagal = chatHarian.reduce((a, c) => a + c.gagal, 0);
  const totalDijawab = totalChat - totalGagal;
  const suksesPersen = totalChat > 0 ? Math.round((totalDijawab / totalChat) * 100) : 0;
  const efisiensiJam = totalChat > 0 ? Math.max(1, Math.round((totalChat * 4) / 60)) : 0;
  const maxPertanyaan = pertanyaanTeratas[0]?.jumlah || 1;

  return (
    <>
      <PageHeader
        title="Analitik & Performa"
        description="Pantau volume chat masuk, efisiensi balasan otomatis AI, dan topik yang paling sering ditanyakan pelanggan."
        action={
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-2"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} />
            Perbarui Data
          </Button>
        }
      />

      {/* STAT CARDS */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pesan Masuk"
          value={formatNumber(totalChat)}
          icon={MessagesSquare}
          hint={totalChat > 0 ? "Chat pelanggan 7 hari terakhir" : "Bot belum menerima pesan"}
        />
        <StatCard
          label="Efisiensi Balasan Otomatis"
          value={totalChat > 0 ? `${suksesPersen}%` : "—"}
          icon={TrendingUp}
          tone={suksesPersen >= 80 ? "success" : totalChat > 0 ? "warning" : "default"}
          hint={totalChat > 0 ? "Dijawab tuntas oleh AI" : "Data belum tersedia"}
        />
        <StatCard
          label="Estimasi Jam Kerja Hemat"
          value={efisiensiJam > 0 ? `${efisiensiJam} Jam` : "—"}
          icon={Coins}
          hint={efisiensiJam > 0 ? "Waktu CS yang dihemat minggu ini" : "Dihitung dari total chat dijawab"}
        />
        <StatCard
          label="Topik Pertanyaan Populer"
          value={pertanyaanTeratas.length > 0 ? String(pertanyaanTeratas.length) : "—"}
          icon={HelpCircle}
          hint={pertanyaanTeratas.length > 0 ? "Pertanyaan paling sering muncul" : "Belum ada data topik"}
        />
      </div>

      {/* CHARTS ROW */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Bar Chart: Volume Chat Harian */}
        <div className="panel p-5 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="size-4 text-emerald-500" />
              Volume Chat 7 Hari Terakhir
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chat dijawab bot vs dialihkan ke admin manusia
            </p>
          </div>

          {chatHarian.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chatHarian} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.12} vertical={false} />
                  <XAxis dataKey="hari" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "10px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="chat" name="Dijawab Otomatis" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gagal" name="Dialihkan ke Admin" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Belum ada data volume chat." />
          )}
        </div>

        {/* Efisiensi & Statistik dari Data Real */}
        <div className="panel p-5 rounded-2xl">
          <div className="mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-500" />
              Ringkasan Performa Bot
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Dihitung dari data percakapan aktual minggu ini
            </p>
          </div>

          {totalChat > 0 ? (
            <div className="flex flex-col justify-center space-y-5 px-1 h-56">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Chat Dijawab Otomatis</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold tabular-nums">
                    {totalDijawab} / {totalChat}
                  </span>
                </div>
                <Progress value={suksesPersen} className="h-2.5" />
                <p className="text-[11px] text-muted-foreground">{suksesPersen}% diselesaikan oleh AI tanpa intervensi admin</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span>Chat Dialihkan ke Admin</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold tabular-nums">
                    {totalGagal} / {totalChat}
                  </span>
                </div>
                <Progress
                  value={totalChat > 0 ? Math.round((totalGagal / totalChat) * 100) : 0}
                  className="h-2.5 [&>div]:bg-amber-500"
                />
                <p className="text-[11px] text-muted-foreground">
                  {totalChat > 0 ? Math.round((totalGagal / totalChat) * 100) : 0}% perlu penanganan manual
                </p>
              </div>

              <div className="pt-3 border-t border-border/40 rounded-xl bg-secondary/30 p-3 -mx-1">
                <p className="text-xs font-semibold text-foreground">💡 Tips Optimasi</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  Tambahkan FAQ baru di halaman Pengetahuan AI untuk mengurangi eskalasi ke admin.
                </p>
                <Link to="/app/pengetahuan" className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium hover:underline mt-1 inline-block">
                  Lengkapi FAQ →
                </Link>
              </div>
            </div>
          ) : (
            <EmptyChart label="Belum ada data performa. Aktifkan bot dan mulai terima pesan." />
          )}
        </div>
      </div>

      {/* TOP PERTANYAAN */}
      <div className="panel mt-6 p-5 rounded-2xl">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <HelpCircle className="size-4 text-emerald-500" />
              Pertanyaan Paling Sering Diajukan
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Gunakan data ini untuk memperkaya FAQ dan template iklan Anda.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="rounded-xl text-xs shrink-0">
            <Link to="/app/pengetahuan">Kelola FAQ</Link>
          </Button>
        </div>

        {pertanyaanTeratas.length > 0 ? (
          <div className="mt-5 space-y-4">
            {pertanyaanTeratas.map((p, index) => (
              <div key={p.pertanyaan} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {index + 1}
                    </span>
                    <span className="font-medium text-foreground truncate">{p.pertanyaan}</span>
                  </div>
                  <span className="text-muted-foreground shrink-0 tabular-nums">{formatNumber(p.jumlah)}×</span>
                </div>
                <Progress value={(p.jumlah / maxPertanyaan) * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 flex flex-col items-center gap-3 py-10 rounded-xl border border-dashed border-border bg-secondary/20 text-center px-4">
            <HelpCircle className="size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Belum ada pertanyaan yang terhimpun.</p>
            <p className="text-xs text-muted-foreground/60">
              Data topik pertanyaan akan muncul otomatis setelah bot aktif merespons pesan masuk.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
