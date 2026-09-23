import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Copy,
  History,
  KeyRound,
  MessagesSquare,
  Plus,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  TriangleAlert,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusPill, toneForLicense, toneForTenant } from "@/components/dashboard/status-pill";
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
  formatDate,
  formatNumber,
  getAuditLog,
  getLicenses,
  getTenants,
} from "@/mock/api";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Ringkasan Platform — Balasin Admin" },
      { name: "description", content: "Pantau tenant, lisensi, dan volume chat seluruh platform." },
      { property: "og:title", content: "Ringkasan Platform — Balasin Admin" },
      { property: "og:description", content: "Pantau tenant, lisensi, dan volume chat platform." },
    ],
  }),
  component: AdminOverview,
});

function AdminOverview() {
  const queryClient = useQueryClient();
  const { data: tenants = [] } = useQuery({ queryKey: ["tenants"], queryFn: getTenants });
  const { data: licenses = [] } = useQuery({ queryKey: ["licenses"], queryFn: getLicenses });
  const { data: auditLogs = [] } = useQuery({ queryKey: ["audit"], queryFn: getAuditLog });

  const [openModal, setOpenModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("Growth");
  const [berakhirDate, setBerakhirDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split("T")[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdLicense, setCreatedLicense] = useState<any>(null);

  const aktifLicenses = licenses.filter((l: any) => l.status === "aktif");
  const segeraLicenses = aktifLicenses.filter((l: any) => daysLeft(l.berakhir) <= 30 && daysLeft(l.berakhir) >= 0);
  const totalChat = tenants.reduce((a: number, t: any) => a + (t.chatBulanIni || 0), 0);
  const activeTenants = tenants.filter((t: any) => t.status === "aktif");
  const suspendedTenants = tenants.filter((t: any) => t.status === "suspend");

  const starterCount = tenants.filter((t: any) => t.plan === "Starter").length;
  const growthCount = tenants.filter((t: any) => t.plan === "Growth").length;
  const scaleCount = tenants.filter((t: any) => t.plan === "Scale").length;

  const handleCreateLicense = async () => {
    if (!berakhirDate) {
      toast.error("Tentukan tanggal masa berlaku lisensi.");
      return;
    }
    setIsSubmitting(true);
    try {
      const cleanTenant = selectedTenant && selectedTenant !== "unassigned" ? selectedTenant : undefined;
      const res = await createAdminLicenseApi({
        tenantId: cleanTenant,
        plan: selectedPlan,
        berakhir: berakhirDate,
      });
      setCreatedLicense(res);
      queryClient.invalidateQueries({ queryKey: ["licenses"] });
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      toast.success("Kode lisensi berhasil dibuat!", {
        description: `Kode: ${res?.kode} siap dibagikan ke pengguna.`,
      });
    } catch (err: any) {
      toast.error(err?.message || "Gagal membuat lisensi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    toast.success("Kode lisensi disalin!");
  };

  return (
    <>
      <PageHeader
        title="Ringkasan Platform Admin"
        description="Pantau performa seluruh tenant, status lisensi bisnis, dan aktivitas sistem terkini."
        action={
          <div className="flex items-center gap-2">
            <Dialog
              open={openModal}
              onOpenChange={(v) => {
                setOpenModal(v);
                if (!v) {
                  setCreatedLicense(null);
                  setSelectedTenant("");
                }
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="size-4" /> Generate Lisensi Cepat
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate Kode Lisensi</DialogTitle>
                  <DialogDescription>
                    Buat kode lisensi baru yang dapat langsung diklaim oleh tenant mana saja.
                  </DialogDescription>
                </DialogHeader>

                {createdLicense ? (
                  <div className="space-y-4 py-2">
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
                      <CheckCircle2 className="size-8 text-emerald-500 mx-auto" />
                      <h3 className="text-sm font-semibold text-foreground">Kode Lisensi Siap:</h3>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <code className="rounded bg-background px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-foreground border border-border">
                          {createdLicense.kode}
                        </code>
                        <Button size="sm" variant="outline" onClick={() => copyCode(createdLicense.kode)}>
                          <Copy className="size-3.5" /> Salin
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => { setOpenModal(false); setCreatedLicense(null); setSelectedTenant(""); }} className="w-full">
                        Tutup
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="grid gap-4 py-2">
                    <div className="grid gap-2">
                      <Label>Paket</Label>
                      <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Starter">Starter (Basic AI & 1 WA)</SelectItem>
                          <SelectItem value="Growth">Growth (Full AI & Iklan)</SelectItem>
                          <SelectItem value="Scale">Scale (High Priority & Support)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="berakhir-date">Masa Berlaku Sampai</Label>
                      <Input
                        id="berakhir-date"
                        type="date"
                        value={berakhirDate}
                        onChange={(e) => setBerakhirDate(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="flex items-center justify-between">
                        <span>Alokasikan ke Tenant (Opsional)</span>
                        <span className="text-[11px] text-muted-foreground font-normal">Bisa dikosongkan</span>
                      </Label>
                      <Select
                        value={selectedTenant}
                        onValueChange={setSelectedTenant}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bebas / Tanpa Tenant (Kode Umum)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">-- Bebas / Kode Umum (Bisa Diklaim Siapa Saja) --</SelectItem>
                          {tenants.map((t: any) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.nama} ({t.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter className="pt-2">
                      <Button variant="ghost" onClick={() => setOpenModal(false)}>
                        Batal
                      </Button>
                      <Button onClick={handleCreateLicense} disabled={isSubmitting}>
                        {isSubmitting ? "Membuat..." : "Generate Kode"}
                      </Button>
                    </DialogFooter>
                  </div>
                )}
              </DialogContent>
            </Dialog>
            <Button asChild variant="outline">
              <Link to="/admin/licenses">
                <KeyRound className="size-4" /> Kelola Lisensi
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Tenant"
          value={String(tenants.length)}
          icon={Building2}
          tone="default"
          hint={`${activeTenants.length} aktif • ${suspendedTenants.length} ditangguhkan`}
        />
        <StatCard
          label="Lisensi Aktif"
          value={String(aktifLicenses.length)}
          icon={ShieldCheck}
          tone="success"
          hint={`Dari total ${licenses.length} lisensi terdaftar`}
        />
        <StatCard
          label="Segera Kedaluwarsa"
          value={String(segeraLicenses.length)}
          icon={TriangleAlert}
          tone={segeraLicenses.length > 0 ? "warning" : "default"}
          hint="Masa aktif < 30 hari lagi"
        />
        <StatCard
          label="Total Chat Dibalas"
          value={formatNumber(totalChat)}
          icon={MessagesSquare}
          hint="Akumulasi seluruh tenant"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Distribusi Paket & Kesehatan Platform */}
        <div className="panel p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Distribusi Paket Tenant
            </h2>
            <Link to="/admin/tenants" className="text-xs text-primary hover:underline">
              Kelola →
            </Link>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Starter Plan</span>
                <span className="text-muted-foreground">{starterCount} tenant</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${tenants.length ? (starterCount / tenants.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Growth Plan</span>
                <span className="text-muted-foreground">{growthCount} tenant</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-emerald-500 transition-all"
                  style={{ width: `${tenants.length ? (growthCount / tenants.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span>Scale Plan</span>
                <span className="text-muted-foreground">{scaleCount} tenant</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-purple-500 transition-all"
                  style={{ width: `${tenants.length ? (scaleCount / tenants.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border space-y-2 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Status Server AI:</span>
              <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Operational
              </span>
            </div>
            <div className="flex justify-between">
              <span>WhatsApp Gateway:</span>
              <span className="font-medium text-foreground">Multi-Device Ready</span>
            </div>
          </div>
        </div>

        {/* Lisensi Prioritas / Expiring */}
        <div className="panel p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="size-4 text-primary" /> Lisensi Perlu Perhatian
              </h2>
              <p className="text-xs text-muted-foreground">Lisensi yang mendekati atau sudah melewati tanggal kedaluwarsa.</p>
            </div>
            <Link to="/admin/licenses" className="text-xs text-primary hover:underline">
              Semua Lisensi ({licenses.length}) →
            </Link>
          </div>

          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Kode Lisensi</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Berlaku Sampai</TableHead>
                  <TableHead>Sisa Waktu</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {licenses
                  .slice()
                  .sort((a: any, b: any) => daysLeft(a.berakhir) - daysLeft(b.berakhir))
                  .slice(0, 5)
                  .map((l: any) => {
                    const sisa = daysLeft(l.berakhir);
                    return (
                      <TableRow key={l.id}>
                        <TableCell className="font-medium">
                          {l.tenantNama || <span className="text-xs italic text-muted-foreground">Umum</span>}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <code className="font-mono text-xs text-muted-foreground">
                              {l.kode}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-6 p-0"
                              onClick={() => copyCode(l.kode)}
                              title="Salin Kode"
                            >
                              <Copy className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>{l.plan}</TableCell>
                        <TableCell>{formatDate(l.berakhir)}</TableCell>
                        <TableCell
                          className={
                            sisa < 0
                              ? "text-destructive font-medium"
                              : sisa <= 30
                              ? "text-amber-500 font-medium"
                              : "text-muted-foreground"
                          }
                        >
                          {sisa < 0 ? `Lewat ${Math.abs(sisa)} hari` : `${sisa} hari`}
                        </TableCell>
                        <TableCell>
                          <StatusPill label={l.status === "nonaktif" ? "Belum Aktif" : l.status} tone={toneForLicense(l.status)} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {licenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-6 text-center text-xs text-muted-foreground">
                      Belum ada data lisensi.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Tenant Terkini & Log Audit */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Users className="size-4 text-primary" /> Tenant Terbaru
            </h2>
            <Link to="/admin/tenants" className="text-xs text-primary hover:underline">
              Kelola Tenant ({tenants.length}) →
            </Link>
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bisnis</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Paket</TableHead>
                  <TableHead>Total Chat</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.slice(0, 5).map((t: any) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <Link to="/admin/tenants/$tenantId" params={{ tenantId: t.id }} className="hover:underline text-foreground">
                        {t.nama}
                      </Link>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{t.email}</TableCell>
                    <TableCell>
                      <span className="rounded bg-secondary px-2 py-0.5 text-xs">{t.plan}</span>
                    </TableCell>
                    <TableCell>{formatNumber(t.chatBulanIni || 0)}</TableCell>
                    <TableCell>
                      <StatusPill label={t.status} tone={toneForTenant(t.status)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        <section className="panel p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <History className="size-4 text-primary" /> Aktivitas Sistem Terkini
            </h2>
            <Link to="/admin/audit" className="text-xs text-primary hover:underline">
              Audit Log Lengkap →
            </Link>
          </div>
          <ul className="space-y-3">
            {auditLogs.slice(0, 5).map((a: any) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border bg-secondary/30 p-3 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-medium text-foreground">{a.aksi}</p>
                  <p className="font-mono text-[11px] text-muted-foreground truncate max-w-xs">{a.target}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] uppercase font-semibold text-muted-foreground">
                    {a.aktor}
                  </span>
                  <p className="text-[10px] text-muted-foreground mt-1">{formatDate(a.waktu)}</p>
                </div>
              </li>
            ))}
            {auditLogs.length === 0 && (
              <li className="py-6 text-center text-xs text-muted-foreground">Belum ada log aktivitas.</li>
            )}
          </ul>
        </section>
      </div>
    </>
  );
}