import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { saveSession } from "@/lib/api-client";
import { saveGoogleUser } from "@/lib/google-auth";

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success">("loading");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || params.get("accessToken") || params.get("access_token");
    const namaParam = params.get("name") || params.get("nama");
    const emailParam = params.get("email");
    const pictureParam = params.get("picture") || params.get("avatar") || params.get("photo");

    if (token) {
      try {
        const payload = decodeJwt(token);
        const role =
          payload && typeof payload === "object" && payload["role"] === "admin"
            ? "admin"
            : "tenant";
        const tenantId =
          payload && typeof payload === "object" && typeof payload["sub"] === "string"
            ? (payload["sub"] as string)
            : undefined;
        const nama =
          (payload && typeof payload === "object" && typeof payload["nama"] === "string"
            ? (payload["nama"] as string)
            : payload && typeof payload === "object" && typeof payload["name"] === "string"
              ? (payload["name"] as string)
              : namaParam) || "Pengguna";
        const email =
          (payload && typeof payload === "object" && typeof payload["email"] === "string"
            ? (payload["email"] as string)
            : emailParam) || "";
        const pictureRaw =
          (payload && typeof payload === "object" && typeof payload["picture"] === "string"
            ? (payload["picture"] as string)
            : payload && typeof payload === "object" && typeof payload["avatarUrl"] === "string"
              ? (payload["avatarUrl"] as string)
              : pictureParam) || "";
        saveSession(token, role, tenantId);
        if (email) {
          const avatar =
            pictureRaw ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=10b981&color=fff&size=200`;
          saveGoogleUser({ name: nama, email, picture: avatar, avatarUrl: avatar });
        }
        setStatus("success");
        toast.success("Berhasil masuk dengan Google");
        setTimeout(() => navigate({ to: "/" }), 400);
        return;
      } catch {
        void 0;
      }
    }

    if (namaParam || emailParam) {
      const nama = namaParam || "Pengguna Google";
      const email = emailParam || "";
      const avatar =
        pictureParam ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=10b981&color=fff&size=200`;
      if (email) saveGoogleUser({ name: nama, email, picture: avatar, avatarUrl: avatar });
      try {
        localStorage.setItem("balasin_token", "google-profile-only");
        localStorage.setItem("balasin_role", "tenant");
      } catch {
        void 0;
      }
      setStatus("success");
      toast.success("Berhasil masuk dengan Google");
      setTimeout(() => navigate({ to: "/" }), 400);
      return;
    }

    if (!token) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="panel w-full max-w-sm space-y-4 p-8 text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Memproses login Google...</p>
          </>
        )}
        {status === "success" && (
          <>
            <p className="text-sm font-medium text-emerald-600">
              Login berhasil. Mengalihkan ke dashboard...
            </p>
          </>
        )}
        {status === "success" && null}
      </div>
    </div>
  );
}
