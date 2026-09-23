import {
  adTemplates,
  auditLog,
  chatHarian,
  chatLogs,
  faqItems,
  knowledgeDocs,
  licenses,
  pemakaianToken,
  pertanyaanTeratas,
  tenants,
  waNumbers,
} from "./data";
import { apiFetch, getToken, AnyRecord } from "@/lib/api-client";

const delay = <T>(value: T, ms = 120): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

function isLoggedIn(): boolean {
  try {
    return getToken() !== null;
  } catch {
    return false;
  }
}

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    return await apiFetch<T>(path);
  } catch {
    return fallback;
  }
}

export const getTenants = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/admin/tenants", tenants);
  return delay(tenants);
};

export const getTenant = (id: string) => {
  if (isLoggedIn())
    return safeFetch<AnyRecord>(`/admin/tenants/${id}`, tenants.find((t) => t.id === id) ?? null);
  return delay(tenants.find((t) => t.id === id) ?? null);
};

export const updateTenantApi = async (id: string, data: { status?: string; plan?: string; email?: string }) => {
  if (isLoggedIn()) {
    return apiFetch<AnyRecord>(`/admin/tenants/${id}`, {
      method: "PUT",
      body: data,
    });
  }
  const t = tenants.find((item) => item.id === id);
  if (t) Object.assign(t, data);
  return delay(t ?? null);
};

export const getLicenses = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/admin/licenses", licenses);
  return delay(licenses);
};

export const getMyLicenses = async () => {
  if (isLoggedIn()) {
    const res = await safeFetch<AnyRecord[] | null>("/license/me", null);
    if (res && Array.isArray(res) && res.length > 0) return res;
  }
  return delay(licenses);
};

export const getLicenseStatus = async () => {
  if (isLoggedIn()) {
    const res = await safeFetch<AnyRecord | null>("/license/status", null);
    if (res && res.status) return res;
  }
  const activeLic = licenses.find((l) => l.status === "aktif");
  if (activeLic) {
    return delay({
      plan: activeLic.plan,
      status: "aktif",
      totalChatDibalas: 0,
      chatBulanIni: 0,
      lisensiBerakhir: activeLic.berakhir,
      isActive: true,
      kode: activeLic.kode,
    });
  }
  return delay({
    plan: "Starter",
    status: "belum_aktif",
    totalChatDibalas: 0,
    chatBulanIni: 0,
    lisensiBerakhir: null,
    isActive: false,
    kode: null,
  });
};

export const activateLicenseApi = async (kode: string) => {
  const clean = (kode || "").trim().toUpperCase();
  if (isLoggedIn()) {
    try {
      const res = await apiFetch<{ success: boolean }>("/license/activate", {
        method: "POST",
        body: { kode: clean },
      });
      const lic = licenses.find((l) => (l.kode || "").toUpperCase() === clean);
      if (lic) {
        lic.status = "aktif" as any;
      }
      return res;
    } catch (err: any) {
      const lic = licenses.find((l) => (l.kode || "").toUpperCase() === clean);
      if (lic) {
        lic.status = "aktif" as any;
        return delay({ success: true });
      }
      throw err;
    }
  }
  const lic = licenses.find((l) => (l.kode || "").toUpperCase() === clean);
  if (lic) {
    lic.status = "aktif" as any;
    return delay({ success: true });
  }
  throw new Error("Kode lisensi tidak ditemukan");
};

