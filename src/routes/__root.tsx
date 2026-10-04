import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error("TANSTACK_ROOT_ERROR:", error);
  if (error?.stack) {
    console.error("TANSTACK_ROOT_ERROR_STACK:", error.stack);
  }
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        {error?.message ? (
          <div className="mt-4 max-h-32 overflow-auto rounded bg-destructive/10 p-2 text-left font-mono text-xs text-destructive">
            {error.message}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              reset();
              window.location.reload();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Balasin — Platform CS AI WhatsApp Multi-Tenant" },
      {
        name: "description",
        content:
          "Hubungkan WhatsApp bisnis Anda ke AI yang membalas chat pelanggan otomatis dari FAQ sendiri.",
      },
      { name: "author", content: "Balasin" },
      { property: "og:title", content: "Balasin — Platform CS AI WhatsApp" },
      {
        property: "og:description",
        content: "Balas chat pelanggan otomatis dengan AI yang paham data bisnis Anda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
      { rel: "icon", href: "/chatbot_wa.png", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('balasin_theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})()`,
          }}
        />
        <HeadContent />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-200">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const googleClientId =
    (import.meta.env["VITE_GOOGLE_CLIENT_ID"] as string | undefined) || "placeholder";

  useEffect(() => {
    let rafId: number | null = null;
    let pendingEvent: PointerEvent | null = null;

    const processBubble = () => {
      if (!pendingEvent) return;

      const e = pendingEvent;
      pendingEvent = null;

      const target = (e.target as HTMLElement)?.closest?.(
        'button, [role="button"], input[type="button"], input[type="submit"], a',
      ) as HTMLElement | null;

      if (!target) return;
      if (
        target.hasAttribute("disabled") ||
        target.getAttribute("aria-disabled") === "true" ||
        target.hasAttribute("data-no-ripple")
      ) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const size = Math.max(rect.width, rect.height) * 2.2;

      let clip = target.querySelector(":scope > .gb-bubble-clip") as HTMLElement;
      if (!clip) {
        const compStyle = window.getComputedStyle(target);
        if (compStyle.position === "static") {
          target.style.position = "relative";
        }
        if (compStyle.overflow !== "hidden") {
          clip = document.createElement("span");
          clip.className = "gb-bubble-clip";
          target.appendChild(clip);
        }
      }

      const bubble = document.createElement("span");
      bubble.className = "gb-bubble";
      bubble.style.left = `${x}px`;
      bubble.style.top = `${y}px`;
      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.addEventListener("animationend", () => {
        bubble.remove();
      });

      if (clip) {
        clip.appendChild(bubble);
      } else {
        target.appendChild(bubble);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      pendingEvent = e;
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(processBubble);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster position="top-center" richColors />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
