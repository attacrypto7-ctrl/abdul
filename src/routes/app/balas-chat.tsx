import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Save, Loader2, Info } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// Tingkat "kepintaran" bot — nama model AI teknis disembunyikan dari tenant,
// dipetakan ke model aslinya di sisi backend.
const tingkatAi = [
  { id: "hemat", nama: "Hemat", catatan: "Cepat & murah, cocok untuk chat sehari-hari" },
  { id: "seimbang", nama: "Seimbang", catatan: "Lebih pintar, biaya sedang" },
  { id: "akurat", nama: "Paling Akurat", catatan: "Paling teliti, untuk jawaban yang harus presisi" },
];

interface BotSettings {
  namaBot: string;
  instruksi: string;
  ambang: number;
  aktif: boolean;
  tingkatAi: string;
  bahasa: string;
  sapaanOtomatis: boolean;
  berhentiSetelahAdmin: boolean;
  simpanTranskrip: boolean;
}

const defaultSettings: BotSettings = {
  namaBot: "",
  instruksi: "",
  ambang: 60,
  aktif: true,
  tingkatAi: "hemat",
  bahasa: "id",
  sapaanOtomatis: true,
  berhentiSetelahAdmin: true,
  simpanTranskrip: true,
};

export const Route = createFileRoute("/app/balas-chat")({
  head: () => ({
    meta: [
      { title: "Balas Chat Otomatis — Dashboard Balasin" },
      {
        name: "description",
        content: "Atur gaya bahasa, mesin AI, dan ambang alih ke manusia untuk balasan chat otomatis.",
      },
    ],
  }),
  component: AutoChatPage,
});

function AutoChatPage() {
  const [settings, setSettings] = useState<BotSettings>(defaultSettings);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Load settings dari API
  const { isLoading } = useQuery({
    queryKey: ["bot-settings"],
    queryFn: () => apiFetch<BotSettings>("/bot/settings"),
    retry: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSuccess: (data: any) => {
      if (data && !hasLoaded) {
        setSettings({ ...defaultSettings, ...data });
        setHasLoaded(true);
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (_err: any) => {
      if (!hasLoaded) setHasLoaded(true); // gunakan default jika API gagal
    },
  } as any);

  // Simpan ke API
  const saveMutation = useMutation({
    mutationFn: (data: BotSettings) =>
      apiFetch<BotSettings>("/bot/settings", { method: "PUT", body: data }),
    onSuccess: () => toast.success("Pengaturan berhasil disimpan"),
    onError: (err: Error) => toast.error(err.message || "Gagal menyimpan pengaturan"),
  });

  // Toggle aktif dan langsung simpan
  const handleToggleAktif = (v: boolean) => {
    const next = { ...settings, aktif: v };
    setSettings(next);
    saveMutation.mutate(next);
  };

  const set = <K extends keyof BotSettings>(key: K, val: BotSettings[K]) =>
    setSettings((prev) => ({ ...prev, [key]: val }));

  return (
    <>
      <PageHeader
        title="Balas Chat Otomatis"
        description="Bot menjawab chat pelanggan berdasarkan FAQ dan dokumen yang Anda unggah."
        action={
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
            <span className="text-sm text-muted-foreground">{settings.aktif ? "Menyala" : "Mati"}</span>
            <Switch
              checked={settings.aktif}
              onCheckedChange={handleToggleAktif}
              disabled={saveMutation.isPending || isLoading}
              aria-label="Toggle balas chat otomatis"
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* FORM UTAMA */}
        <form
          className="panel space-y-5 p-6 rounded-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate(settings);
          }}
        >
          {/* Nama Bot */}
          <div className="grid gap-1.5">
            <Label htmlFor="nama-bot" className="text-sm font-medium">Nama bot</Label>
            <Input
              id="nama-bot"
              placeholder="Contoh: Asisten CS"
              value={settings.namaBot}
              onChange={(e) => set("namaBot", e.target.value)}
            />
          </div>

          {/* Instruksi */}
          <div className="grid gap-1.5">
            <Label htmlFor="gaya" className="text-sm font-medium">Instruksi gaya bahasa</Label>
            <Textarea
              id="gaya"
              rows={5}
              placeholder="Contoh: Sapa pelanggan dengan sopan. Gunakan Bahasa Indonesia ramah, maksimal 3 kalimat. Jika info tidak ada di FAQ, tawarkan bantuan admin."
              value={settings.instruksi}
              onChange={(e) => set("instruksi", e.target.value)}
            />
          </div>

          {/* Tingkat AI & Bahasa */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Tingkat kepintaran bot</label>
              <Select value={settings.tingkatAi} onValueChange={(v) => set("tingkatAi", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tingkatAi.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.nama} — {m.catatan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Bahasa balasan</label>
              <Select value={settings.bahasa} onValueChange={(v) => set("bahasa", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                  <SelectItem value="auto">Ikuti bahasa pelanggan</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Slider ambang */}
          <div className="grid gap-2">
            <Label className="text-sm font-medium">
              Ambang alih ke admin — {settings.ambang}%
            </Label>
            <Slider
              value={[settings.ambang]}
              onValueChange={([v]) => set("ambang", v)}
              max={100}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Semakin tinggi angkanya, bot lebih cepat minta bantuan Anda saat ragu menjawab.
            </p>
          </div>

          {/* Toggle options */}
          <div className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
            {[
              { key: "sapaanOtomatis" as const, label: "Kirim sapaan pembuka otomatis" },
              { key: "berhentiSetelahAdmin" as const, label: "Berhenti membalas setelah admin masuk" },
              { key: "simpanTranskrip" as const, label: "Simpan transkrip percakapan" },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                <span>{label}</span>
                <Switch
                  checked={settings[key] as boolean}
                  onCheckedChange={(v) => set(key, v)}
                  disabled={saveMutation.isPending}
                />
              </label>
            ))}
          </div>

          <Button
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl"
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <><Loader2 className="size-4 animate-spin" /> Menyimpan...</>
            ) : (
              <><Save className="size-4" /> Simpan Pengaturan</>
            )}
          </Button>
        </form>

        {/* PANEL CARA KERJA */}
        <aside className="panel h-fit p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-emerald-500" />
            <h2 className="text-sm font-semibold">Cara kerja</h2>
          </div>
          <ol className="space-y-3 text-xs text-muted-foreground">
            {[
              { n: 1, judul: "Chat masuk", isi: "Pesan pelanggan diterima dari nomor WhatsApp tersambung." },
              { n: 2, judul: "Cari jawaban", isi: "Sistem mencari info paling cocok dari FAQ & dokumen Anda." },
              { n: 3, judul: "AI menyusun jawaban", isi: "Jawaban dibuat dari data Anda, mengikuti instruksi gaya bahasa." },
              { n: 4, judul: "Kirim atau alih ke admin", isi: "Kalau bot kurang yakin, chat dialihkan ke Anda, bukan dijawab asal." },
            ].map(({ n, judul, isi }) => (
              <li key={n} className="flex gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {n}
                </span>
                <div>
                  <span className="font-medium text-foreground block">{judul}</span>
                  <p className="mt-0.5 leading-relaxed">{isi}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="flex items-start gap-2 rounded-xl bg-secondary/40 p-3 text-xs text-muted-foreground border border-border/40">
            <Info className="size-3.5 shrink-0 text-emerald-500 mt-0.5" />
            <p>Pengaturan ini berlaku untuk semua nomor WhatsApp yang terhubung.</p>
          </div>
        </aside>
      </div>
    </>
  );
}
