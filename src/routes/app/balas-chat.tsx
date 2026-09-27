import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
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
// dan dipetakan ke model aslinya di sisi backend.
const tingkatAi = [
  { id: "hemat", nama: "Hemat", catatan: "Cepat & murah, cocok untuk chat sehari-hari" },
  { id: "seimbang", nama: "Seimbang", catatan: "Lebih pintar, biaya sedang" },
  {
    id: "akurat",
    nama: "Paling Akurat",
    catatan: "Paling teliti, untuk jawaban yang harus presisi",
  },
];

export const Route = createFileRoute("/app/balas-chat")({
  head: () => ({
    meta: [
      { title: "Balas Chat Otomatis — Dashboard Balasin" },
      {
        name: "description",
        content:
          "Atur gaya bahasa, mesin AI, dan ambang alih ke manusia untuk balasan chat otomatis.",
      },
      { property: "og:title", content: "Balas Chat Otomatis — Dashboard Balasin" },
      {
        property: "og:description",
        content: "Atur gaya bahasa dan mesin AI untuk balasan chat otomatis.",
      },
    ],
  }),
  component: AutoChatPage,
});

function AutoChatPage() {
  const [aktif, setAktif] = useState(true);
  const [namaBot, setNamaBot] = useState("");
  const [instruksi, setInstruksi] = useState("");
  const [ambang, setAmbang] = useState([60]);

  return (
    <>
      <PageHeader
        title="Balas Chat Otomatis"
        description="Bot menjawab chat biasa berdasarkan dokumen dan FAQ yang Anda unggah."
        action={
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
            <span className="text-sm">{aktif ? "Menyala" : "Mati"}</span>
            <Switch
              checked={aktif}
              onCheckedChange={(v) => {
                setAktif(v);
                toast.success(`Balas Chat Otomatis ${v ? "dinyalakan" : "dimatikan"}`);
              }}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <form
          className="panel space-y-6 p-6"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await apiFetch("/bot/settings", {
                method: "PUT",
                body: { namaBot, instruksi, ambang: ambang[0], aktif },
              });
              toast.success("Pengaturan berhasil disimpan");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
            }
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor="nama-bot">Nama bot</Label>
            <Input
              id="nama-bot"
              placeholder="Contoh: Asisten CS"
              value={namaBot}
              onChange={(e) => setNamaBot(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="gaya">Gaya bahasa & instruksi</Label>
            <Textarea
              id="gaya"
              rows={6}
              placeholder="Contoh: Sapa pelanggan dengan sopan. Gunakan Bahasa Indonesia ramah, maksimal 3 kalimat. Jika info tidak ada di FAQ, tawarkan bantuan admin."
              value={instruksi}
              onChange={(e) => setInstruksi(e.target.value)}
            />
          </div>

          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2">
            <div className="w-full min-w-0 space-y-2">
              <label className="block text-sm font-medium text-foreground">
                Tingkat kepintaran bot
              </label>
              <div className="w-full min-w-0">
                <Select defaultValue="hemat">
                  <SelectTrigger className="w-full min-w-0 truncate">
                    <SelectValue className="truncate" />
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
            </div>

            <div className="w-full min-w-0 space-y-2">
              <label className="block text-sm font-medium text-foreground">Bahasa balasan</label>
              <div className="w-full min-w-0">
                <Select defaultValue="id">
                  <SelectTrigger className="w-full min-w-0">
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
          </div>

          <div className="grid gap-3">
            <Label>Seberapa cepat bot minta bantuan Anda — {ambang[0]}%</Label>
            <Slider value={ambang} onValueChange={setAmbang} max={100} step={5} />
            <p className="text-xs text-muted-foreground">
              Kalau bot ragu-ragu menjawab, chat otomatis ditandai untuk Anda ambil alih. Makin
              tinggi angkanya, makin cepat bot menyerah dan minta bantuan.
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4">
            <label className="flex items-center justify-between gap-3 text-sm">
              Kirim sapaan pembuka otomatis
              <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              Berhenti membalas setelah admin masuk percakapan
              <Switch defaultChecked />
            </label>
            <label className="flex items-center justify-between gap-3 text-sm">
              Simpan transkrip percakapan
              <Switch defaultChecked />
            </label>
          </div>

          <Button type="submit">Simpan pengaturan</Button>
        </form>

        <aside className="panel h-fit p-6">
          <h2 className="text-sm font-semibold">Cara kerja</h2>
          <ol className="mt-4 space-y-4 text-sm text-muted-foreground">
            <li>
              <span className="font-medium text-foreground">1. Chat masuk</span>
              <p>Pesan pelanggan diterima dari nomor WhatsApp yang tersambung.</p>
            </li>
            <li>
              <span className="font-medium text-foreground">2. Cari jawaban di data Anda</span>
              <p>Sistem mencari info yang paling cocok dari FAQ/dokumen yang sudah diunggah.</p>
            </li>
            <li>
              <span className="font-medium text-foreground">3. AI menyusun jawaban</span>
              <p>Jawaban dibuat hanya dari info tadi, mengikuti gaya bahasa Anda.</p>
            </li>
            <li>
              <span className="font-medium text-foreground">4. Kirim atau minta bantuan</span>
              <p>Kalau bot kurang yakin, chat dialihkan ke Anda, bukan dijawab asal-asalan.</p>
            </li>
          </ol>
        </aside>
      </div>
    </>
  );
}
