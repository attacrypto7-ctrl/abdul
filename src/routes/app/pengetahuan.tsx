import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  CreditCard,
  FileText,
  History,
  Info,
  Package,
  Plus,
  ShieldAlert,
  Sparkles,
  Store,
  Trash2,
  Truck,
  UploadCloud,
  Briefcase,
  HeartHandshake,
  Stethoscope,
  GraduationCap,
  Building2,
  CalendarCheck,
  Award,
  Wallet,
  UserCheck,
  Heart,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createFaqItemApi,
  deleteFaqItemApi,
  formatDate,
  getFaqItems,
  getKnowledgeDocs,
  getTenantMe,
} from "@/mock/api";

export const Route = createFileRoute("/app/pengetahuan")({
  head: () => ({
    meta: [
      { title: "Pengetahuan Bisnis — Dashboard Balasin" },
      {
        name: "description",
        content: "Kelola informasi bisnis dan template tanya-jawab agar AI WhatsApp membalas pesan pelanggan secara tepat.",
      },
      { property: "og:title", content: "Pengetahuan Bisnis — Dashboard Balasin" },
      { property: "og:description", content: "Panduan dan template informasi bisnis untuk AI WhatsApp." },
    ],
  }),
  component: KnowledgePage,
});

function labelStatusDokumen(status: string) {
  if (status === "terindeks" || status === "siap_dipakai") return "Siap dipakai";
  if (status === "memproses" || status === "sedang_diproses") return "Sedang diproses";
  return "Gagal diproses";
}

// Template Bisnis Klasifikasi
interface BusinessTemplate {
  id: string;
  kategori: "toko" | "agency" | "yayasan" | "klinik" | "edukasi" | "umum";
  kategoriLabel: string;
  icon: any;
  judul: string;
  deskripsi: string;
  contohTanya: string;
  fields: Array<{
    id: string;
    label: string;
    placeholder: string;
    defaultValue: string;
  }>;
  generateJawaban: (values: Record<string, string>) => string;
}

