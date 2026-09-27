export type LicenseStatus = "aktif" | "nonaktif" | "revoked" | "expired";
export type WaStatus = "tersambung" | "memindai" | "terputus";
export type Plan = "Starter" | "Growth" | "Scale";

export interface Tenant {
  id: string;
  nama: string;
  industri: string;
  plan: Plan;
  email: string;
  bergabung: string;
  status: "aktif" | "suspend";
  nomorWa: number;
  chatBulanIni: number;
  kuotaChat: number;
  tokenBulanIni: number;
  lisensiBerakhir: string;
}

export interface License {
  id: string;
  kode: string;
  tenantId: string;
  tenantNama: string;
  plan: Plan;
  status: LicenseStatus;
  dibuat: string;
  berakhir: string;
  kuotaChat: number;
}

export interface WaNumber {
  id: string;
  label: string;
  nomor: string;
  status: WaStatus;
  terakhirAktif: string;
  autoChat: boolean;
  autoIklan: boolean;
}

export interface KnowledgeDoc {
  id: string;
  nama: string;
  tipe: "PDF" | "Teks" | "FAQ Manual";
  ukuran: string;
  potongan: number;
  versi: number;
  diperbarui: string;
  status: "terindeks" | "memproses" | "gagal";
}

export interface FaqItem {
  id: string;
  pertanyaan: string;
  jawaban: string;
}

export interface AdTemplateStep {
  id: string;
  urutan: number;
  tipe: "teks" | "gambar" | "video";
  isiTeks?: string;
  urlGambar?: string;
  namaGambar?: string;
  urlVideo?: string;
  namaVideo?: string;
  urlMedia?: string;
  namaMedia?: string;
}

export interface AdTemplate {
  id: string;
  pertanyaan: string;
  jawaban?: string;
  caraMencocokkan?: "sama_persis" | "boleh_mirip";
  mode?: "exact" | "fuzzy";
  dipakai: number;
  aktif: boolean;
  langkah?: AdTemplateStep[];
}

export interface ChatLog {
  id: string;
  kontak: string;
  nomor: string;
  kanal: "Chat" | "Iklan";
  pesanTerakhir: string;
  balasan: string;
  waktu: string;
  keyakinan: number;
  status: "terjawab" | "perlu manusia" | "diambil alih";
}

export interface AuditEntry {
  id: string;
  aktor: string;
  aksi: string;
  target: string;
  waktu: string;
}

export interface DailyChat {
  hari: string;
  chat: number;
  gagal: number;
}

export interface TokenUsage {
  bulan: string;
  token: number;
}

export interface TopQuestion {
  pertanyaan: string;
  jumlah: number;
}

export const tenants: Tenant[] = [];

export const licenses: License[] = [];

export const waNumbers: WaNumber[] = [];

export const knowledgeDocs: KnowledgeDoc[] = [];

export const faqItems: FaqItem[] = [];

export const adTemplates: AdTemplate[] = [];

export const chatLogs: ChatLog[] = [];

export const auditLog: AuditEntry[] = [];

export const chatHarian: DailyChat[] = [];

export const pemakaianToken: TokenUsage[] = [];

export const pertanyaanTeratas: TopQuestion[] = [];

/**
 * Daftar mesin AI yang bisa dipilih tenant.
 * Diisi dari respons API backend — lihat endpoint /tenant/ai-engines.
 */
export const aiEngines: { id: string; nama: string; catatan: string }[] = [];

