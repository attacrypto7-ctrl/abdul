import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Bot, Info, CheckCircle2, Save, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-client";

import { PageHeader } from "@/components/dashboard/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface BotSettings {
  namaBot: string;
  instruksi: string;
  aktif: boolean;
  tone: string;
  panggilan: string;
}

const defaultSettings: BotSettings = {
  namaBot: "",
  instruksi: "",
  aktif: true,
  tone: "ramah",
  panggilan: "kak",
};

export const Route = createFileRoute("/app/balas-chat")({
  head: () => ({
    meta: [
      { title: "Balas Chat Otomatis — Dashboard Balasin" },
      {
        name: "description",
        content: "Atur gaya bahasa dan komunikasi AI untuk balasan chat otomatis.",
      },
    ],
  }),
  component: AutoChatPage,
});

function AutoChatPage() {
  const [settings, setSettings] = useState<BotSettings>(defaultSettings);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const { data: botSettings, isLoading } = useQuery({
    queryKey: ["bot-settings"],
    queryFn: () => apiFetch<BotSettings>("/bot/settings"),
    retry: false,
  });

  useEffect(() => {
    if (botSettings && !hasLoaded) {
      setSettings({ ...defaultSettings, ...(botSettings as BotSettings) });
      setHasLoaded(true);
    }
  }, [botSettings, hasLoaded]);

  useEffect(() => {
    if (!isLoading && !botSettings && !hasLoaded) {
      setHasLoaded(true);
    }
  }, [isLoading, botSettings, hasLoaded]);

  const saveMutation = useMutation({
    mutationFn: (data: BotSettings) =>
      apiFetch<BotSettings>("/bot/settings", { method: "PUT", body: data }),
    onSuccess: () => {
      toast.success("Pengaturan berhasil disimpan");
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    },
    onError: (err: Error) => toast.error(err.message || "Gagal menyimpan pengaturan"),
  });

  const handleToggleAktif = (v: boolean) => {
    const next = { ...settings, aktif: v };
    setSettings(next);
    saveMutation.mutate(next);
  };

  const setTone = (tone: string) => setSettings((prev) => ({ ...prev, tone }));
  const setPanggilan = (panggilan: string) => setSettings((prev) => ({ ...prev, panggilan }));

  const handleSavePreferences = () => {
    saveMutation.mutate(settings);
  };

  return (
    <>
      <PageHeader
        title="Balas Chat Otomatis"
        description="Bot menjawab chat pelanggan berdasarkan FAQ dan dokumen yang Anda unggah."
        action={
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2">
            <span className="text-sm text-muted-foreground">
              {settings.aktif ? "Menyala" : "Mati"}
            </span>
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
        <form
          className="panel space-y-6 p-6 rounded-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            handleSavePreferences();
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="nama-bot" className="text-sm font-medium">
              Nama bot
            </Label>
            <Input
              id="nama-bot"
              placeholder="Contoh: Asisten CS"
              value={settings.namaBot}
              onChange={(e) => setSettings((prev) => ({ ...prev, namaBot: e.target.value }))}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="gaya" className="text-sm font-medium">
              Instruksi gaya bahasa
            </Label>
            <Textarea
              id="gaya"
              rows={5}
              placeholder="Contoh: Sapa pelanggan dengan sopan. Gunakan Bahasa Indonesia ramah, maksimal 3 kalimat. Jika info tidak ada di FAQ, tawarkan bantuan admin."
              value={settings.instruksi}
              onChange={(e) => setSettings((prev) => ({ ...prev, instruksi: e.target.value }))}
            />
          </div>

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

            <div className="mt-5 space-y-6">
              <div>
                <Label className="text-xs font-semibold text-foreground block mb-2">
                  Nada Bicara Bot
                </Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      id: "ramah",
                      label: "Ramah & Hangat",
                      hint: "Sopan, bersahabat, banyak senyum emoji 😊",
                    },
                    {
                      id: "formal",
                      label: "Formal & Profesional",
                      hint: "Baku, rapi, cocok untuk instansi/B2B",
                    },
                    {
                      id: "santai",
                      label: "Santai & Komunikatif",
                      hint: "Gaul, santai, cocok untuk target Gen-Z",
                    },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setTone(item.id)}
                      className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        settings.tone === item.id
                          ? "border-emerald-500 bg-emerald-500/10 text-foreground ring-1 ring-emerald-500/30"
                          : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <span className="font-semibold block text-foreground mb-1">{item.label}</span>
                      <span className="text-[11px] text-muted-foreground leading-snug block">
                        {item.hint}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Label className="text-xs font-semibold text-foreground block mb-2">
                  Panggilan untuk Lawan Bicara (Pelanggan / Donatur)
                </Label>
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
                      onClick={() => setPanggilan(p.id)}
                      className={`p-2.5 rounded-xl border text-xs text-center transition-all cursor-pointer ${
                        settings.panggilan === p.id
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

              <div className="pt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm px-6 h-10 font-bold shadow-md shadow-emerald-500/20"
                >
                  {saveMutation.isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="size-4 mr-2" />
                      {isSaved ? "Berhasil Tersimpan!" : "Simpan Pengaturan"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>
        </form>

        <aside className="panel h-fit p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Bot className="size-4 text-emerald-500" />
            <h2 className="text-sm font-semibold">Cara kerja</h2>
          </div>
          <ol className="space-y-3 text-xs text-muted-foreground">
            {[
              {
                n: 1,
                judul: "Chat masuk",
                isi: "Pesan pelanggan diterima dari nomor WhatsApp tersambung.",
              },
              {
                n: 2,
                judul: "Cari jawaban",
                isi: "Sistem mencari info paling cocok dari FAQ & dokumen Anda.",
              },
              {
                n: 3,
                judul: "AI menyusun jawaban",
                isi: "Jawaban dibuat dari data Anda, mengikuti instruksi gaya bahasa.",
              },
              {
                n: 4,
                judul: "Kirim atau alih ke admin",
                isi: "Kalau bot kurang yakin, chat dialihkan ke Anda, bukan dijawab asal.",
              },
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