const BUSINESS_TEMPLATES: BusinessTemplate[] = [
  // 1. Toko & E-Commerce
  {
    id: "profil-toko",
    kategori: "toko",
    kategoriLabel: "Toko / E-Commerce",
    icon: Store,
    judul: "Profil & Informasi Toko",
    deskripsi: "Jelaskan nama toko, apa yang dijual, dan keunggulan bisnis Anda kepada calon pembeli.",
    contohTanya: "Bisa jelaskan tentang toko ini dan produk apa yang dijual?",
    fields: [
      { id: "namaToko", label: "Nama Toko / Brand", placeholder: "Contoh: Balesin Store", defaultValue: "Toko Kami" },
      { id: "produkUtama", label: "Produk / Layanan yang Dijual", placeholder: "Contoh: Pakaian wanita & aksesoris kekinian", defaultValue: "Produk berkualitas pilihan terbaik" },
      { id: "keunggulan", label: "Keunggulan Utama", placeholder: "Contoh: 100% Original, garansi tukar, bahan nyaman", defaultValue: "Kualitas terjamin, harga bersahabat, dan pelayanan cepat" },
    ],
    generateJawaban: (v) =>
      `Halo Kak! Selamat datang di ${v.namaToko || "Toko Kami"}. Kami menyediakan ${v.produkUtama || "produk pilihan terbaik"}. Keunggulan belanja di sini adalah ${v.keunggulan || "kualitas terjamin dan pelayanan ramah"}. Ada yang bisa kami bantu hari ini?`,
  },
  {
    id: "jam-operasional",
    kategori: "toko",
    kategoriLabel: "Toko / E-Commerce",
    icon: Clock,
    judul: "Jam Buka & Alamat Lokasi",
    deskripsi: "Informasikan jam kerja admin, hari operasional, dan lokasi toko fisik jika ada.",
    contohTanya: "Toko buka jam berapa dan lokasinya di mana?",
    fields: [
      { id: "jamBuka", label: "Hari & Jam Buka", placeholder: "Contoh: Senin - Sabtu, 08.00 - 21.00 WIB", defaultValue: "Senin - Sabtu, 08.00 - 20.00 WIB" },
      { id: "alamat", label: "Alamat Toko / Pengiriman", placeholder: "Contoh: Jl. Sudirman No. 10, Jakarta Selatan", defaultValue: "Online Store (Pengiriman dari Jakarta)" },
      { id: "catatanLibur", label: "Catatan Hari Libur", placeholder: "Contoh: Minggu & Tanggal Merah slow response", defaultValue: "Pemesanan di luar jam kerja akan diproses di hari kerja berikutnya" },
    ],
    generateJawaban: (v) =>
      `Toko kami buka pada ${v.jamBuka || "Senin - Sabtu, 08.00 - 20.00 WIB"}. Untuk lokasi fisik / titik pengiriman berada di: ${v.alamat || "Jakarta"}. Catatan: ${v.catatanLibur || "Pemesanan tetap bisa dilakukan 24 jam!"}.`,
  },
  {
    id: "katalog-harga",
    kategori: "toko",
    kategoriLabel: "Toko / E-Commerce",
    icon: Package,
    judul: "Daftar Produk & Kisaran Harga",
    deskripsi: "Bantu pelanggan mengetahui daftar produk favorit, varian, dan harga yang berlaku.",
    contohTanya: "Berapa harga produk dan ada promo apa saja?",
    fields: [
      { id: "produkFavorit", label: "Produk Best Seller", placeholder: "Contoh: Paket Starter, Paket Hemat, Kaos Polos", defaultValue: "Varian Best Seller kami" },
      { id: "kisaranHarga", label: "Kisaran Harga / Paket", placeholder: "Contoh: Mulai dari Rp 50.000 s/d Rp 250.000", defaultValue: "Mulai dari Rp 50.000" },
      { id: "promo", label: "Promo Sedang Berjalan", placeholder: "Contoh: Beli 2 gratis ongkir / Diskon 10%", defaultValue: "Gratis ongkir untuk pembelian minimum tertentu" },
    ],
    generateJawaban: (v) =>
      `Untuk produk favorit kami ada ${v.produkFavorit || "berbagai pilihan"}. Kisaran harganya ${v.kisaranHarga || "sangat terjangkau"}. Saat ini kami juga ada promo: ${v.promo || "Spesial diskon & gratis ongkir"}. Silakan beri tahu kami produk yang Kakak inginkan ya!`,
  },
  {
    id: "cara-order",
    kategori: "toko",
    kategoriLabel: "Toko / E-Commerce",
    icon: CreditCard,
    judul: "Cara Pesan & Pilihan Pembayaran",
    deskripsi: "Jelaskan langkah mudah melakukan pemesanan dan nomor rekening / metode bayar yang didukung.",
    contohTanya: "Bagaimana cara order dan apa saja metode pembayarannya?",
    fields: [
      { id: "langkahOrder", label: "Langkah Order", placeholder: "Contoh: Ketik Nama, Alamat, dan Produk yang diinginkan", defaultValue: "Kirimkan format order: Nama, No HP, Alamat, & Pesanan" },
      { id: "metodeBayar", label: "Pilihan Pembayaran", placeholder: "Contoh: Transfer Bank BCA, Mandiri, QRIS, & COD", defaultValue: "Transfer Bank BCA, Mandiri, QRIS, dan COD" },
      { id: "konfirmasi", label: "Konfirmasi Transfer", placeholder: "Contoh: Kirimkan foto bukti transfer ke chat ini", defaultValue: "Setelah transfer, kirimkan bukti pembayarannya ke chat ini ya Kak" },
    ],
    generateJawaban: (v) =>
      `Cara order sangat mudah kak: 1. ${v.langkahOrder || "Kirim format order"}. 2. Lakukan pembayaran via ${v.metodeBayar || "BCA / QRIS / COD"}. 3. ${v.konfirmasi || "Kirim bukti transfer ke sini"} agar pesanan segera kami kirimkan!`,
  },
  {
    id: "pengiriman-kurir",
    kategori: "toko",
    kategoriLabel: "Toko / E-Commerce",
    icon: Truck,
    judul: "Jadwal Pengiriman & Pilihan Kurir",
    deskripsi: "Informasikan kurir yang digunakan serta batas jam transfer agar dikirim hari yang sama.",
    contohTanya: "Bisa kirim pakai kurir apa dan kapan dikirimnya?",
    fields: [
      { id: "kurir", label: "Pilihan Kurir / Ekspedisi", placeholder: "Contoh: JNE, J&T, SiCepat, GoSend & GrabExpress", defaultValue: "JNE, J&T, SiCepat, GoSend, dan Grab" },
      { id: "cutOff", label: "Batas Waktu Kirim Hari Ini", placeholder: "Contoh: Pembayaran sebelum jam 15.00 WIB", defaultValue: "Pembayaran sebelum jam 15.00 WIB dikirim hari yang sama" },
      { id: "estimasi", label: "Estimasi Sampai", placeholder: "Contoh: Jabodetabek 1-2 hari, Luar kota 2-4 hari", defaultValue: "Estimasi pengiriman reguler 1-3 hari kerja" },
    ],
    generateJawaban: (v) =>
      `Pengiriman kami menggunakan ekspedisi ${v.kurir || "JNE, J&T, SiCepat"}. ${v.cutOff || "Order sebelum jam 15.00 WIB akan dikirim pada hari yang sama"}. Estimasi pesanan sampai ${v.estimasi || "sekitar 1-3 hari kerja"}. Nomor resi akan diinfokan setelah dikirim.`,
  },
  {
    id: "garansi-retur",
    kategori: "toko",
    kategoriLabel: "Toko / E-Commerce",
    icon: ShieldAlert,
    judul: "Kebijakan Garansi & Retur",
    deskripsi: "Berikan rasa aman pada pelanggan jika barang rusak, salah kirim, atau butuh penukaran.",
    contohTanya: "Apakah ada garansi atau bisa retur jika barang rusak?",
    fields: [
      { id: "syaratRetur", label: "Syarat Komplain / Retur", placeholder: "Contoh: Wajib menyertakan video unboxing paket tanpa jeda", defaultValue: "Wajib sertakan video unboxing lengkap tanpa jeda" },
      { id: "batasWaktu", label: "Batas Waktu Komplain", placeholder: "Contoh: Maksimal 2x24 jam sejak barang diterima", defaultValue: "Maksimal 2x24 jam setelah paket sampai" },
      { id: "solusi", label: "Solusi yang Diberikan", placeholder: "Contoh: Tukar barang baru atau uang kembali 100%", defaultValue: "Kami siap ganti barang baru atau refund 100%" },
    ],
    generateJawaban: (v) =>
      `Tenang kak, toko kami bergaransi! Syaratnya cukup: ${v.syaratRetur || "Sertakan video unboxing"}. Batas waktu pengajuan ${v.batasWaktu || "2x24 jam sejak paket diterima"}. Kami akan berikan ${v.solusi || "ganti barang baru atau refund penuh"} jika kesalahan dari pihak kami.`,
  },

  // 2. Agency & Jasa Kreatif
  {
    id: "agency-paket",
    kategori: "agency",
    kategoriLabel: "Agency / Jasa",
    icon: Briefcase,
    judul: "Paket Jasa & Alur Kerjasama",
    deskripsi: "Jelaskan paket layanan jasa, alur brief klien, dan estimasi waktu pengerjaan.",
    contohTanya: "Apa saja paket jasa yang tersedia dan bagaimana alur kerjasamanya?",
    fields: [
      { id: "namaAgency", label: "Nama Agency / Studio", placeholder: "Contoh: Kreatif Studio ID", defaultValue: "Studio Kami" },
      { id: "layananUtama", label: "Layanan Utama", placeholder: "Contoh: Desain Grafis, Pembuatan Website, Social Media Ads", defaultValue: "Desain, Pembuatan Website, & Pemasaran Digital" },
      { id: "alurKerja", label: "Alur Kerjasama", placeholder: "Contoh: Konsultasi brief -> Penawaran -> DP 50% -> Pengerjaan", defaultValue: "Diskusi brief -> Proposal biaya -> DP 50% -> Proses pengerjaan & revisi" },
    ],
    generateJawaban: (v) =>
      `Halo! Kami di ${v.namaAgency || "Studio Kami"} siap membantu kebutuhan ${v.layananUtama || "layanan profesional"}. Alur kerjasamanya simpel: ${v.alurKerja || "Konsultasi kebutuhan -> Proposal biaya -> DP -> Pengerjaan"}. Mau mulai konsultasi proyek Anda sekarang?`,
  },

  // 3. Yayasan / Non-Profit / Sosial
  {
    id: "yayasan-donasi",
    kategori: "yayasan",
    kategoriLabel: "Yayasan / Non-Profit",
    icon: HeartHandshake,
    judul: "Rekening Donasi Resmi & Konfirmasi",
    deskripsi: "Informasikan nomor rekening donasi resmi, program kemanusiaan, dan konfirmasi sedekah via WhatsApp.",
    contohTanya: "Bagaimana cara menyalurkan donasi dan ke rekening mana?",
    fields: [
      { id: "namaYayasan", label: "Nama Yayasan / Lembaga", placeholder: "Contoh: Yayasan Berkah Peduli Ummat", defaultValue: "Yayasan Kami" },
      { id: "rekening", label: "Nomor Rekening Resmi & Bank", placeholder: "Contoh: BSI 7123-456-789 / Mandiri 123-000-456 a/n Yayasan Berkah", defaultValue: "Bank Syariah Indonesia (BSI) / Mandiri a/n Yayasan Resmi" },
      { id: "penyaluran", label: "Fokus Penyaluran Donasi", placeholder: "Contoh: Santunan yatim, beasiswa dhuafa, dan tanggap darurat bencana", defaultValue: "Pangan dhuafa, beasiswa anak yatim, dan bantuan warga dhuafa" },
    ],
    generateJawaban: (v) =>
      `Alhamdulillah, terima kasih atas niat mulia Kakak. Donasi untuk ${v.namaYayasan || "Yayasan Kami"} dapat disalurkan melalui rekening resmi: ${v.rekening || "Rekening Resmi Yayasan"}. Penyaluran kami fokuskan untuk ${v.penyaluran || "program kemanusiaan"}. Setelah transfer, mohon kirimkan bukti ke chat ini agar tim kami dapat mencatat & menyampaikan doa keberkahan.`,
  },
  {
    id: "yayasan-ziswaf",
    kategori: "yayasan",
    kategoriLabel: "Yayasan / Non-Profit",
    icon: Wallet,
    judul: "Panduan & Hitung Zakat, Infaq, Fidyah (ZISWAF)",
    deskripsi: "Bantu muzakki/donatur mengetahui nisab zakat profesi/maal, fidyah puasa, dan tata cara akad sedekah.",
    contohTanya: "Berapa nisab dan bagaimana cara menghitung zakat penghasilan atau fidyah?",
    fields: [
      { id: "nisabZakat", label: "Nisab Zakat Penghasilan", placeholder: "Contoh: Setara 85 gr emas (~Rp 7.000.000/bulan)", defaultValue: "Setara 85 gram emas (penghasilan min. Rp 7.000.000/bulan)" },
      { id: "kadarZakat", label: "Kadar / Persentase Zakat", placeholder: "Contoh: 2,5% dari penghasilan bersih", defaultValue: "2,5% dari total penghasilan bersih bulanan" },
      { id: "fidyah", label: "Tarif Fidyah per Hari", placeholder: "Contoh: Rp 45.000 - Rp 50.000 per hari (1 porsi makan dhuafa)", defaultValue: "Rp 45.000 / hari (porsi makan bergizi untuk 1 mustahik)" },
    ],
    generateJawaban: (v) =>
      `Untuk perhitungan Zakat Penghasilan: Nisab yang berlaku adalah ${v.nisabZakat || "setara 85 gram emas"}. Jika telah mencapai nisab, kewajiban zakatnya adalah ${v.kadarZakat || "2,5%"}. Untuk Fidyah, nominalnya adalah ${v.fidyah || "Rp 45.000 per hari"}. Kami siap menyalurkan zakat & fidyah Kakak langsung kepada 8 golongan asnaf mustahik yang berhak.`,
  },
  {
    id: "yayasan-jemput",
    kategori: "yayasan",
    kategoriLabel: "Yayasan / Non-Profit",
    icon: Truck,
    judul: "Layanan Jemput Donasi & Titip Kotak Amal",
    deskripsi: "Informasikan layanan kurir penjemputan donasi tunai/sembako ke rumah serta penitipan kencleng amal.",
    contohTanya: "Apakah ada layanan jemput donasi sembako ke rumah atau titip kotak amal?",
    fields: [
      { id: "areaJemput", label: "Area Jangkauan Penjemputan", placeholder: "Contoh: Wilayah Jabodetabek & sekitarnya", defaultValue: "Jabodetabek dan wilayah kota operasional kami" },
      { id: "syaratJemput", label: "Ketentuan Penjemputan", placeholder: "Contoh: Donasi beras/sembako, barang layak pakai, atau titip donasi tunai", defaultValue: "Paket sembako, beras, pakaian layak, atau donasi tunai langsung" },
      { id: "formatAlamat", label: "Format Kirim Alamat", placeholder: "Contoh: Nama Donatur, Alamat Lengkap + Shareloc, dan Jenis Donasi", defaultValue: "Ketik: Nama Donatur, Alamat Lengkap + Shareloc, Waktu Jemput yang diinginkan" },
    ],
    generateJawaban: (v) =>
      `Bisa banget kak! Kami menyediakan Layanan Jemput Donasi untuk area ${v.areaJemput || "wilayah operasional kami"}. Kami menerima ${v.syaratJemput || "donasi sembako, barang bermanfaat, dan donasi tunai"}. Cukup kirim format: ${v.formatAlamat || "Nama, Alamat & Waktu Penjemputan"}, tim kurir relawan kami akan segera menjemput ke lokasi Kakak.`,
  },
  {
    id: "yayasan-laporan",
    kategori: "yayasan",
    kategoriLabel: "Yayasan / Non-Profit",
    icon: Award,
    judul: "Transparansi, Izin Resmi & Audit Keuangan",
    deskripsi: "Tampilkan legalitas izin Kemenkumham/Kemenag dan akses dokumentasi penyaluran terbuka bagi donatur.",
    contohTanya: "Apakah yayasan ini resmi dan di mana saya bisa melihat dokumentasi penyaluran donasi?",
    fields: [
      { id: "legalitas", label: "Legalitas & Izin Operasional", placeholder: "Contoh: SK Kemenkumham No. AHU-xxxx & Tanda Daftar Dinsos", defaultValue: "SK Kemenkumham RI & Terdaftar Resmi di Dinas Sosial" },
      { id: "audit", label: "Status Audit Keuangan", placeholder: "Contoh: Diaudit berkala oleh Kantor Akuntan Publik (WTP)", defaultValue: "Laporan keuangan diaudit secara independen dan akuntabel" },
      { id: "dokumentasi", label: "Akses Dokumentasi / Laporan", placeholder: "Contoh: Bisa dilihat di website resmi & Instagram yayasan", defaultValue: "Seluruh foto dan video dokumentasi penyaluran diupdate berkala di kanal resmi kami" },
    ],
    generateJawaban: (v) =>
      `Yayasan kami berbadan hukum resmi dengan ${v.legalitas || "legalitas Kemenkumham & Dinsos"}. ${v.audit || "Pengelolaan dana dilakukan secara amanah dan transparan"}. Untuk melihat dokumentasi foto/video penyaluran serta laporan berkala, ${v.dokumentasi || "Kakak bisa memantau langsung di kanal publik resmi kami"}. Insya Allah amanah 100%.`,
  },
  {
    id: "yayasan-doa",
    kategori: "yayasan",
    kategoriLabel: "Yayasan / Non-Profit",
    icon: Heart,
    judul: "Layanan Titip Doa & Hajat Bersama Anak Yatim",
    deskripsi: "Sambut jamaah dan donatur yang ingin menitipkan doa kesembuhan, kelancaran rezeki/ujian, atau doa arwah.",
    contohTanya: "Apakah bisa titip doa bersama adik-adik yatim untuk keluarga yang sedang sakit atau punya hajat?",
    fields: [
      { id: "namaYayasan", label: "Nama Yayasan", placeholder: "Contoh: Yayasan Berkah Ummat", defaultValue: "Yayasan Kami" },
      { id: "jadwalDoa", label: "Jadwal Doa Bersama Yatim", placeholder: "Contoh: Setiap malam Jum'at ba'da Maghrib & istighotsah rutin", defaultValue: "Setiap Kamis malam (malam Jum'at) ba'da Maghrib bersama adik-adik yatim" },
      { id: "formatTitip", label: "Format Kirim Hajat Doa", placeholder: "Contoh: Ketik Nama Lengkap & Hajat/Doa Khusus", defaultValue: "Nama Shahibul Hajat / Almarhum & permohonan doa yang ingin dipanjatkan" },
    ],
    generateJawaban: (v) =>
      `Aamiin ya Rabbal 'Alamin. Dengan senang hati kami menerima titipan doa dan hajat dari Kakak untuk didoakan bersama adik-adik santri yatim ${v.namaYayasan || "yayasan kami"}. Agenda doa bersama rutin kami laksanakan pada: ${v.jadwalDoa || "malam Jum'at ba'da Maghrib"}. Mohon kirimkan ${v.formatTitip || "nama dan hajat khusus Kakak"} di chat ini. Semoga Allah SWT mengijabah dan memberikan keberkahan berlimpah.`,
  },
  {
    id: "yayasan-bantuan",
    kategori: "yayasan",
    kategoriLabel: "Yayasan / Non-Profit",
    icon: UserCheck,
    judul: "Syarat & Alur Permohonan Bantuan Kemanusiaan",
    deskripsi: "Panduan bagi masyarakat yang membutuhkan bantuan biaya pengobatan, sembako pangan, atau santunan yatim.",
    contohTanya: "Bagaimana cara dan syarat mengajukan permohonan bantuan ke yayasan?",
    fields: [
      { id: "kriteria", label: "Kriteria Penerima Manfaat", placeholder: "Contoh: Dhuafa, anak yatim, pasien darurat, warga prasejahtera", defaultValue: "Warga dhuafa, anak yatim/piatu prasejahtera, dan pasien sakit darurat" },
      { id: "syaratDokumen", label: "Berkas Persyaratan", placeholder: "Contoh: SKTM RT/RW, fotokopi KTP/KK, foto kondisi rumah/surat dokter", defaultValue: "Surat Keterangan Tidak Mampu (SKTM), fotokopi KTP/KK, dan bukti kondisi medis/ekonomi" },
      { id: "alurVerifikasi", label: "Proses & Waktu Verifikasi", placeholder: "Contoh: Tim relawan melakukan survey 2-3 hari kerja", defaultValue: "Tim asesmen sosial kami akan melakukan verifikasi data dan survey lapangan 2-3 hari kerja" },
    ],
    generateJawaban: (v) =>
      `Untuk pengajuan bantuan sosial bagi ${v.kriteria || "warga yang membutuhkan"}, persyaratannya adalah: ${v.syaratDokumen || "SKTM RT/RW, fotokopi KTP/KK, dan bukti pendukung"}. Alurnya: Berkas dikirimkan ke kontak ini, kemudian ${v.alurVerifikasi || "tim relawan kami akan melakukan verifikasi & survey"}. Kami akan berusaha semaksimal mungkin membantu sesuai amanah donatur.`,
  },

  // 4. Klinik / Kesehatan / Salon
  {
    id: "klinik-reservasi",
    kategori: "klinik",
    kategoriLabel: "Klinik / Kesehatan / Salon",
    icon: Stethoscope,
    judul: "Jadwal Praktik & Reservasi Janji Temu",
    deskripsi: "Informasikan jadwal dokter/terapis, tarif dasar konsultasi, dan format booking reservasi.",
    contohTanya: "Bagaimana cara booking janji temu dan jadwal dokter kapan saja?",
    fields: [
      { id: "namaKlinik", label: "Nama Klinik / Tempat Praktik", placeholder: "Contoh: Klinik Sehat Prima", defaultValue: "Klinik Kami" },
      { id: "jadwalPraktik", label: "Jadwal Praktik / Operasional", placeholder: "Contoh: Senin - Sabtu, 09.00 - 20.00 WIB", defaultValue: "Senin - Sabtu, 09.00 - 20.00 WIB" },
      { id: "formatBooking", label: "Format Reservasi", placeholder: "Contoh: Nama Pasien / Tanggal / Keluhan / Pilihan Dokter", defaultValue: "Ketik: Nama Pasien, Hari/Jam Reservasi, Layanan yang diinginkan" },
    ],
    generateJawaban: (v) =>
      `Halo! Layanan di ${v.namaKlinik || "Klinik Kami"} beroperasi pada ${v.jadwalPraktik || "Senin - Sabtu"}. Untuk reservasi janji temu, silakan kirim format: ${v.formatBooking || "Nama Pasien, Hari & Jam, serta Keluhan/Layanan"}. Admin kami akan segera mengonfirmasi ketersediaan jadwalnya.`,
  },

  // 5. Sekolah & Edukasi
  {
    id: "edukasi-pendaftaran",
    kategori: "edukasi",
    kategoriLabel: "Sekolah / Edukasi / Kursus",
    icon: GraduationCap,
    judul: "Info Pendaftaran & Biaya Belajar",
    deskripsi: "Informasikan program kursus/kelas, rincian biaya belajar, dan syarat pendaftaran murid baru.",
    contohTanya: "Bagaimana cara daftar kelas dan berapa biaya kursusnya?",
    fields: [
      { id: "namaLembaga", label: "Nama Lembaga / Kursus", placeholder: "Contoh: Akademi Cerdas Bangsa", defaultValue: "Lembaga Pendidikan Kami" },
      { id: "programKelas", label: "Pilihan Program Kelas", placeholder: "Contoh: Kelas Reguler, Privat 1-on-1, Kelas Online", defaultValue: "Kelas Reguler & Kelas Intensif Privat" },
      { id: "syaratDaftar", label: "Syarat & Alur Daftar", placeholder: "Contoh: Mengisi formulir online, tes penempatan, pembayaran", defaultValue: "Isi data siswa -> Pilih jadwal kelas -> Pembayaran biaya pendaftaran" },
    ],
    generateJawaban: (v) =>
      `Selamat datang di ${v.namaLembaga || "Lembaga Kami"}! Kami menyediakan program: ${v.programKelas || "Pilihan program belajar lengkap"}. Alur pendaftarannya: ${v.syaratDaftar || "Isi formulir pendaftaran dan tentukan jadwal kelas"}. Mau kami kirimkan rincian silabus kelasnya kak?`,
  },
];

