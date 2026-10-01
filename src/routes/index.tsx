import { createFileRoute } from "@tanstack/react-router";
import Landing from "../landingpage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Balasin — AI WhatsApp Automation for High-Growth Commerce" },
      {
        name: "description",
        content:
          "Balas chat pelanggan & respon iklan WhatsApp otomatis 24 jam nonstop dengan kecerdasan buatan. Tanpa bikin calon pembeli menunggu.",
      },
      { property: "og:title", content: "Balasin — CS AI WhatsApp Otomatis untuk Bisnis Anda" },
      {
        name: "og:description",
        content:
          "Sambungkan WhatsApp bisnis, lengkapi profil toko dari template, dan biarkan AI melayani pembeli seketika.",
      },
    ],
  }),
  component: Landing,
});
