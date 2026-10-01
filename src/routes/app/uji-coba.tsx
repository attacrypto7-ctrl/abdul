import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bot, RotateCcw, Send, ShieldAlert, Sparkles, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
import { getAdTemplates, getFaqItems, getKnowledgeDocs, getLicenseStatus, trialBot } from "@/mock/api";

export const Route = createFileRoute("/app/uji-coba")({
  head: () => ({
    meta: [
      { title: "Uji Coba Bot — Dashboard Balasin" },
      {
        name: "description",
        content:
          "Simulasi percakapan dengan bot AI Anda sebelum dihubungkan ke WhatsApp pelanggan asli.",
      },
      { property: "og:title", content: "Uji Coba Bot — Dashboard Balasin" },
      { property: "og:description", content: "Simulasi percakapan bot AI." },
    ],
  }),
  component: UjiCobaPage,
});

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  source?: string;
  confidence?: number;
  time: string;
}

function UjiCobaPage() {
  const { data: docs = [] } = useQuery({ queryKey: ["docs"], queryFn: getKnowledgeDocs });
  const { data: faqs = [] } = useQuery({ queryKey: ["faqs"], queryFn: getFaqItems });
  const { data: ads = [] } = useQuery({ queryKey: ["ads"], queryFn: getAdTemplates });
  const { data: licenseStatus } = useQuery({ queryKey: ["license-status"], queryFn: getLicenseStatus });

  const [kanal, setKanal] = useState<"chat" | "iklan">("chat");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const isLicenseActive = licenseStatus?.isActive ?? false;

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: userText,
      time: now,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const trialResult = await trialBot(userText, kanal);
      if (trialResult) {
        const botMsg: Message = {
          id: `b-${Date.now()}`,
          sender: "bot",
          text: trialResult.jawaban,
          source: trialResult.sumber,
          confidence: trialResult.keyakinan,
          time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botMsg]);
        setLoading(false);
        return;
      }
    } catch {
      // Fallback local logic below
    }

    setTimeout(() => {
      let botResponse =
        "Maaf, saya belum menemukan jawaban dari dokumen atau FAQ yang tersedia. Chat ini akan dialihkan ke admin.";
      let source = "Fallback / Belum Ada Data";
      let confidence = 0.4;

      const lower = userText.toLowerCase();

      if (kanal === "iklan") {
        const matchedAd = ads.find((t: any) =>
          t.mode === "exact"
            ? lower === t.pertanyaan.toLowerCase()
            : lower.includes(t.pertanyaan.toLowerCase()) ||
              t.pertanyaan.toLowerCase().includes(lower),
        );

        if (matchedAd) {
          botResponse = matchedAd.jawaban;
          source = `Template Iklan: "${matchedAd.pertanyaan}"`;
          confidence = 0.98;
        }
      } else {
        const matchedFaq = faqs.find(
          (f: any) =>
            lower.includes(f.pertanyaan.toLowerCase()) ||
            f.pertanyaan.toLowerCase().includes(lower),
        );

        if (matchedFaq) {
          botResponse = matchedFaq.jawaban;
          source = `FAQ: "${matchedFaq.pertanyaan}"`;
          confidence = 0.95;
        } else if (
          lower.includes("halo") ||
          lower.includes("hai") ||
          lower.includes("pagi") ||
          lower.includes("siang") ||
          lower.includes("malam")
        ) {
          botResponse = "Halo! Ada yang bisa kami bantu hari ini?";
          source = "Sapaan Otomatis";
          confidence = 0.99;
        }
      }

      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: botResponse,
        source,
        confidence,
        time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
      setLoading(false);
    }, 500);
  };

  const resetChat = () => {
    setMessages([]);
    toast.info("Percakapan uji coba dibersihkan.");
  };

  return (
    <>
      <PageHeader
        title="Uji Coba Bot"
        description="Simulasikan percakapan pelanggan untuk memastikan respons AI dan template jawaban sudah akurat."
        action={
          <Button variant="outline" size="sm" onClick={resetChat} disabled={messages.length === 0}>
            <RotateCcw className="size-3.5" /> Bersihkan Obrolan
          </Button>
        }
      />

      {!isLicenseActive && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-amber-800 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs sm:text-sm">
              <span className="font-semibold">Lisensi Tidak Aktif atau Habis:</span> Fitur auto-reply AI dan balas iklan dinonaktifkan sampai lisensi diaktifkan.
            </div>
          </div>
          <Button asChild size="sm" variant="outline" className="border-amber-500/40 hover:bg-amber-500/20 text-xs">
            <Link to="/app/lisensi">Aktivasi Lisensi →</Link>
          </Button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="panel space-y-5 p-5">
          <h2 className="text-sm font-semibold">Pengaturan Simulasi</h2>

          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs space-y-1">
            <p className="font-medium text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary" /> Mesin AI
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Model AI diatur otomatis oleh backend sesuai paket lisensi Anda.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Skenario Masuk</Label>
            <Select value={kanal} onValueChange={(v: "chat" | "iklan") => setKanal(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chat">Chat Pelanggan (FAQ & RAG)</SelectItem>
                <SelectItem value="iklan">Chat dari Iklan (Template Terikat)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Sparkles className="size-3.5 text-primary" /> Info Pengetahuan Aktif
            </div>
            <p>• {docs.length} Dokumen terindeks</p>
            <p>• {faqs.length} FAQ Manual</p>
            <p>• {ads.length} Template Balas Iklan</p>
          </div>
        </div>

        <div className="panel flex h-[580px] flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-secondary/20 px-5 py-3">
            <div className="flex items-center gap-3">
              <img
                src="/chatbot_wa.png"
                alt="Bot Asisten"
                className="size-8 rounded-lg object-contain"
              />
              <div>
                <p className="text-xs font-semibold">Bot Asisten</p>
                <p className="text-[10px] text-muted-foreground">Status: Siap Uji Coba</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground">
                <Bot className="size-10 opacity-30 mb-2" />
                <p className="text-sm font-medium">Mulai Percakapan Simulasi</p>
                <p className="text-xs max-w-xs mt-1">
                  Kirim pesan di bawah untuk menguji respons bot berdasarkan basis pengetahuan Anda.
                </p>
              </div>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.sender === "bot" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Bot className="size-3.5" />
                    </span>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-secondary text-foreground rounded-tl-none border border-border"
                    }`}
                  >
                    <p>{m.text}</p>
                    <div className="mt-1 flex items-center justify-between gap-3 text-[10px] opacity-70">
                      <span>{m.time}</span>
                      {m.confidence !== undefined && (
                        <span>Keyakinan: {Math.round(m.confidence * 100)}%</span>
                      )}
                    </div>
                    {m.source && (
                      <div className="mt-1.5 border-t border-border/40 pt-1 text-[10px] text-primary">
                        Sumber: {m.source}
                      </div>
                    )}
                  </div>

                  {m.sender === "user" && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground">
                      <User className="size-3.5" />
                    </span>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Bot className="size-3.5 animate-spin text-primary" />
                <span>Bot sedang memproses jawaban...</span>
              </div>
            )}
          </div>

          <div className="border-t border-border bg-card p-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan simulasi..."
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
