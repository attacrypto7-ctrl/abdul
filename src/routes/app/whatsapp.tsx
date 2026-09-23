import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  QrCode,
  RefreshCw,
  Unplug,
  Trash2,
  CheckCircle2,
  Smartphone,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatusPill, toneForWa } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  fetchWaNumbers,
  fetchWaQr,
  fetchWaQrDirect,
  disconnectWa,
  deleteWaNumber,
  toggleWaAuto,
} from "@/lib/api-client";

export const Route = createFileRoute("/app/whatsapp")({
  head: () => ({
    meta: [
      { title: "Koneksi WhatsApp — Dashboard Balasin" },
      {
        name: "description",
        content: "Sambungkan 1 nomor WhatsApp bisnis lewat QR code dan pantau statusnya secara langsung.",
      },
      { property: "og:title", content: "Koneksi WhatsApp — Dashboard Balasin" },
      {
        property: "og:description",
        content: "Sambungkan 1 nomor WhatsApp bisnis lewat QR code dan pantau statusnya.",
      },
    ],
  }),
  component: WhatsappPage,
});

function WhatsappPage() {
  const queryClient = useQueryClient();
  const [qrOpen, setQrOpen] = useState(false);
  const [selectedNumberId, setSelectedNumberId] = useState<string | null>(null);

  // Ambil daftar nomor WhatsApp tenant
  const { data: numbers = [], isLoading } = useQuery({
    queryKey: ["wa-numbers"],
    queryFn: fetchWaNumbers,
  });

  const primaryNumber = numbers[0] ?? null;
  const isConnected = primaryNumber?.status === "tersambung";

  // Polling QR ketika dialog dibuka
  const {
    data: qrData,
    isLoading: isQrLoading,
    isError: isQrError,
    error: qrError,
    refetch: refetchQr,
  } = useQuery({
    queryKey: ["wa-qr", qrOpen, selectedNumberId],
    queryFn: async () => {
      const res = selectedNumberId
        ? await fetchWaQr(selectedNumberId)
        : await fetchWaQrDirect();
      if (res?.waNumberId) {
        queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
      }
      return res;
    },
    enabled: qrOpen,
    refetchInterval: qrOpen && !isConnected ? 2000 : false,
  });

  // Efek ketika QR berhasil tersambung
  useEffect(() => {
    if (qrOpen && qrData?.status === "tersambung") {
      toast.success("WhatsApp berhasil tersambung!");
      setQrOpen(false);
      queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
    }
  }, [qrData?.status, qrOpen, queryClient]);

  // Mutation untuk toggle switch
  const autoMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { autoChat?: boolean; autoIklan?: boolean } }) =>
      toggleWaAuto(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
      toast.success("Pengaturan otomatis berhasil diperbarui");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Gagal memperbarui pengaturan");
    },
  });

  // Mutation untuk putuskan koneksi
  const disconnectMutation = useMutation({
    mutationFn: (id: string) => disconnectWa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
      toast.warning("Koneksi WhatsApp diputuskan");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Gagal memutuskan koneksi");
    },
  });

  // Mutation untuk hapus nomor
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWaNumber(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
      toast.success("Nomor WhatsApp berhasil dihapus");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Gagal menghapus nomor");
    },
  });

  const handleOpenQr = (id?: string) => {
    setSelectedNumberId(id ?? null);
    setQrOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Koneksi WhatsApp"
        description="Satu akun terhubung ke 1 nomor WhatsApp CS. Pindai QR dari ponsel Anda untuk menghubungkan."
        action={
          primaryNumber ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground bg-secondary/80 px-3 py-1.5 rounded-lg border border-border">
                1 Akun : 1 Nomor CS
              </span>
            </div>
          ) : (
            <Button onClick={() => handleOpenQr()} className="cursor-pointer">
              <QrCode className="size-4 mr-1.5" /> Hubungkan WhatsApp
            </Button>
          )
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {isLoading ? (
          <div className="panel col-span-full flex flex-col items-center justify-center p-12 text-center">
            <Loader2 className="size-8 animate-spin text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Memuat data nomor WhatsApp...</p>
          </div>
        ) : primaryNumber ? (
          <article key={primaryNumber.id} className="panel p-5 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold">{primaryNumber.label}</h2>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    {primaryNumber.nomor && primaryNumber.nomor !== "Belum terhubung"
                      ? primaryNumber.nomor
                      : "Nomor belum terdeteksi (pindai QR)"}
                  </p>
                </div>
              </div>
              <StatusPill label={primaryNumber.status} tone={toneForWa(primaryNumber.status)} />
            </div>

            <p className="text-xs text-muted-foreground">
              Terakhir aktif:{" "}
              {primaryNumber.terakhirAktif
                ? new Date(primaryNumber.terakhirAktif).toLocaleString("id-ID")
                : "Belum pernah aktif"}
            </p>

            <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-4">
              <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                <span>Balas Chat Otomatis</span>
                <Switch
                  checked={primaryNumber.autoChat}
                  disabled={autoMutation.isPending}
                  onCheckedChange={(v) =>
                    autoMutation.mutate({
                      id: primaryNumber.id,
                      data: { autoChat: v },
                    })
                  }
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                <span>Balas Iklan Otomatis</span>
                <Switch
                  checked={primaryNumber.autoIklan}
                  disabled={autoMutation.isPending}
                  onCheckedChange={(v) =>
                    autoMutation.mutate({
                      id: primaryNumber.id,
                      data: { autoIklan: v },
                    })
                  }
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                className="cursor-pointer"
                onClick={() => handleOpenQr(primaryNumber.id)}
              >
                <QrCode className="size-3.5 mr-1" />
                {primaryNumber.status === "tersambung" ? "Pindai Ulang" : "Pindai QR"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => {
                  refetchQr();
                  queryClient.invalidateQueries({ queryKey: ["wa-numbers"] });
                  toast.info("Memperbarui status koneksi...");
                }}
              >
                <RefreshCw className="size-3.5 mr-1" /> Segarkan
              </Button>
              {primaryNumber.status === "tersambung" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-amber-500 hover:text-amber-600 cursor-pointer"
                  disabled={disconnectMutation.isPending}
                  onClick={() => disconnectMutation.mutate(primaryNumber.id)}
                >
                  <Unplug className="size-3.5 mr-1" /> Putuskan
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive cursor-pointer ml-auto"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (confirm("Apakah Anda yakin ingin menghapus nomor WhatsApp ini?")) {
                    deleteMutation.mutate(primaryNumber.id);
                  }
                }}
              >
                <Trash2 className="size-3.5 mr-1" /> Hapus Nomor
              </Button>
            </div>
          </article>
        ) : (
          <div className="panel col-span-full flex flex-col items-center justify-center p-12 text-center">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <QrCode className="size-7" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              Belum ada nomor WhatsApp tersambung
            </h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-md">
              Hubungkan 1 nomor WhatsApp bisnis Anda untuk mulai menjawab chat dan pesan iklan secara
              otomatis menggunakan AI.
            </p>
            <Button className="mt-5 cursor-pointer" size="lg" onClick={() => handleOpenQr()}>
              <QrCode className="size-4 mr-2" /> Hubungkan Sekarang
            </Button>
          </div>
        )}
      </div>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pindai QR WhatsApp</DialogTitle>
            <DialogDescription>
              Buka WhatsApp di ponsel Anda &gt; Pengaturan &gt; Perangkat Tertaut &gt; Tautkan
              Perangkat, lalu pindai kode QR di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            {qrData?.qr ? (
              <div className="relative group animate-in fade-in zoom-in-95 duration-300">
                <div className="p-3 bg-white rounded-2xl shadow-xl border border-border">
                  <img
                    src={qrData.qr}
                    alt="WhatsApp QR Code"
                    className="size-56 object-contain rounded-lg"
                  />
                </div>
              </div>
            ) : qrData?.status === "tersambung" ? (
              <div className="flex flex-col items-center justify-center size-56 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <CheckCircle2 className="size-12 mb-2" />
                <p className="text-sm font-medium">WhatsApp Tersambung!</p>
              </div>
            ) : qrData?.status === "gateway_offline" ? (
              <div className="flex flex-col items-center justify-center size-56 rounded-2xl bg-secondary/40 border border-border text-center p-4">
                <ShieldAlert className="size-8 text-amber-500 mb-2" />
                <p className="text-xs font-semibold text-foreground">
                  Gateway WhatsApp Belum Berjalan
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Pastikan service <code>npm run dev</code> atau <code>npm run dev:wa</code> aktif di terminal folder back.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 cursor-pointer"
                  onClick={() => refetchQr()}
                >
                  <RefreshCw className="size-3 mr-1" /> Coba Lagi
                </Button>
              </div>
            ) : isQrError ? (
              <div className="flex flex-col items-center justify-center size-56 rounded-2xl bg-destructive/10 border border-destructive/20 text-center p-4">
                <ShieldAlert className="size-8 text-destructive mb-2" />
                <p className="text-xs font-semibold text-destructive">
                  Gagal Memuat QR Code
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {(qrError as any)?.message || "Terjadi kesalahan saat memuat kode QR."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 cursor-pointer"
                  onClick={() => refetchQr()}
                >
                  <RefreshCw className="size-3 mr-1" /> Coba Lagi
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center size-56 rounded-2xl bg-secondary/40 border border-border text-center p-4">
                <Loader2 className="size-8 animate-spin text-primary mb-2" />
                <p className="text-xs font-medium text-foreground">
                  Menyiapkan Kode QR WhatsApp...
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Menghubungkan ke server WhatsApp, harap tunggu sebentar.
                </p>
              </div>
            )}

            <div className="text-center space-y-1">
              <p className="text-xs text-muted-foreground">
                Status: <span className="font-medium text-foreground">{qrData?.status === "memindai" ? "Menunggu pemindaian ponsel" : qrData?.status ?? "menghubungkan..."}</span>
              </p>
              <p className="text-[11px] text-muted-foreground/80">
                Kode QR akan menyegar otomatis setiap beberapa detik hingga terhubung.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
