import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Copy,
  KeyRound,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPill, toneForLicense } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createAdminLicenseApi,
  daysLeft,
  deleteAdminLicenseApi,
  formatDate,
  formatNumber,
  getLicenses,
  getTenants,
  revokeAdminLicenseApi,
} from "@/mock/api";

export const Route = createFileRoute("/admin/licenses")({
  head: () => ({
    meta: [
      { title: "Lisensi — Balasin Admin" },
      {
        name: "description",
        content: "Buat, tinjau, dan cabut kode lisensi tenant beserta masa berlakunya.",
      },
      { property: "og:title", content: "Lisensi — Balasin Admin" },
      { property: "og:description", content: "Buat dan kelola kode lisensi tenant." },
    ],
  }),
  component: LicensesPage,
});

function LicensesPage() {
  const queryClient = useQueryClient();
  const { data: licenses = [], isLoading } = useQuery({
    queryKey: ["licenses"],
    queryFn: getLicenses,
  });

  const [open, setOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("Growth");
  const [berakhirDate, setBerakhirDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLicense, setCreatedLicense] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const aktif = licenses.filter((l: any) => l.status === "aktif");
  const nonaktif = licenses.filter((l: any) => l.status === "nonaktif");
  const segera = aktif.filter((l: any) => daysLeft(l.berakhir) <= 30 && daysLeft(l.berakhir) >= 0);

  const filteredLicenses = licenses.filter((l: any) => {
    const matchSearch =
      (l.kode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.tenantNama || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.plan || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "all" || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSetPreset = (months: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    setBerakhirDate(d.toISOString().split("T")[0]);
  };

  const handleCreateLicense = async () => {
    if (!berakhirDate) {
      toast.error("Tentukan tanggal masa berlaku lisensi.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdminLicenseApi({
        plan: selectedPlan,
        berakhir: berakhirDate,
      });
      setCreatedLicense(res);
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      toast.success("Kode lisensi berhasil di-generate!", {
        description: `Kode: ${res?.kode} siap dibagikan ke pengguna siapa saja.`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Gagal membuat lisensi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (id: string, kode: string) => {
    if (!confirm(`Cabut lisensi ${kode}? Tenant tidak akan bisa menggunakan bot setelah ini.`))
      return;
    try {
      await revokeAdminLicenseApi(id);
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Lisensi berhasil dicabut.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal mencabut lisensi.");
    }
  };

  const handleDelete = async (id: string, kode: string) => {
    if (!confirm(`Hapus permanen lisensi ${kode}?`)) return;
    try {
      await deleteAdminLicenseApi(id);
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Lisensi dihapus.");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus lisensi.");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success("Kode lisensi disalin!");
  };

  return (
    <>
      <PageHeader
        title="Kelola Lisensi"
        description="Buat, tinjau, dan cabut kode lisensi untuk mengaktifkan bot WhatsApp AI."
        action={
          <Dialog
            open={open}
            onOpenChange={(v) => {
              setOpen(v);
              if (!v) {
                setCreatedLicense(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="size-4" /> Generate Kode Lisensi
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Generate Kode Lisensi Baru</DialogTitle>
                <DialogDescription>
                  Kode lisensi bebas diklaim oleh pengguna mana saja yang memasukkan kodenya.
                </DialogDescription>
              </DialogHeader>

              {createdLicense ? (
                <div className="space-y-4 py-2">
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
                    <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Kode Lisensi Berhasil Dibuat!
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Bagikan kode lisensi ini kepada pengguna/klien untuk diaktifkan di menu
                      Lisensi mereka:
                    </p>
                    <div className="flex items-center justify-center gap-2 pt-2">
                      <code className="rounded bg-background px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-foreground border border-border">
                        {createdLicense.kode}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyCode(createdLicense.kode)}
                      >
                        <Copy className="size-3.5" /> Salin
                      </Button>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      onClick={() => {
                        setOpen(false);
                        setCreatedLicense(null);
                      }}
                      className="w-full"
                    >
                      Selesai
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="grid gap-4 py-2">
                  <div className="grid gap-2">
                    <Label>Pilihan Paket</Label>
                    <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Starter">Starter (Basic AI & 1 WA)</SelectItem>
                        <SelectItem value="Growth">Growth (Full AI & Iklan)</SelectItem>
                        <SelectItem value="Scale">
                          Scale (High Priority & Priority Support)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="berakhir">Masa Berlaku Sampai</Label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetPreset(1)}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          +1 Bln
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPreset(3)}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          +3 Bln
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPreset(6)}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          +6 Bln
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPreset(12)}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                          +1 Thn
                        </button>
                      </div>
                    </div>
                    <Input
                      id="berakhir"
                      type="date"
                      value={berakhirDate}
                      onChange={(e) => setBerakhirDate(e.target.value)}
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Setelah tanggal ini, lisensi akan kedaluwarsa secara otomatis.
                    </p>
                  </div>

                  <DialogFooter className="pt-2">
                    <Button variant="ghost" onClick={() => setOpen(false)} disabled={isSubmitting}>
                      Batal
                    </Button>
                    <Button onClick={handleCreateLicense} disabled={isSubmitting}>
                      {isSubmitting ? "Men-generate..." : "Generate Kode Lisensi"}
                    </Button>
                  </DialogFooter>
                </div>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Lisensi"
          value={String(licenses.length)}
          icon={KeyRound}
          hint="Semua kode yang dibuat"
        />
        <StatCard
          label="Lisensi Aktif"
          value={String(aktif.length)}
          icon={ShieldCheck}
          tone="success"
          hint="Sedang digunakan tenant"
        />
        <StatCard
          label="Segera Habis"
          value={String(segera.length)}
          icon={TriangleAlert}
          tone="warning"
          hint="< 30 hari masa aktif"
        />
        <StatCard
          label="Belum Diaktivasi"
          value={String(nonaktif.length)}
          icon={CalendarClock}
          hint="Tersedia untuk diklaim"
        />
      </div>

      <div className="panel mt-8 space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari kode atau nama tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Belum Aktif</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="revoked">Dicabut</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Lisensi</TableHead>
                <TableHead>Pemilik / Tenant</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Berlaku Sampai</TableHead>
                <TableHead>Sisa Waktu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLicenses.map((l: any) => {
                const sisa = daysLeft(l.berakhir);
                return (
                  <TableRow key={l.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs font-semibold text-foreground bg-secondary px-2 py-0.5 rounded">
                          {l.kode}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="size-7 p-0"
                          onClick={() => copyCode(l.kode)}
                          title="Salin Kode"
                        >
                          <Copy className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {l.tenantNama ? (
                        <span>{l.tenantNama}</span>
                      ) : (
                        <span className="text-xs italic text-muted-foreground">
                          Belum diklaim (Umum)
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-secondary/80 px-2.5 py-0.5 text-xs font-medium">
                        {l.plan}
                      </span>
                    </TableCell>
                    <TableCell>{formatDate(l.berakhir)}</TableCell>
                    <TableCell>
                      <span
                        className={
                          sisa < 0
                            ? "text-destructive font-semibold"
                            : sisa <= 30
                              ? "text-amber-500 font-semibold"
                              : "text-muted-foreground"
                        }
                      >
                        {sisa < 0 ? `Lewat ${Math.abs(sisa)} hari` : `${sisa} hari lagi`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusPill
                        label={l.status === "nonaktif" ? "Belum Aktif" : l.status}
                        tone={toneForLicense(l.status)}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      {l.status !== "revoked" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleRevoke(l.id, l.kode)}
                          title="Cabut Lisensi"
                        >
                          <Ban className="size-3.5 mr-1" /> Cabut
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(l.id, l.kode)}
                        title="Hapus Lisensi"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredLicenses.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    {searchQuery || statusFilter !== "all"
                      ? "Tidak ada lisensi yang cocok dengan pencarian."
                      : 'Belum ada lisensi yang dibuat. Klik "Generate Kode Lisensi" untuk membuat kode baru.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
