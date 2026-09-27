import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Eye, MessageSquare, MessagesSquare, Search, UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/dashboard/shell";
import { StatusPill } from "@/components/dashboard/status-pill";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { getChatLogs } from "@/mock/api";
import type { ChatLog } from "@/mock/data";

export const Route = createFileRoute("/app/percakapan")({
  head: () => ({
    meta: [
      { title: "Riwayat Chat — Dashboard Balasin" },
      {
        name: "description",
        content: "Pantau percakapan bot dengan pelanggan dan ambil alih jika diperlukan.",
      },
      { property: "og:title", content: "Riwayat Chat — Dashboard Balasin" },
      { property: "og:description", content: "Pantau log percakapan WhatsApp pelanggan." },
    ],
  }),
  component: PercakapanPage,
});

function toneForChatStatus(status: ChatLog["status"]) {
  if (status === "terjawab") return "success";
  if (status === "perlu manusia") return "warning";
  return "info";
}

function PercakapanPage() {
  const { data: logs = [] } = useQuery({ queryKey: ["chats"], queryFn: getChatLogs });
  const [q, setQ] = useState("");
  const [filterKanal, setFilterKanal] = useState<string>("semua");
  const [filterStatus, setFilterStatus] = useState<string>("semua");
  const [selectedChat, setSelectedChat] = useState<ChatLog | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchQuery = `${log.kontak} ${log.nomor} ${log.pesanTerakhir} ${log.balasan}`
      .toLowerCase()
      .includes(q.toLowerCase());
    const matchKanal =
      filterKanal === "semua" || log.kanal.toLowerCase() === filterKanal.toLowerCase();
    const matchStatus = filterStatus === "semua" || log.status === filterStatus;
    return matchQuery && matchKanal && matchStatus;
  });

  return (
    <>
      <PageHeader
        title="Riwayat Chat"
        description="Pantau balasan bot dan segera tangani percakapan yang ditandai butuh bantuan manusia."
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari pesan, kontak, atau nomor WA..."
            className="pl-9"
          />
        </div>

        <Select value={filterKanal} onValueChange={setFilterKanal}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Semua Kanal" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Kanal</SelectItem>
            <SelectItem value="chat">Chat Biasa</SelectItem>
            <SelectItem value="iklan">Chat Iklan</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="semua">Semua Status</SelectItem>
            <SelectItem value="terjawab">Terjawab Bot</SelectItem>
            <SelectItem value="perlu manusia">Perlu Manusia</SelectItem>
            <SelectItem value="diambil alih">Diambil Alih</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="panel overflow-hidden">
        <Table>
          <TableHeader className="bg-card/40">
            <TableRow className="border-b border-border hover:bg-transparent">
              <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                Kontak
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                Kanal
              </TableHead>
              <TableHead className="max-w-xs px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                Pesan Pelanggan
              </TableHead>
              <TableHead className="max-w-xs px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                Balasan Terakhir
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                Waktu
              </TableHead>
              <TableHead className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground border-r border-border">
                Status
              </TableHead>
              <TableHead className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                Aksi
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.map((log) => (
              <TableRow key={log.id} className="border-b border-border">
                <TableCell className="px-6 py-3 border-r border-border">
                  <p className="font-medium text-foreground">{log.kontak}</p>
                  <p className="font-mono text-xs text-muted-foreground">{log.nomor}</p>
                </TableCell>
                <TableCell className="px-4 py-3 border-r border-border">
                  <Badge variant="outline" className="font-normal">
                    {log.kanal}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate px-4 py-3 text-xs text-foreground border-r border-border">
                  &quot;{log.pesanTerakhir}&quot;
                </TableCell>
                <TableCell className="max-w-xs truncate px-4 py-3 text-xs text-muted-foreground border-r border-border">
                  {log.balasan}
                </TableCell>
                <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap border-r border-border">
                  {log.waktu}
                </TableCell>
                <TableCell className="px-4 py-3 border-r border-border">
                  <StatusPill label={log.status} tone={toneForChatStatus(log.status)} />
                </TableCell>
                <TableCell className="px-6 py-3 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedChat(log)}
                      title="Lihat Detail"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    {log.status === "perlu manusia" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          toast.success(`Percakapan ${log.kontak} dialihkan ke WhatsApp Admin`)
                        }
                        title="Ambil Alih"
                      >
                        <UserCheck className="size-3.5" /> Ambil Alih
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="px-6 py-12 text-center text-muted-foreground"
                >
                  <MessagesSquare className="mx-auto mb-2 size-8 opacity-40" />
                  Tidak ada data percakapan yang sesuai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedChat} onOpenChange={(open) => !open && setSelectedChat(null)}>
        {selectedChat && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="size-5 text-primary" />
                Percakapan dengan {selectedChat.kontak}
              </DialogTitle>
              <DialogDescription>
                {selectedChat.nomor} · Kanal {selectedChat.kanal} · Jam {selectedChat.waktu}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground">Pesan Pelanggan:</p>
                <p className="mt-1 text-sm font-medium">{selectedChat.pesanTerakhir}</p>
              </div>

              <div className="rounded-lg border border-border bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-primary">Balasan Bot:</p>
                  <span className="text-xs text-muted-foreground">
                    Tingkat Keyakinan: {Math.round(selectedChat.keyakinan * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-sm text-foreground">{selectedChat.balasan}</p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Status saat ini:</span>
                  <StatusPill
                    label={selectedChat.status}
                    tone={toneForChatStatus(selectedChat.status)}
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success("Percakapan berhasil diambil alih.");
                    setSelectedChat(null);
                  }}
                >
                  Buka di WhatsApp Web
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
