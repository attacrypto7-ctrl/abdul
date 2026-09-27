/**
 * URL service backend `api` (tanpa trailing slash).
 * Local:      VITE_API_URL=http://localhost:3000/api
 * Railway:    VITE_API_URL=https://<service-api>.up.railway.app/api
 */
export const API_BASE =
  (import.meta.env["VITE_API_URL"] as string | undefined) || "http://localhost:3000/api";

const TOKEN_KEY = "balasin_token";
const ROLE_KEY = "balasin_role";
const TENANT_KEY = "balasin_tenant";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function getRole(): "admin" | "tenant" | null {
  try {
    return (localStorage.getItem(ROLE_KEY) as "admin" | "tenant" | null) ?? null;
  } catch {
    return null;
  }
}
export function getStoredTenantId(): string | null {
  try {
    return localStorage.getItem(TENANT_KEY);
  } catch {
    return null;
  }
}
export function saveSession(token: string, role: "admin" | "tenant", tenantId?: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  if (tenantId) localStorage.setItem(TENANT_KEY, tenantId);
  else localStorage.removeItem(TENANT_KEY);
}
export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(TENANT_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface FetchOpts {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

/** Fetch JSON ke backend. Otomatis pasang Bearer token + tendang ke /masuk saat 401. */
export async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers: Record<string, string> = {};
  let payload: BodyInit | undefined;
  if (opts.body instanceof FormData) {
    payload = opts.body;
  } else if (typeof opts.body === "string") {
    headers["Content-Type"] = "application/json";
    payload = opts.body;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(opts.body);
  }
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  const reqInit: RequestInit = { method: opts.method ?? "GET", headers };
  if (payload !== undefined) reqInit.body = payload;
  const res = await fetch(`${API_BASE}${path}`, reqInit);
  if (res.status === 401 && opts.auth !== false) {
    clearSession();
    throw new ApiError(401, "Sesi berakhir atau otorisasi tidak valid");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = `Request gagal (${res.status})`;
    try {
      const json = JSON.parse(text);
      if (typeof json?.message === "string") message = json.message;
      else if (Array.isArray(json?.message)) message = json.message.join(", ");
    } catch {
      if (text) message = text.slice(0, 200);
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

// Auth
export interface LoginResult {
  accessToken: string;
  tenantId?: string;
}
export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await apiFetch<LoginResult>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });
  const role = res.tenantId ? "tenant" : "admin";
  saveSession(res.accessToken, role, res.tenantId);
  return res;
}
export async function register(data: {
  nama: string;
  industri: string;
  email: string;
  plan: string;
}): Promise<LoginResult> {
  const res = await apiFetch<LoginResult>("/auth/register", {
    method: "POST",
    auth: false,
    body: data,
  });
  saveSession(res.accessToken, "tenant", res.tenantId);
  return res;
}
export function logout() {
  clearSession();
  window.location.assign("/masuk");
}

// AnyRecord
/* eslint-disable @typescript-eslint/no-explicit-any */
export type AnyRecord = any;

// Admin
export const fetchTenants = () => apiFetch<AnyRecord[]>("/admin/tenants");
export const fetchTenant = (id: string) => apiFetch<AnyRecord>(`/admin/tenants/${id}`);
export const fetchLicenses = (tenantId?: string) =>
  apiFetch<AnyRecord[]>(`/admin/licenses${tenantId ? `?tenantId=${tenantId}` : ""}`);
export const createLicense = (data: {
  tenantId: string;
  plan: string;
  kuotaChat: number;
  berakhir: string;
}) => apiFetch<AnyRecord>("/admin/licenses", { method: "POST", body: data });
export const revokeLicense = (id: string) =>
  apiFetch<AnyRecord>(`/admin/licenses/${id}/revoke`, { method: "POST" });
export const fetchAuditLog = () => apiFetch<AnyRecord[]>("/admin/audit?limit=100");

// Tenant: lisensi
export const fetchMyLicenses = () => apiFetch<AnyRecord[]>("/license/me");
export const fetchLicenseStatus = () => apiFetch<AnyRecord>("/license/status");
export const activateLicense = (kode: string) =>
  apiFetch<{ success: boolean }>("/license/activate", { method: "POST", body: { kode } });

// Tenant: WhatsApp
export const fetchWaNumbers = () => apiFetch<AnyRecord[]>("/whatsapp/numbers");
export const fetchWaPrimary = () => apiFetch<AnyRecord>("/whatsapp/primary");
export const fetchWaQrDirect = () =>
  apiFetch<{ qr: string | null; status: string; waNumberId: string }>("/whatsapp/qr");
export const createWaNumber = (data: { label?: string; nomor?: string }) =>
  apiFetch<AnyRecord>("/whatsapp/numbers", { method: "POST", body: data });
export const fetchWaQr = (id: string) =>
  apiFetch<{ qr: string | null; status: string; waNumberId: string }>(`/whatsapp/numbers/${id}/qr`);
export const disconnectWa = (id: string) =>
  apiFetch<AnyRecord>(`/whatsapp/numbers/${id}/disconnect`, { method: "POST" });
export const deleteWaNumber = (id: string) =>
  apiFetch<{ success: boolean; id: string }>(`/whatsapp/numbers/${id}`, { method: "DELETE" });
export const toggleWaAuto = (id: string, data: { autoChat?: boolean; autoIklan?: boolean }) =>
  apiFetch<AnyRecord>(`/whatsapp/numbers/${id}/auto`, { method: "PATCH", body: data });

// Tenant: pengetahuan
export const fetchKnowledgeDocs = () => apiFetch<AnyRecord[]>("/knowledge/docs");
export const uploadKnowledgeDoc = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return apiFetch<AnyRecord>("/knowledge/docs", { method: "POST", body: form });
};
export const deleteKnowledgeDoc = (id: string) =>
  apiFetch<{ success: boolean }>(`/knowledge/docs/${id}`, { method: "DELETE" });