export const createAdminLicenseApi = async (data: {
  tenantId?: string;
  plan: string;
  berakhir: string;
  kuotaChat?: number;
}) => {
  if (isLoggedIn()) {
    try {
      const res = await apiFetch<AnyRecord>("/admin/licenses", {
        method: "POST",
        body: data,
      });
      if (res) {
        licenses.unshift(res as any);
        return res;
      }
    } catch {
      // fallback
    }
  }
  const newLic = {
    id: `lic-${Date.now()}`,
    kode: `BARU-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear() + 1}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
    tenantId: data.tenantId || null,
    tenantNama: data.tenantId ? (tenants.find((t) => t.id === data.tenantId)?.nama ?? "Tenant") : "Belum Diklaim",
    plan: data.plan,
    status: "nonaktif",
    dibuat: new Date().toISOString().split("T")[0],
    berakhir: data.berakhir,
    kuotaChat: 999999,
  };
  licenses.unshift(newLic as any);
  return delay(newLic);
};

export const revokeAdminLicenseApi = async (id: string) => {
  if (isLoggedIn()) {
    return apiFetch<AnyRecord>(`/admin/licenses/${id}/revoke`, {
      method: "POST",
    });
  }
  const lic = licenses.find((l) => l.id === id);
  if (lic) lic.status = "revoked" as any;
  return delay({ success: true });
};

export const deleteAdminLicenseApi = async (id: string) => {
  if (isLoggedIn()) {
    return apiFetch<{ ok: boolean }>(`/admin/licenses/${id}`, {
      method: "DELETE",
    });
  }
  const idx = licenses.findIndex((l) => l.id === id);
  if (idx >= 0) licenses.splice(idx, 1);
  return delay({ ok: true });
};

export const getLicensesByTenant = (tenantId: string) => {
  if (isLoggedIn())
    return safeFetch<AnyRecord[]>(
      `/admin/licenses?tenantId=${tenantId}`,
      licenses.filter((l) => l.tenantId === tenantId),
    );
  return delay(licenses.filter((l) => l.tenantId === tenantId));
};

export const getWaNumbers = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/whatsapp/numbers", waNumbers);
  return delay(waNumbers);
};

export const getKnowledgeDocs = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/knowledge/docs", knowledgeDocs);
  return delay(knowledgeDocs);
};

export const getFaqItems = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/knowledge/faq", faqItems);
  return delay(faqItems);
};

export const getAdTemplates = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/ad-templates", adTemplates);
  return delay(adTemplates);
};

export const createAdTemplateApi = async (data: {
  pertanyaan: string;
  caraMencocokkan?: "sama_persis" | "boleh_mirip";
  aktif?: boolean;
  langkah: Array<{
    urutan: number;
    tipe: "teks" | "gambar" | "video";
    isiTeks?: string;
    urlGambar?: string;
    namaGambar?: string;
    urlVideo?: string;
    namaVideo?: string;
  }>;
}) => {
  if (isLoggedIn()) {
    return apiFetch<AnyRecord>("/ad-templates", {
      method: "POST",
      body: data,
    });
  }
  const newT = {
    id: `ad-${Date.now()}`,
    pertanyaan: data.pertanyaan,
    caraMencocokkan: data.caraMencocokkan || "boleh_mirip",
    mode: data.caraMencocokkan === "sama_persis" ? ("exact" as const) : ("fuzzy" as const),
    aktif: data.aktif ?? true,
    dipakai: 0,
    langkah: data.langkah.map((l, i) => ({
      id: `step-${Date.now()}-${i}`,
      urutan: l.urutan || i + 1,
      tipe: l.tipe,
      isiTeks: l.isiTeks,
      urlGambar: l.urlGambar || l.urlVideo,
      namaGambar: l.namaGambar || l.namaVideo,
    })),
  };
  adTemplates.unshift(newT as any);
  return delay(newT);
};

export const updateAdTemplateApi = async (
  id: string,
  data: {
    pertanyaan?: string;
    caraMencocokkan?: "sama_persis" | "boleh_mirip";
    aktif?: boolean;
    langkah?: Array<{
      urutan: number;
      tipe: "teks" | "gambar" | "video";
      isiTeks?: string;
      urlGambar?: string;
      namaGambar?: string;
      urlVideo?: string;
      namaVideo?: string;
    }>;
  },
) => {
  if (isLoggedIn()) {
    return apiFetch<AnyRecord>(`/ad-templates/${id}`, {
      method: "PUT",
      body: data,
    });
  }
  const t = adTemplates.find((item) => item.id === id);
  if (t) {
    if (data.pertanyaan !== undefined) t.pertanyaan = data.pertanyaan;
    if (data.caraMencocokkan !== undefined) {
      t.caraMencocokkan = data.caraMencocokkan;
      t.mode = data.caraMencocokkan === "sama_persis" ? "exact" : "fuzzy";
    }
    if (data.aktif !== undefined) t.aktif = data.aktif;
    if (data.langkah) {
      t.langkah = data.langkah.map((l, i) => ({
        id: `step-${Date.now()}-${i}`,
        urutan: l.urutan || i + 1,
        tipe: l.tipe,
        isiTeks: l.isiTeks,
        urlGambar: l.urlGambar || l.urlVideo,
        namaGambar: l.namaGambar || l.namaVideo,
      }));
    }
  }
  return delay(t ?? null);
};

export const deleteAdTemplateApi = async (id: string) => {
  if (isLoggedIn()) {
    return apiFetch<{ success: boolean; id: string }>(`/ad-templates/${id}`, {
      method: "DELETE",
    });
  }
  const idx = adTemplates.findIndex((t) => t.id === id);
  if (idx >= 0) adTemplates.splice(idx, 1);
  return delay({ success: true, id });
};

export const uploadAdMediaApi = async (file: File) => {
  if (isLoggedIn()) {
    const formData = new FormData();
    formData.append("file", file);
    return apiFetch<{
      url: string;
      filename: string;
      storedName: string;
      size: number;
      mimetype: string;
      tipe: "gambar" | "video";
    }>("/ad-templates/upload", {
      method: "POST",
      body: formData,
    });
  }
  const isVideo = file.type.startsWith("video/") || Boolean(file.name.match(/\.(mp4|3gp|mov|webm)$/i));
  const mockUrl = URL.createObjectURL(file);
  return delay({
    url: mockUrl,
    filename: file.name,
    storedName: file.name,
    size: file.size,
    mimetype: file.type,
    tipe: isVideo ? ("video" as const) : ("gambar" as const),
  });
};

export const getChatLogs = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/chat/logs?limit=100", chatLogs);
  return delay(chatLogs);
};

export const getAuditLog = () => {
  if (isLoggedIn()) return safeFetch<AnyRecord[]>("/admin/audit?limit=100", auditLog);
  return delay(auditLog);
};

export const getAnalytics = () => {
  if (isLoggedIn())
    return safeFetch<AnyRecord>("/analytics/overview", {
      chatHarian,
      pemakaianToken,
      pertanyaanTeratas,
    });
  return delay({ chatHarian, pemakaianToken, pertanyaanTeratas });
};

export const trialBot = async (message: string, mode: "chat" | "iklan" = "chat") => {
  if (isLoggedIn()) {
    try {
      return await apiFetch<{ jawaban: string; sumber: string; keyakinan: number }>("/bot/trial", {
        method: "POST",
        body: { message, mode },
      });
    } catch (err: any) {
      return {
        jawaban: err?.message || "Gagal memproses uji coba bot.",
        sumber: "Error",
        keyakinan: 0,
      };
    }
  }
  return null;
};

export const formatNumber = (n: number) => new Intl.NumberFormat("id-ID").format(n);
export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
export const daysLeft = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));