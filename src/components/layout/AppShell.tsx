"use client";

import { useEffect, useState, type ReactNode } from "react";
import { TopNav } from "@/components/layout/TopNav";
import { AnimatedContent } from "@/components/layout/AnimatedContent";
import { useStudoraStore } from "@/lib/store";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

type StorageStatus = "loading" | "ready" | "error";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("loading");
  const [hydrationRetry, setHydrationRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let storageFailed = false;
    const reportError = () => {
      storageFailed = true;
      if (!cancelled) setStorageStatus("error");
    };
    window.addEventListener("studora-storage-error", reportError);

    const persistence = useStudoraStore.persist;
    if (!persistence) {
      reportError();
      return () => window.removeEventListener("studora-storage-error", reportError);
    }

    const hydrate = async () => {
      try {
        await Promise.resolve(persistence.rehydrate());
        if (storageFailed) return;
        useStudoraStore.getState().migrateLegacyStudyChats();
        if (!cancelled) setStorageStatus("ready");
      } catch {
        reportError();
      }
    };
    void hydrate();

    return () => {
      cancelled = true;
      window.removeEventListener("studora-storage-error", reportError);
    };
  }, [hydrationRetry]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleDrawerKeys = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const drawer = document.querySelector<HTMLElement>(".sidebar.is-open");
      const focusable = drawer?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !drawer?.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !drawer?.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleDrawerKeys);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleDrawerKeys);
    };
  }, [mobileSidebarOpen]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
      <div className="dashboard-frame">
        <TopNav
          mobileSidebarOpen={mobileSidebarOpen}
          onToggleMobileSidebar={() => setMobileSidebarOpen((open) => !open)}
          dataReady={storageStatus === "ready"}
        />
        <AnimatedContent>
          <div id="main-content" tabIndex={-1}>
            {storageStatus === "ready" ? children : storageStatus === "error" ? (
              <main className="page-content storage-fallback">
                <section data-testid="storage-error-state" className="storage-fallback-card" role="alert">
                  <h1>Data lokal tidak dapat dibuka</h1>
                  <p>Studora tidak dapat membaca penyimpanan browser, jadi data Anda belum ditampilkan. Periksa izin penyimpanan, lalu coba lagi.</p>
                  <button className="button button-primary" type="button" onClick={() => {
                    setStorageStatus("loading");
                    setHydrationRetry((attempt) => attempt + 1);
                  }}>Coba lagi</button>
                </section>
              </main>
            ) : (
              <main className="page-content app-loading-state" data-testid="app-loading-state" role="status" aria-live="polite" aria-busy="true">
                <div className="app-loading-skeleton" aria-hidden="true"><span /><span /><span /></div>
                <p>Memuat data belajar yang tersimpan di perangkat…</p>
              </main>
            )}
          </div>
        </AnimatedContent>
      </div>
      {storageStatus === "ready" ? <AssistantPanel /> : null}
    </div>
  );
}