function KnowledgePage() {
  const queryClient = useQueryClient();
  const { data: docs = [] } = useQuery({ queryKey: ["docs"], queryFn: getKnowledgeDocs });
  const { data: faqs = [] } = useQuery({ queryKey: ["faqs"], queryFn: getFaqItems });
  const { data: tenant } = useQuery({ queryKey: ["tenant-me"], queryFn: getTenantMe });

  // Filter kategori template
  const [filterKategori, setFilterKategori] = useState<string>("semua");

  // State Template Modal
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // State Tambah FAQ Manual
  const [tanyaManual, setTanyaManual] = useState("");
  const [jawabManual, setJawabManual] = useState("");
  const [isSavingFaq, setIsSavingFaq] = useState(false);

  const currentIndustri = tenant?.industri || "Toko / E-Commerce";

  // Tentukan kategori eksklusif berdasarkan tipe bisnis pengguna
  const exclusiveCategory = useMemo(() => {
    const ind = currentIndustri.toLowerCase();
    if (ind.includes("yayasan") || ind.includes("profit") || ind.includes("sosial")) return "yayasan";
    if (ind.includes("agency") || ind.includes("jasa") || ind.includes("konsultan")) return "agency";
    if (ind.includes("klinik") || ind.includes("kesehatan") || ind.includes("salon") || ind.includes("spa")) return "klinik";
    if (ind.includes("sekolah") || ind.includes("edukasi") || ind.includes("kursus") || ind.includes("bimbel")) return "edukasi";
    return "toko"; // Default toko / e-commerce
  }, [currentIndustri]);

  // HANYA tampilkan template yang sesuai dengan tipe bisnis pengguna!
  const filteredTemplates = useMemo(() => {
    return BUSINESS_TEMPLATES.filter((tpl) => tpl.kategori === exclusiveCategory);
  }, [exclusiveCategory]);

  const handleOpenTemplate = (tpl: BusinessTemplate) => {
    setSelectedTemplate(tpl);
    const initialValues: Record<string, string> = {};
    tpl.fields.forEach((f) => {
      initialValues[f.id] = f.defaultValue;
    });
    setTemplateValues(initialValues);
  };

  const handleSaveTemplateAsFaq = async () => {
    if (!selectedTemplate) return;
    setIsSavingTemplate(true);
    try {
      const jawaban = selectedTemplate.generateJawaban(templateValues);
      await createFaqItemApi({
        pertanyaan: selectedTemplate.contohTanya,
        jawaban,
      });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["readiness-score"] });
      toast.success("Informasi bisnis berhasil disimpan ke AI!", {
        description: "AI WhatsApp sekarang akan otomatis menjawab pesan sesuai data yang Anda masukkan.",
      });
      setSelectedTemplate(null);
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan template bisnis");
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleSaveManualFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tanyaManual.trim() || !jawabManual.trim()) {
      toast.error("Harap isi pertanyaan dan jawaban");
      return;
    }
    setIsSavingFaq(true);
    try {
      await createFaqItemApi({
        pertanyaan: tanyaManual.trim(),
        jawaban: jawabManual.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["readiness-score"] });
      toast.success("Tanya-jawab berhasil disimpan!");
      setTanyaManual("");
      setJawabManual("");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menyimpan FAQ");
    } finally {
      setIsSavingFaq(false);
    }
  };

  const handleDeleteFaq = async (id: string, pertanyaan: string) => {
    if (!confirm(`Hapus pertanyaan: "${pertanyaan}"?`)) return;
    try {
      await deleteFaqItemApi(id);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      queryClient.invalidateQueries({ queryKey: ["readiness-score"] });
      toast.success("Pertanyaan berhasil dihapus");
    } catch (err: any) {
      toast.error(err?.message || "Gagal menghapus");
    }
  };

  return (
    <>
      <PageHeader
        title="Pengetahuan Bisnis"
        description="Pusat informasi usaha Anda. Data ini menjadi pedoman utama bagi AI untuk membalas chat WhatsApp pelanggan secara akurat 24/7."
      />

      <Tabs defaultValue="template">
        <TabsList className="grid w-full grid-cols-3 max-w-lg rounded-xl">
          <TabsTrigger value="template" className="flex items-center gap-1.5 font-medium">
            <Sparkles className="size-3.5 text-emerald-500" />
            Template Bisnis
          </TabsTrigger>
          <TabsTrigger value="faq" className="flex items-center gap-1.5 font-medium">
            <BookOpen className="size-3.5" />
            Tanya Jawab ({faqs.length})
          </TabsTrigger>
          <TabsTrigger value="dokumen" className="flex items-center gap-1.5 font-medium">
            <FileText className="size-3.5" />
            Berkas ({docs.length})
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: TEMPLATE BISNIS SIAP PAKAI */}
        <TabsContent value="template" className="mt-6 space-y-6">
          {/* Banner Klasifikasi Bisnis */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Building2 className="size-4.5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Template Khusus:{" "}
                  <strong className="text-emerald-700 dark:text-emerald-300">
                    {currentIndustri}
                  </strong>
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Menampilkan template siap pakai yang khusus dirancang untuk operasional {currentIndustri}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-card px-3 py-1 rounded-full border border-border">
                {faqs.length} FAQ Aktif
              </span>
              <Button asChild variant="outline" size="sm" className="rounded-xl text-xs h-7">
                <Link to="/app/pengaturan">Ubah Tipe Bisnis di Pengaturan →</Link>
              </Button>
            </div>
          </div>

          {/* Grid Template Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <div
                  key={tpl.id}
                  className="panel group relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-200 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 transition-colors group-hover:bg-emerald-500/20">
                        <Icon className="size-5" />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {tpl.kategoriLabel}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{tpl.judul}</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {tpl.deskripsi}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-between rounded-xl hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs"
                      onClick={() => handleOpenTemplate(tpl)}
                    >
                      <span>Gunakan Template</span>
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* TAB 2: TANYA JAWAB (FAQ) AKTIF */}
        <TabsContent value="faq" className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="panel divide-y divide-border overflow-hidden rounded-2xl">
            <div className="bg-secondary/20 px-5 py-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Daftar Pertanyaan yang Sudah Dikuasai AI
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {faqs.length} Jawaban Aktif
              </span>
            </div>

            {faqs.map((f: any) => (
              <div key={f.id} className="group flex items-start justify-between gap-4 p-5 hover:bg-secondary/10 transition-colors">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Q
                    </span>
                    <p className="text-sm font-semibold text-foreground">{f.pertanyaan}</p>
                  </div>
                  <p className="text-xs text-muted-foreground pl-7 leading-relaxed whitespace-pre-wrap">
                    {f.jawaban}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:text-destructive opacity-80 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteFaq(f.id, f.pertanyaan)}
                  title="Hapus Tanya Jawab"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}

            {faqs.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Belum ada tanya jawab. Pilih template di tab <strong>Template Bisnis</strong> untuk menambahkan dengan cepat.
              </div>
            )}
          </div>

          {/* Form Tambah Manual */}
          <div className="panel p-5 rounded-2xl h-fit space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Tambah Tanya-Jawab Bebas</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Punya pertanyaan khas toko Anda? Tuliskan di sini agar AI bisa langsung menjawabnya.
              </p>
            </div>

            <form onSubmit={handleSaveManualFaq} className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="tanya" className="text-xs">Pertanyaan Pelanggan</Label>
                <Input
                  id="tanya"
                  placeholder="Contoh: Apakah ada diskon untuk reseller?"
                  value={tanyaManual}
                  onChange={(e) => setTanyaManual(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="jawab" className="text-xs">Jawaban AI yang Diinginkan</Label>
                <Textarea
                  id="jawab"
                  placeholder="Contoh: Ada kak! Reseller minimal pembelian 10 pcs diskon 20%..."
                  rows={4}
                  value={jawabManual}
                  onChange={(e) => setJawabManual(e.target.value)}
                  className="text-xs rounded-xl"
                />
              </div>

              <Button
                type="submit"
                disabled={isSavingFaq}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs"
              >
                {isSavingFaq ? "Menyimpan..." : "Simpan Tanya-Jawab"}
              </Button>
            </form>
          </div>
        </TabsContent>

        {/* TAB 3: BERKAS DOKUMEN */}
        <TabsContent value="dokumen" className="mt-6 space-y-6">
          <div className="panel p-6 rounded-2xl">
            <h3 className="text-sm font-semibold text-foreground">Unggah Dokumen Bisnis</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Unggah PDF katalog, buku panduan, atau berkas profil bisnis Anda. AI akan mempelajari seluruh isinya secara otomatis.
            </p>

            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/20 p-8 text-center">
              <UploadCloud className="size-10 text-emerald-500/70 mb-2" />
              <p className="text-sm font-medium">Tarik &amp; lepas berkas di sini, atau klik untuk memilih</p>
              <p className="text-xs text-muted-foreground mt-1">Mendukung format PDF, TXT (Maks. 10MB)</p>
              <Button size="sm" variant="outline" className="mt-4 rounded-xl text-xs">
                Pilih Berkas
              </Button>
            </div>
          </div>

          <div className="panel overflow-hidden rounded-2xl">
            <div className="bg-secondary/20 px-5 py-3 border-b border-border">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Riwayat Berkas yang Diunggah
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Berkas</TableHead>
                  <TableHead>Ukuran</TableHead>
                  <TableHead>Status Pembelajaran</TableHead>
                  <TableHead>Terakhir Diperbarui</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {docs.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-xs flex items-center gap-2">
                      <FileText className="size-4 text-emerald-500" />
                      {d.nama}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.ukuran || "—"}</TableCell>
                    <TableCell>
                      <StatusPill
                        label={labelStatusDokumen(d.status)}
                        tone={d.status === "terindeks" || d.status === "siap" ? "success" : "info"}
                      />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(d.diperbarui)}</TableCell>
                  </TableRow>
                ))}
                {docs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-xs text-muted-foreground py-6">
                      Belum ada dokumen yang diunggah.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* MODAL ISI TEMPLATE BISNIS */}
      <Dialog open={Boolean(selectedTemplate)} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
          {selectedTemplate && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <selectedTemplate.icon className="size-4" />
                  </span>
                  <DialogTitle className="text-base font-bold">{selectedTemplate.judul}</DialogTitle>
                </div>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {selectedTemplate.deskripsi}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id} className="space-y-1.5">
                    <Label htmlFor={field.id} className="text-xs font-semibold text-foreground">
                      {field.label}
                    </Label>
                    <Input
                      id={field.id}
                      placeholder={field.placeholder}
                      value={templateValues[field.id] || ""}
                      onChange={(e) =>
                        setTemplateValues({ ...templateValues, [field.id]: e.target.value })
                      }
                      className="text-xs rounded-xl"
                    />
                  </div>
                ))}

                {/* Pratinjau Jawaban AI */}
                <div className="rounded-xl border border-border bg-secondary/30 p-3.5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
                    💬 Pratinjau Balasan AI di WhatsApp:
                  </span>
                  <p className="text-xs text-foreground/90 leading-relaxed italic bg-card/60 p-2.5 rounded-lg border border-border/50">
                    "{selectedTemplate.generateJawaban(templateValues)}"
                  </p>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                  disabled={isSavingTemplate}
                  className="rounded-xl text-xs"
                >
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveTemplateAsFaq}
                  disabled={isSavingTemplate}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs px-4"
                >
                  {isSavingTemplate ? "Menyimpan ke AI..." : "Simpan & Terapkan ke AI"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
