import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Film,
  GripVertical,
  ImagePlus,
  Loader2,
  Megaphone,
  MessageSquarePlus,
  Play,
  Plus,
  Sparkles,
  Trash2,
  UploadCloud,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatusPill } from "@/components/dashboard/status-pill";
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
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  createAdTemplateApi,
  deleteAdTemplateApi,
  formatNumber,
  getAdTemplates,
  updateAdTemplateApi,
  uploadAdMediaApi,
} from "@/mock/api";

export const Route = createFileRoute("/app/balas-iklan")({
  head: () => ({
    meta: [
      { title: "Balas Iklan Otomatis — Dashboard Balasin" },
      {
        name: "description",
        content:
          "Atur pertanyaan dari iklan WhatsApp dan rangkaian balasan otomatis (teks, gambar, dan video).",
      },
      { property: "og:title", content: "Balas Iklan Otomatis — Dashboard Balasin" },
      {
        property: "og:description",
        content: "Rangkaian balasan teks, gambar, dan video otomatis untuk pesan iklan WhatsApp.",
      },
    ],
  }),
  component: AutoAdsPage,
});

export type StepItem = {
  id: string;
  tipe: "teks" | "gambar" | "video";
  isiTeks?: string;
  urlGambar?: string;
  namaGambar?: string;
  urlVideo?: string;
  namaVideo?: string;
  mediaUrl?: string;
  namaMedia?: string;
  isUploading?: boolean;
};

function buatId() {
  return Math.random().toString(36).slice(2, 10);
}

function ambilLangkah(t: any): StepItem[] {
  if (Array.isArray(t.langkah) && t.langkah.length > 0) {
    return t.langkah.map((l: any, idx: number) => ({
      id: l.id || `step-${idx}`,
      tipe: l.tipe || "teks",
      isiTeks: l.isiTeks || "",
      urlGambar: l.urlGambar || l.mediaUrl,
      namaGambar: l.namaGambar || l.namaMedia,
      urlVideo: l.urlVideo || (l.tipe === "video" ? l.urlGambar || l.mediaUrl : undefined),
      namaVideo: l.namaVideo || (l.tipe === "video" ? l.namaGambar || l.namaMedia : undefined),
      mediaUrl: l.mediaUrl || l.urlGambar || l.urlVideo,
      namaMedia: l.namaMedia || l.namaGambar || l.namaVideo,
    }));
  }
  if (t.jawaban) {
    return [{ id: "0", tipe: "teks", isiTeks: t.jawaban }];
  }
  return [];
}

function ambilCaraMencocokkan(t: any): "sama_persis" | "boleh_mirip" {
  if (t.caraMencocokkan) return t.caraMencocokkan;
  return t.mode === "exact" ? "sama_persis" : "boleh_mirip";
}