export const fetchFaqItems = () => apiFetch<AnyRecord[]>("/knowledge/faq");
export const createFaqItem = (data: { pertanyaan: string; jawaban: string }) =>
  apiFetch<AnyRecord>("/knowledge/faq", { method: "POST", body: data });
export const deleteFaqItem = (id: string) =>
  apiFetch<{ success: boolean }>(`/knowledge/faq/${id}`, { method: "DELETE" });

// Tenant: bot
export const fetchBotSettings = () => apiFetch<AnyRecord>("/bot/settings");
export const updateBotSettings = (data: AnyRecord) =>
  apiFetch<AnyRecord>("/bot/settings", { method: "PUT", body: data });
export const trialBot = (mode: "chat" | "iklan", message: string) =>
  apiFetch<{ jawaban: string; sumber: string; keyakinan: number }>("/bot/trial", {
    method: "POST",
    body: { mode, message },
  });

// Tenant: iklan
export const fetchAdTemplates = () => apiFetch<AnyRecord[]>("/ad-templates");
export const createAdTemplate = (data: {
  pertanyaan: string;
  caraMencocokkan: "sama_persis" | "boleh_mirip";
  langkah: Array<{ urutan: number; tipe: string; isiTeks?: string; namaGambar?: string }>;
  aktif?: boolean;
}) => apiFetch<AnyRecord>("/ad-templates", { method: "POST", body: data });
export const deleteAdTemplate = (id: string) =>
  apiFetch<{ success: boolean }>(`/ad-templates/${id}`, { method: "DELETE" });

// Tenant: chat
export const fetchChatLogs = () => apiFetch<AnyRecord[]>("/chat/logs?limit=100");
export const fetchChatStats = () =>
  apiFetch<{ total: number; perluManusia: number }>("/chat/stats");
export const takeoverChat = (id: string) =>
  apiFetch<AnyRecord>(`/chat/logs/${id}/takeover`, { method: "POST" });

// Tenant: analitik
export const fetchAnalytics = () => apiFetch<AnyRecord>("/analytics");
export const fetchOverview = () => apiFetch<AnyRecord>("/analytics/overview");

// Tenant: profil & kesiapan AI
export const fetchTenantMe = () => apiFetch<AnyRecord>("/tenant/me");
export const updateTenantBusinessType = (businessType: string) =>
  apiFetch<AnyRecord>("/tenant/business-type", { method: "PATCH", body: { businessType } });
export const fetchTenantReadinessScore = () =>
  apiFetch<{
    score: number;
    level: "Perlu Dilengkapi" | "Cukup Siap" | "Sangat Siap & Akurat";
    levelColor: "warning" | "info" | "success";
    checklist: Array<{ id: string; label: string; done: boolean; bobot: number; hint: string }>;
    recommendations: string[];
  }>("/tenant/readiness-score");
