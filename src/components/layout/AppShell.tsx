"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { AnimatedContent } from "@/components/layout/AnimatedContent";
import { useStudoraStore } from "@/lib/store";
import { AssistantPanel } from "@/components/assistant/AssistantPanel";

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [storageError, setStorageError] = useState(false);

  useEffect(() => {
    const reportError = () => setStorageError(true);
    window.addEventListener("studora-storage-error", reportError);
    const persistence = useStudoraStore.persist;
    if (persistence) void Promise.resolve().then(() => persistence.rehydrate()).then(() => useStudoraStore.getState().migrateLegacyStudyChats()).catch(reportError);
    else reportError();
    return () => window.removeEventListener("studora-storage-error", reportError);
  }, []);

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
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      {mobileSidebarOpen ? <button type="button" className="mobile-sidebar-backdrop" aria-label="Tutup navigasi" onClick={() => setMobileSidebarOpen(false)} /> : null}
      <div className="dashboard-frame">
        <TopNav mobileSidebarOpen={mobileSidebarOpen} onToggleMobileSidebar={() => setMobileSidebarOpen((open) => !open)} />
        {storageError ? <div className="notice notice-amber storage-error" role="alert">Data lokal tidak dapat dibuka. Periksa izin penyimpanan browser, lalu muat ulang halaman.</div> : null}
        <AnimatedContent><div id="main-content" tabIndex={-1}>{children}</div></AnimatedContent>
      </div>
      <AssistantPanel />
    </div>
  );
}
