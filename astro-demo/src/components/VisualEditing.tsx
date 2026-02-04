import {
  enableVisualEditing,
  type HistoryAdapterNavigate,
} from "@sanity/visual-editing";
import { useEffect, useRef } from "react";

interface Props {
  enabled: boolean;
}

export function VisualEditing({ enabled }: Props) {
  const navigateRef = useRef<HistoryAdapterNavigate | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const cleanup = enableVisualEditing({
      // Refresh the page when content changes in the Studio
      refresh: async (payload) => {
        // For SSR sites like Astro, reload the page to get fresh data
        if (payload.source === "mutation" || payload.source === "manual") {
          window.location.reload();
        }
      },
      history: {
        subscribe: (navigate) => {
          navigateRef.current = navigate;
          // Broadcast current URL on mount
          navigate({ type: "push", url: window.location.href });

          return () => {
            navigateRef.current = null;
          };
        },
        update: (update) => {
          if (update.type === "push" || update.type === "replace") {
            // Studio is telling us to navigate
            window.location.href = update.url;
          }
        },
      },
    });

    // Intercept link clicks to broadcast navigation BEFORE it happens
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement).closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (!href || link.target === "_blank") return;

      // Only handle internal links
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          // Broadcast to Studio before navigation
          navigateRef.current?.({ type: "push", url: url.href });
        }
      } catch {
        // Invalid URL, ignore
      }
    };

    // Use capture phase to run before default navigation
    document.addEventListener("click", onClick, { capture: true });

    return () => {
      cleanup();
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [enabled]);

  return null;
}