function AutoAdsPage() {
  const queryClient = useQueryClient();
  const { data: templatesMentah = [], isLoading } = useQuery({
    queryKey: ["ads"],
    queryFn: getAdTemplates,
  });

  const [globalAktif, setGlobalAktif] = useState(true);

  const templates = templatesMentah.map((t: any) => ({
    ...t,
    langkah: ambilLangkah(t),
    caraMencocokkan: ambilCaraMencocokkan(t),
  }));

  // --- state form input ---
  const [pertanyaan, setPertanyaan] = useState("");
  const [caraMencocokkan, setCaraMencocokkan] = useState<"sama_persis" | "boleh_mirip">(
    "boleh_mirip",
  );
  const [langkahBaru, setLangkahBaru] = useState<StepItem[]>([
    { id: buatId(), tipe: "teks", isiTeks: "" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function tambahLangkahTeks() {
    setLangkahBaru((prev) => [...prev, { id: buatId(), tipe: "teks", isiTeks: "" }]);
  }

  function tambahLangkahGambar() {
    setLangkahBaru((prev) => [...prev, { id: buatId(), tipe: "gambar" }]);
  }

  function tambahLangkahVideo() {
    setLangkahBaru((prev) => [...prev, { id: buatId(), tipe: "video" }]);
  }

  function hapusLangkah(id: string) {
    setLangkahBaru((prev) => prev.filter((l) => l.id !== id));
  }

  function ubahTeksLangkah(id: string, isiTeks: string) {
    setLangkahBaru((prev) => prev.map((l) => (l.id === id ? { ...l, isiTeks } : l)));
  }

  async function handleUploadFile(
    id: string,
    file: File | undefined,
    targetTipe: "gambar" | "video",
  ) {
    if (!file) return;
    setLangkahBaru((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              isUploading: true,
              namaGambar: targetTipe === "gambar" ? file.name : l.namaGambar,
              namaVideo: targetTipe === "video" ? file.name : l.namaVideo,
              namaMedia: file.name,
            }
          : l,
      ),
    );

    try {
      const uploadRes = await uploadAdMediaApi(file);
      setLangkahBaru((prev) =>
        prev.map((l) =>
          l.id === id
            ? {
                ...l,
                isUploading: false,
                tipe: targetTipe,
                urlGambar: uploadRes.url,
                namaGambar: uploadRes.filename,
                urlVideo: targetTipe === "video" ? uploadRes.url : undefined,
                namaVideo: targetTipe === "video" ? uploadRes.filename : undefined,
                mediaUrl: uploadRes.url,
                namaMedia: uploadRes.filename,
              }
            : l,
        ),
      );
      toast.success(`${targetTipe === "video" ? "Video" : "Gambar"} berhasil diunggah!`);
    } catch (err: any) {
      toast.error(err?.message || `Gagal mengunggah ${targetTipe}.`);
      setLangkahBaru((prev) => prev.map((l) => (l.id === id ? { ...l, isUploading: false } : l)));
    }
  }

  function resetForm() {
    setPertanyaan("");
    setCaraMencocokkan("boleh_mirip");
    setLangkahBaru([{ id: buatId(), tipe: "teks", isiTeks: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPertanyaan = pertanyaan.trim();
    if (!cleanPertanyaan) {
      toast.error("Tuliskan pertanyaan pemicu dari iklan terlebih dahulu.");
      return;
    }

    const stepsPayload = langkahBaru
      .filter((l) => {
        if (l.tipe === "teks") return Boolean(l.isiTeks?.trim());
        if (l.tipe === "gambar") return Boolean(l.urlGambar || l.mediaUrl);
        if (l.tipe === "video") return Boolean(l.urlVideo || l.urlGambar || l.mediaUrl);
        return false;
      })
      .map((l, idx) => ({
        urutan: idx + 1,
        tipe: l.tipe,
        isiTeks: l.isiTeks?.trim() || undefined,
        urlGambar: l.urlGambar || l.urlVideo || l.mediaUrl,
        namaGambar: l.namaGambar || l.namaVideo || l.namaMedia,
        urlVideo: l.tipe === "video" ? l.urlVideo || l.urlGambar || l.mediaUrl : undefined,
        namaVideo: l.tipe === "video" ? l.namaVideo || l.namaGambar || l.namaMedia : undefined,
      }));

    if (stepsPayload.length === 0) {
      toast.error("Tambahkan minimal 1 balasan (teks, gambar, atau video) yang terisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdTemplateApi({
        pertanyaan: cleanPertanyaan,
        caraMencocokkan,
        aktif: true,
        langkah: stepsPayload,
      });
      toast.success("Template balasan iklan berhasil disimpan!");
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan template balasan iklan.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteTemplate(id: string, pertanyaanText: string) {
    if (!confirm(`Hapus template untuk "${pertanyaanText}"?`)) return;
    try {
      await deleteAdTemplateApi(id);
      toast.success("Template balasan dihapus.");
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus template.");
    }
  }

  async function handleToggleAktif(id: string, currentAktif: boolean) {
    try {
      await updateAdTemplateApi(id, { aktif: !currentAktif });
      toast.success(`Template ${!currentAktif ? "diaktifkan" : "dinonaktifkan"}.`);
      queryClient.invalidateQueries({ queryKey: ["ads"] });
    } catch (err: any) {
      toast.error(err?.message || "Gagal mengubah status template.");
    }
  }

  return (
    <>
      <PageHeader
        title="Balas Iklan Otomatis (CTWA)"
        description="Otomatisasi balasan untuk pesan dari iklan WhatsApp (Click-to-WhatsApp Ads). Kirimkan rangkaian pesan teks, gambar produk, dan video demo secara terstruktur."
        action={
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
            <span className="text-sm font-medium">
              {globalAktif ? "Otomasi Aktif" : "Otomasi Nonaktif"}
            </span>
            <Switch
              checked={globalAktif}
              onCheckedChange={(v) => {
                setGlobalAktif(v);
                toast.success(`Balas Iklan Otomatis ${v ? "dinyalakan" : "dimatikan"}`);
              }}
            />
          </div>
        }
      />

      <div className="grid gap-6 xl:gap-8 lg:grid-cols-1 xl:grid-cols-[1fr_380px] items-start">
        {/* Kolom Kiri: Tabel Template */}
        <section className="panel overflow-hidden flex flex-col min-w-0 rounded-2xl">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-6 py-5 bg-secondary/10">
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-foreground">
                Daftar Pertanyaan &amp; Rangkaian Balasan
              </h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                Bot akan membalas pesan iklan yang sesuai dengan urutan balasan yang Anda tentukan
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-secondary border border-border px-3 py-1 text-xs font-bold text-foreground">
              {templates.length} template
            </span>
          </div>
          <div className="overflow-x-auto">
            <Table className="balas-iklan-table">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="table-head-200">Pemicu / Pertanyaan</TableHead>
                  <TableHead>Rangkaian Balasan (Teks / Media)</TableHead>
                  <TableHead className="table-head-120">Kecocokan</TableHead>
                  <TableHead className="table-head-80">Dipakai</TableHead>
                  <TableHead className="table-head-90 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((t: any) => (
                  <TableRow
                    key={t.id}
                    className={
                      !t.aktif
                        ? "opacity-60 bg-secondary/10 hover:bg-transparent"
                        : "hover:bg-transparent"
                    }
                  >
                    <TableCell className="align-top font-medium">
                      <p className="text-sm leading-snug">{t.pertanyaan}</p>
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleAktif(t.id, t.aktif)}
                          className="cursor-pointer"
                        >
                          <StatusPill
                            label={t.aktif ? "aktif" : "nonaktif"}
                            tone={t.aktif ? "success" : "muted"}
                          />
                        </button>
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <ol className="space-y-2.5">
                        {t.langkah.map((l: StepItem, i: number) => (
                          <li
                            key={l.id || i}
                            className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/20 p-3 text-xs"
                          >
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary border border-border text-[11px] font-bold text-foreground">
                              {i + 1}
                            </span>
                            <div className="flex-1 min-w-0 pt-0.5">
                              {l.tipe === "teks" && (
                                <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                  {l.isiTeks}
                                </p>
                              )}
                              {l.tipe === "gambar" && (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                                    <ImagePlus className="size-3.5 shrink-0" />
                                    <span className="truncate">
                                      Gambar: {l.namaGambar || "Foto Produk / Brosur"}
                                    </span>
                                  </div>
                                  {(l.urlGambar || l.mediaUrl) && (
                                    <div className="relative mt-1 inline-block overflow-hidden rounded-lg border border-border max-w-[140px] max-h-[90px]">
                                      <img
                                        src={l.urlGambar || l.mediaUrl}
                                        alt={l.namaGambar || "preview"}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                              {l.tipe === "video" && (
                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 font-semibold text-sky-600 dark:text-sky-400">
                                    <Film className="size-3.5 shrink-0" />
                                    <span className="truncate">
                                      Video:{" "}
                                      {l.namaVideo || l.namaGambar || "Video Demo / Tutorial"}
                                    </span>
                                  </div>
                                  {(l.urlVideo || l.urlGambar || l.mediaUrl) && (
                                    <div className="relative mt-1.5 inline-block overflow-hidden rounded-lg border border-border max-w-[160px]">
                                      <video
                                        src={l.urlVideo || l.urlGambar || l.mediaUrl}
                                        className="max-h-[90px] w-full rounded"
                                        controls
                                      />
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </TableCell>
                    <TableCell className="align-top">
                      <StatusPill
                        label={t.caraMencocokkan === "sama_persis" ? "Sama persis" : "Boleh mirip"}
                        tone={t.caraMencocokkan === "sama_persis" ? "info" : "warning"}
                      />
                    </TableCell>
                    <TableCell className="align-top font-semibold text-muted-foreground">
                      {formatNumber(t.dipakai ?? 0)}x
                    </TableCell>
                    <TableCell className="text-right align-top">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteTemplate(t.id, t.pertanyaan)}
                        title="Hapus template"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {templates.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-14 text-center text-sm text-muted-foreground"
                    >
                      <Megaphone className="size-10 mx-auto mb-3 opacity-30 text-muted-foreground" />
                      <p className="font-bold text-foreground">Belum Ada Template Balasan Iklan</p>
                      <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                        Tambahkan pertanyaan trigger dari iklan dan buat rangkaian balasan teks,
                        gambar, atau video lewat formulir di samping.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Kolom Kanan: Form Tambah Template */}
        <div className="space-y-6 xl:sticky xl:top-6 self-start min-w-0">
          <form className="panel space-y-6 p-6 rounded-2xl" onSubmit={handleSubmit}>
            <div className="flex items-center gap-2.5 pb-4 border-b border-border">
              <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-sm font-bold text-foreground">Tambah Template Balas Iklan</h2>
                <p className="text-xs text-muted-foreground">Buat rangkaian respon untuk iklan</p>
              </div>
            </div>

            <div className="grid gap-2.5">
              <Label htmlFor="t-tanya" className="text-xs font-semibold">
                Pesan / Pertanyaan dari Iklan (Trigger)
              </Label>
              <Input
                id="t-tanya"
                placeholder="Contoh: Halo, saya tertarik dengan promo baju muslim..."
                value={pertanyaan}
                onChange={(e) => setPertanyaan(e.target.value)}
                required
              />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Pesan awal yang dikirimkan calon pelanggan saat mengklik iklan WhatsApp Anda.
              </p>
            </div>

            <div className="grid gap-2.5">
              <Label className="text-xs font-semibold">Metode Pencocokan</Label>
              <Select
                value={caraMencocokkan}
                onValueChange={(v: "sama_persis" | "boleh_mirip") => setCaraMencocokkan(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="boleh_mirip">
                    Boleh mirip (Mendeteksi kata kunci utama iklan)
                  </SelectItem>
                  <SelectItem value="sama_persis">
                    Harus sama persis (Karakter per karakter)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 pt-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="text-xs font-semibold">
                  Rangkaian Balasan (Dikirim Berurutan)
                </Label>
                <span className="shrink-0 rounded-full bg-secondary border border-border px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                  {langkahBaru.length} pesan
                </span>
              </div>

              {langkahBaru.map((l, i) => (
                <div
                  key={l.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 p-4"
                >
                  <GripVertical className="mt-2 size-4 shrink-0 text-muted-foreground/50" />
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold text-foreground">
                        Langkah #{i + 1} &bull;{" "}
                        <span className="capitalize text-emerald-600 dark:text-emerald-400">
                          {l.tipe === "teks"
                            ? "Pesan Teks"
                            : l.tipe === "gambar"
                              ? "Foto / Brosur"
                              : "Video"}
                        </span>
                      </span>
                      {l.isUploading && (
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                          <Loader2 className="size-3.5 animate-spin" /> Mengunggah...
                        </span>
                      )}
                    </div>

                    {l.tipe === "teks" && (
                      <Textarea
                        rows={2}
                        placeholder="Ketik isi pesan balasan untuk langkah ini..."
                        value={l.isiTeks}
                        onChange={(e) => ubahTeksLangkah(l.id, e.target.value)}
                        className="text-xs leading-relaxed min-h-[64px]"
                      />
                    )}

                    {l.tipe === "gambar" && (
                      <div className="space-y-3">
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3.5 text-xs text-muted-foreground hover:border-emerald-500 hover:text-foreground transition-colors">
                          <UploadCloud className="size-4 shrink-0 text-emerald-500" />
                          <span className="truncate text-center">
                            {l.namaGambar ? l.namaGambar : "Pilih file gambar (JPG, PNG, WEBP)"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleUploadFile(l.id, e.target.files?.[0], "gambar")}
                          />
                        </label>
                        {l.urlGambar && (
                          <div className="relative overflow-hidden rounded-xl border border-border max-w-[140px] max-h-[90px]">
                            <img
                              src={l.urlGambar}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {l.tipe === "video" && (
                      <div className="space-y-3">
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background px-4 py-3.5 text-xs text-muted-foreground hover:border-sky-500 hover:text-foreground transition-colors">
                          <Video className="size-4 shrink-0 text-sky-500" />
                          <span className="truncate text-center">
                            {l.namaVideo ? l.namaVideo : "Pilih file video (MP4, 3GP, MOV)"}
                          </span>
                          <input
                            type="file"
                            accept="video/*,.mp4,.3gp,.mov,.webm"
                            className="hidden"
                            onChange={(e) => handleUploadFile(l.id, e.target.files?.[0], "video")}
                          />
                        </label>
                        {l.urlVideo && (
                          <div className="relative overflow-hidden rounded-xl border border-border max-w-[160px]">
                            <video
                              src={l.urlVideo}
                              className="max-h-[90px] w-full rounded-lg"
                              controls
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:bg-destructive/10 rounded-xl"
                    onClick={() => hapusLangkah(l.id)}
                    disabled={langkahBaru.length === 1}
                    title="Hapus langkah ini"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={tambahLangkahTeks}
                  className="text-xs rounded-xl"
                >
                  <MessageSquarePlus className="size-3.5" /> + Teks
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={tambahLangkahGambar}
                  className="text-xs rounded-xl"
                >
                  <ImagePlus className="size-3.5 text-emerald-500" /> + Gambar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={tambahLangkahVideo}
                  className="text-xs rounded-xl"
                >
                  <Video className="size-3.5 text-sky-500" /> + Video
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-500/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <>
                  <Plus className="size-4 mr-2" /> Simpan Template Balasan Iklan
                </>
              )}
            </Button>
          </form>

          <section className="panel p-5 rounded-2xl border border-border/60 bg-card">
            <h3 className="text-sm font-bold flex items-center gap-2.5 text-foreground">
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                <Play className="size-3.5" />
              </span>
              Cara Kerja Balas Iklan
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed mt-3">
              Saat ada pesan masuk dari prospek yang mengklik iklan WhatsApp dengan teks trigger di
              atas, sistem akan otomatis mengirimkan balasan langkah demi langkah secara berurutan
              (misalnya: perkenalan &rarr; gambar katalog &rarr; video demo produk).
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
