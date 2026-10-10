import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Briefcase,
  HeartHandshake,
  Stethoscope,
  GraduationCap,
  Building2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateBusinessTypeApi } from "@/mock/api";

export const BUSINESS_TYPES = [
  {
    id: "Toko / E-Commerce",
    label: "Toko / E-Commerce / Retail",
    icon: ShoppingBag,
    deskripsi: "Penjualan produk fisik, fashion, kuliner, skincare, gadget, atau retail.",
    tagline: "Ramah, cepat tanggap, otomatis kirim katalog produk & info COD",
    badge: "Populer",
  },
  {
    id: "Agency / Jasa",
    label: "Agency / Jasa Kreatif / Konsultan",
    icon: Briefcase,
    deskripsi: "Penyedia jasa digital, desain, software house, konsultan bisnis, hukum.",
    tagline: "Profesional, menjelaskan paket layanan, portofolio & alur konsultasi",
  },
  {
    id: "Yayasan / Non-Profit",
    label: "Yayasan / Non-Profit / Komunitas",
    icon: HeartHandshake,
    deskripsi: "Penggalangan donasi, yayasan sosial, lembaga amal, komunitas kerelawanan.",
    tagline: "Santun & hangat, memandu cara berdonasi & penyaluran program kebaikan",
  },
  {
    id: "Klinik / Kesehatan",
    label: "Klinik / Kesehatan / Salon / Spa",
    icon: Stethoscope,
    deskripsi: "Klinik dokter, dokter gigi, estetika kecantikan, salon, spa, atau terapi.",
    tagline: "Empatik & teratur, melayani info perawatan & reservasi janji temu",
  },
  {
    id: "Sekolah / Edukasi",
    label: "Sekolah / Lembaga Kursus / Edukasi",
    icon: GraduationCap,
    deskripsi: "Bimbingan belajar, kursus bahasa/skill, sekolah, akademi pelatihan.",
    tagline: "Edukatif, memberikan rincian program belajar, biaya, & pendaftaran",
  },
  {
    id: "Bisnis Umum",
    label: "Lainnya / Bisnis Umum",
    icon: Building2,
    deskripsi: "Perusahaan dagang, properti, bengkel, sewa/rental, dan bidang usaha lainnya.",
    tagline: "Fleksibel menjawab pertanyaan pelanggan sesuai template yang Anda tentukan",
  },
];

interface BusinessTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentType?: string;
  isMandatory?: boolean;
}

export function BusinessTypeModal({
  open,
  onOpenChange,
  currentType,
  isMandatory = false,
}: BusinessTypeModalProps) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string>(
    currentType && currentType !== "Belum Memilih" ? currentType : "Toko / E-Commerce",
  );

  const mutation = useMutation({
    mutationFn: (type: string) => updateBusinessTypeApi(type),
    onSuccess: (_, vars) => {
      toast.success(`Tipe bisnis berhasil disimpan: ${vars}`);
      queryClient.invalidateQueries({ queryKey: ["tenant-me"] });
      queryClient.invalidateQueries({ queryKey: ["readiness-score"] });
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Gagal menyimpan tipe bisnis. Silakan coba lagi.");
    },
  });

  const handleSave = () => {
    if (!selected) {
      toast.error("Silakan pilih salah satu tipe bisnis");
      return;
    }
    mutation.mutate(selected);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        // Jika wajib onboarding, jangan izinkan tutup sebelum memilih
        if (isMandatory && !nextOpen) return;
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 w-fit">
            <Sparkles className="size-3.5" />
            <span>Klasifikasi Tipe Bisnis Anda</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-bold">
            Pilih Bidang Bisnis Anda
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            AI Balasin akan menyesuaikan gaya bahasa percakapan, istilah tanya jawab, dan template
            rekomendasi sesuai bidang usaha yang Anda pilih.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          {BUSINESS_TYPES.map((item) => {
            const isSelected = selected === item.id || selected === item.label;
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all duration-200 ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500 shadow-xs"
                    : "border-border bg-card/60 hover:border-border/80 hover:bg-accent/40"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`flex size-9 items-center justify-center rounded-lg transition-colors ${
                        isSelected
                          ? "bg-emerald-500 text-white shadow-xs"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4.5" />
                    </span>
                    {item.badge && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.badge}
                      </span>
                    )}
                    {isSelected && !item.badge && (
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    )}
                  </div>
                  <h4 className="text-sm font-semibold text-foreground leading-tight">
                    {item.label}
                  </h4>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {item.deskripsi}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-border/40 text-[11px] font-medium text-emerald-600 dark:text-emerald-400/90 leading-tight">
                  ✨ {item.tagline}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            * Anda dapat mengubah pilihan ini kapan saja melalui menu pengaturan.
          </p>
          <div className="flex items-center gap-2 ml-auto">
            {!isMandatory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Batal
              </Button>
            )}
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium px-5"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  Simpan &amp; Lanjutkan
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
