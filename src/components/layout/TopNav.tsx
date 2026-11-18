"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, BookOpenText, Menu, Search, Sparkles, X } from "lucide-react";
import { Sidebar } from "@/components/layout/Sidebar";
import { searchStudora } from "@/lib/search";
import { useStudoraStore } from "@/lib/store";

export function TopNav({ mobileSidebarOpen, onToggleMobileSidebar, dataReady }: {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
  dataReady: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileMenuRef = useRef<HTMLButtonElement>(null);
  const previousSidebarOpen = useRef(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const materials = useStudoraStore((state) => state.materials);
  const notes = useStudoraStore((state) => state.notes);
  const quizzes = useStudoraStore((state) => state.quizzes);
  const results = useMemo(() => searchStudora(query, { materials, notes, quizzes }), [query, materials, notes, quizzes]);
  const showResults = focused && query.trim().length > 0;

  useEffect(() => {
    if (previousSidebarOpen.current && !mobileSidebarOpen) mobileMenuRef.current?.focus();
    previousSidebarOpen.current = mobileSidebarOpen;
  }, [mobileSidebarOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results[0]) {
      router.push(results[0].href);
      closeSearch();
    }
  }

  function toggleMobileSearch() {
    if (mobileSearchOpen) {
      closeSearch();
      return;
    }
    setMobileSearchOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeSearch() {
    setFocused(false);
    setMobileSearchOpen(false);
  }

  return (
    <header className={`topbar${mobileSidebarOpen ? " has-open-menu" : ""}${mobileSearchOpen ? " is-search-open" : ""}`}>
      <Link href="/" className="topbar-brand" aria-label="Studora — AI Study Partner">
        <span className="brand-mark"><BookOpenText size={18} strokeWidth={2} aria-hidden="true" /></span>
        <span className="brand-lockup"><strong>Studora</strong><small>AI Study Partner</small></span>
      </Link>

      <button
        type="button"
        className="mobile-sidebar-toggle icon-button"
        ref={mobileMenuRef}
        aria-label={mobileSidebarOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={mobileSidebarOpen}
        aria-controls="primary-navigation"
        onClick={onToggleMobileSidebar}
      >{mobileSidebarOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}</button>

      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => { if (mobileSidebarOpen) onToggleMobileSidebar(); }} />
      {mobileSidebarOpen ? <button type="button" className="mobile-sidebar-backdrop" aria-label="Tutup navigasi" onClick={onToggleMobileSidebar} /> : null}

      <div className={`topbar-search-container${mobileSearchOpen ? " is-mobile-open" : ""}`}>
        <form className="topbar-search" role="search" onSubmit={submitSearch}>
          <Search size={15} aria-hidden="true" />
          <input
            ref={inputRef}
            id="global-search-input"
            aria-label="Cari materi, catatan, dan kuis"
            autoComplete="off"
            placeholder={dataReady ? "Cari materi, catatan, kuis..." : "Memuat data lokal…"}
            disabled={!dataReady}
            value={query}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape") closeSearch(); }}
          />
        </form>
        {showResults ? <div id="global-search-results" className="search-popover" role="region" aria-label="Hasil pencarian" aria-live="polite">
          {results.length ? results.map((result) => <Link className="search-result" href={result.href} key={`${result.category}-${result.title}`} onClick={closeSearch}>
            <span className="search-result-main"><strong>{result.title}</strong><small>{result.description}</small></span>
            <span className="search-result-category">{result.category}</span>
          </Link>) : <p className="search-empty">Tidak ada materi, catatan, atau kuis yang cocok.</p>}
          {results.length ? <p className="search-hint">Tekan Enter untuk membuka hasil pertama</p> : null}
        </div> : null}
      </div>

      <div className="topbar-actions">
        <button type="button" className="icon-button assistant-nav-button" aria-label="Buka Asisten AI" title="Asisten AI (Ctrl/⌘ + /)" disabled={!dataReady} onClick={() => window.dispatchEvent(new Event("studora-open-assistant"))}><Sparkles size={16} aria-hidden="true" /></button>
        <Link className="icon-button notification-nav-button" href="/notifikasi" aria-label="Notifikasi"><Bell size={16} aria-hidden="true" /></Link>
      </div>
      <button type="button" className="mobile-search-toggle icon-button" aria-label={mobileSearchOpen ? "Tutup pencarian" : "Buka pencarian"} aria-expanded={mobileSearchOpen} aria-controls="global-search-input" onClick={toggleMobileSearch}><Search size={16} aria-hidden="true" /></button>
    </header>
  );
}
