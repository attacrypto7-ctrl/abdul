import React, { useEffect, useRef, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "balasin_theme";
const OVERLAY_CLASS = "theme-toggle-overlay";
const OVERLAY_ANIMATION = "theme-toggle-fallback-reveal";
const DEFAULT_REVEAL_DURATION = 320;
const DEFAULT_OVERLAY_DURATION = 600;
const LANDING_REVEAL_DURATION = 500;
const LANDING_OVERLAY_DURATION = 600;

type Variant = "default" | "landing";

type ViewTransitionLike = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => ViewTransitionLike;
};

const THEME_TOGGLE_STYLES = `
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
}
::view-transition-old(root) {
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 2;
  animation: theme-toggle-vt-reveal var(--theme-toggle-vt-duration, ${DEFAULT_REVEAL_DURATION}ms) ease-in-out;
}
@keyframes theme-toggle-vt-reveal {
  from {
    clip-path: circle(0% at var(--theme-toggle-x, 50%) var(--theme-toggle-y, 50%));
  }
  to {
    clip-path: circle(var(--theme-toggle-radius, 150%) at var(--theme-toggle-x, 50%) var(--theme-toggle-y, 50%));
  }
}
.theme-toggle-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2147483000;
  background: var(--background);
  clip-path: circle(0px at var(--theme-toggle-x, 50%) var(--theme-toggle-y, 50%));
  animation: theme-toggle-fallback-reveal var(--theme-toggle-fb-duration, ${DEFAULT_REVEAL_DURATION}ms) ease-in-out forwards;
}
@keyframes theme-toggle-fallback-reveal {
  from {
    clip-path: circle(0px at var(--theme-toggle-x, 50%) var(--theme-toggle-y, 50%));
  }
  to {
    clip-path: circle(var(--theme-toggle-radius, 150vmax) at var(--theme-toggle-x, 50%) var(--theme-toggle-y, 50%));
  }
}
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none !important;
  }
  .theme-toggle-overlay {
    animation: none !important;
  }
}
`;

let stylesInjected = false;

function ensureStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const style = document.createElement("style");
  style.setAttribute("data-theme-toggle-styles", "");
  style.textContent = THEME_TOGGLE_STYLES;
  document.head.appendChild(style);
  stylesInjected = true;
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function applyTheme(isDark: boolean): void {
  document.documentElement.classList.toggle("dark", isDark);
  try {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export function ThemeToggle({ variant = "default" }: { variant?: Variant } = {}) {
  const isLanding = variant === "landing";

  // Inisialisasi state secara sinkron langsung dari DOM & localStorage saat render pertama
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return (
        document.documentElement.classList.contains("dark") ||
        localStorage.getItem(STORAGE_KEY) === "dark"
      );
    }
    return false;
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isTransitioningRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  // Mouse press is handled on pointerdown for instant response; the trailing
  // click must be swallowed so one interaction never toggles twice.
  const suppressClickRef = useRef(false);

  useEffect(() => {
    ensureStyles();
    return () => {
      isTransitioningRef.current = false;
      cleanupRef.current?.();
    };
  }, []);

  const resolveOrigin = (clientX?: number, clientY?: number) => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let x = viewportWidth / 2;
    let y = viewportHeight / 2;

    if (
      typeof clientX === "number" &&
      typeof clientY === "number" &&
      (clientX !== 0 || clientY !== 0)
    ) {
      x = clientX;
      y = clientY;
    } else if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }

    // Radius hingga sudut viewport terjauh agar seluruh layar terjangkau
    const radius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));

    return { x, y, radius };
  };

  const runOverlayReveal = (x: number, y: number, radius: number, duration: number) => {
    const overlay = document.createElement("div");
    overlay.setAttribute("aria-hidden", "true");
    overlay.className = OVERLAY_CLASS;
    overlay.style.setProperty("--theme-toggle-x", `${x}px`);
    overlay.style.setProperty("--theme-toggle-y", `${y}px`);
    overlay.style.setProperty("--theme-toggle-radius", `${radius}px`);
    overlay.style.setProperty("--theme-toggle-fb-duration", `${duration}ms`);

    overlayRef.current = overlay;
    isTransitioningRef.current = true;

    let timeoutId = 0;
    let settled = false;

    const cleanup = () => {
      try {
        overlay.remove();
      } catch {
        // ignore
      }
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      overlay.removeEventListener("animationend", onAnimationEnd);
      overlayRef.current = null;
      isTransitioningRef.current = false;
      if (cleanupRef.current === cleanup) cleanupRef.current = null;
    };

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.animationName !== OVERLAY_ANIMATION) return;
      cleanup();
    };

    overlay.addEventListener("animationend", onAnimationEnd);
    document.body.appendChild(overlay);
    cleanupRef.current = cleanup;
    timeoutId = window.setTimeout(cleanup, duration + 100);
  };

  const toggleTheme = (clientX?: number, clientY?: number) => {
    if (typeof window === "undefined") return;
    if (isTransitioningRef.current) return;

    const currentDark = isLanding
      ? document.documentElement.classList.contains("dark")
      : isDark;
    const nextDark = !currentDark;
    const { x, y, radius } = resolveOrigin(clientX, clientY);
    const revealDuration = isLanding ? LANDING_REVEAL_DURATION : DEFAULT_REVEAL_DURATION;
    const overlayDuration = isLanding ? LANDING_OVERLAY_DURATION : DEFAULT_OVERLAY_DURATION;

    // Hormati prefers-reduced-motion: terapkan langsung tanpa overlay/animasi
    if (prefersReducedMotion()) {
      setIsDark(nextDark);
      applyTheme(nextDark);
      return;
    }

    const doc = document as DocumentWithViewTransition;

    if (typeof doc.startViewTransition === "function") {
      const root = document.documentElement;
      const reset = () => {
        isTransitioningRef.current = false;
        try {
          root.style.removeProperty("--theme-toggle-vt-duration");
          root.style.removeProperty("--theme-toggle-x");
          root.style.removeProperty("--theme-toggle-y");
          root.style.removeProperty("--theme-toggle-radius");
        } catch {
          // ignore
        }
      };
      try {
        isTransitioningRef.current = true;
        root.style.setProperty("--theme-toggle-x", `${x}px`);
        root.style.setProperty("--theme-toggle-y", `${y}px`);
        root.style.setProperty("--theme-toggle-radius", `${radius}px`);
        root.style.setProperty("--theme-toggle-vt-duration", `${revealDuration}ms`);

        if (isLanding) {
          // For landing: start VT first to minimize snapshot delay; drive icon via CSS, update aria-label.
          const transition = doc.startViewTransition(() => {
            applyTheme(nextDark);
            setIsDark(nextDark);
            if (buttonRef.current) {
              buttonRef.current.setAttribute(
                "aria-label",
                nextDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap",
              );
            }
          });
          if (transition && typeof transition.finished?.then === "function") {
            transition.finished.finally(reset).catch(reset);
          } else {
            reset();
          }
          window.setTimeout(() => {
            if (isTransitioningRef.current) reset();
          }, revealDuration + 120);
          return;
        }

        // Default: preserve existing behavior (set state before VT)
        setIsDark(nextDark);
        const transition = doc.startViewTransition(() => {
          applyTheme(nextDark);
        });
        if (transition && typeof transition.finished?.then === "function") {
          transition.finished.finally(reset).catch(reset);
        } else {
          reset();
        }
        // Safety timeout: ensure guard never sticks
        window.setTimeout(() => {
          if (isTransitioningRef.current) reset();
        }, revealDuration + 120);
        return;
      } catch (err) {
        // If VT fails unexpectedly, reset guard and fallback to safe path
        reset();
        // fall through to fallback below
      }
    }

    // Fallback aman: terapkan tema lalu reveal melingkar dari titik klik.
    isTransitioningRef.current = false;
    setIsDark(nextDark);
    applyTheme(nextDark);
    if (buttonRef.current) {
      buttonRef.current.setAttribute(
        "aria-label",
        nextDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap",
      );
    }
    runOverlayReveal(x, y, radius, overlayDuration);
  };

  // Start the theme change on pointerdown (mouse) so the visual response begins
  // on press instead of release. Keyboard activation still arrives via click.
  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === "mouse" && event.button === 0) {
      suppressClickRef.current = true;
      toggleTheme(event.clientX, event.clientY);
      return;
    }
    // Non-mouse pointer: clear any stale suppression; handled on the click.
    suppressClickRef.current = false;
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    // A click generated by our own mouse press carries detail > 0 and is
    // swallowed. Keyboard (Enter/Space) and programmatic activations arrive
    // with detail === 0, so they always go through even if a flag is stale.
    if (suppressClickRef.current && event.detail > 0) {
      suppressClickRef.current = false;
      return;
    }
    suppressClickRef.current = false;
    toggleTheme(event.clientX, event.clientY);
  };

  return (
    <button
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      type="button"
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors duration-200"
    >
      {isLanding ? (
        <>
          <Sun className="lucide lucide-sun w-5 h-5 hidden dark:block" />
          <Moon className="lucide lucide-moon w-5 h-5 dark:hidden" />
        </>
      ) : isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}