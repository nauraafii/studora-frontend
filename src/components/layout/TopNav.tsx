"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BookOpenText, CircleHelp, Menu, Search, Settings2 } from "lucide-react";
import { searchStudora } from "@/lib/search";
import { useStudoraStore } from "@/lib/store";

const titles: Record<string, string> = {
  "/": "Dasbor",
  "/pustaka-materi": "Pustaka Materi",
  "/catatan-ringkasan": "Catatan & Ringkasan",
  "/workspace-ai": "Ruang Kerja AI",
  "/agent-ai": "Agen AI",
  "/riwayat": "Riwayat",
  "/perencana-belajar": "Perencana Belajar",
  "/tugas-tenggat": "Tugas & Tenggat",
  "/kuis-latihan": "Kuis & Latihan",
  "/bantuan": "Bantuan & Dukungan",
  "/pengaturan": "Pengaturan",
  "/notifikasi": "Notifikasi",
};

export function TopNav({ mobileSidebarOpen, onToggleMobileSidebar }: {
  mobileSidebarOpen: boolean;
  onToggleMobileSidebar: () => void;
}) {
  const pathname = usePathname();
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
      setFocused(false);
      setMobileSearchOpen(false);
    }
  }

  function toggleMobileSearch() {
    if (mobileSearchOpen) {
      setMobileSearchOpen(false);
      setFocused(false);
      return;
    }
    setMobileSearchOpen(true);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function closeSearch() {
    setFocused(false);
    setMobileSearchOpen(false);
  }

  return (
    <header className="topbar">
      <button
        type="button"
        className="mobile-sidebar-toggle icon-button"
        ref={mobileMenuRef}
        aria-label={mobileSidebarOpen ? "Tutup navigasi" : "Buka navigasi"}
        aria-expanded={mobileSidebarOpen}
        aria-controls="primary-navigation"
        onClick={onToggleMobileSidebar}
      ><Menu size={18} aria-hidden="true" /></button>
      <strong className="topbar-title">{titles[pathname] ?? "Studora"}</strong>
      <div className={`topbar-search-container${mobileSearchOpen ? " is-mobile-open" : ""}`}>
        <form className="topbar-search" role="search" onSubmit={submitSearch}>
          <Search size={15} aria-hidden="true" />
          <input
            ref={inputRef}
            id="global-search-input"
            aria-label="Cari materi, catatan, dan kuis"
            aria-expanded={showResults}
            aria-controls="global-search-results"
            autoComplete="off"
            placeholder="Cari materi, catatan, kuis..."
            value={query}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape") closeSearch(); }}
          />
        </form>
        {showResults ? <div id="global-search-results" className="search-popover" aria-label="Hasil pencarian">
          {results.length ? results.map((result) => <Link className="search-result" href={result.href} key={`${result.category}-${result.title}`} onClick={closeSearch}>
            <span className="search-result-main"><strong>{result.title}</strong><small>{result.description}</small></span>
            <span className="search-result-category">{result.category}</span>
          </Link>) : <p className="search-empty">Tidak ada materi, catatan, atau kuis yang cocok.</p>}
          {results.length ? <p className="search-hint">Tekan Enter untuk membuka hasil pertama</p> : null}
        </div> : null}
      </div>
      <div className="topbar-actions">
        <Link className="icon-button" href="/pengaturan" aria-label="Pengaturan"><Settings2 size={17} /></Link>
        <Link className="icon-button" href="/notifikasi" aria-label="Notifikasi"><Bell size={16} /></Link>
        <Link className="icon-button" href="/bantuan" aria-label="Bantuan"><CircleHelp size={16} /></Link>
        <Link className="user-avatar" href="/pengaturan#akun" aria-label="Ruang belajar lokal, buka pengaturan akun" title="Ruang belajar lokal">L</Link>
      </div>
      <button type="button" className="mobile-search-toggle icon-button" aria-label={mobileSearchOpen ? "Tutup pencarian" : "Buka pencarian"} aria-expanded={mobileSearchOpen} aria-controls="global-search-input" onClick={toggleMobileSearch}><Search size={16} aria-hidden="true" /></button>
      <Link href="/" className="mobile-brand" aria-label="Studora — AI Study Partner">
        <span className="brand-mark"><BookOpenText size={18} strokeWidth={2} /></span>
        <span className="brand-lockup"><strong>Studora</strong><small>AI Study Partner</small></span>
      </Link>
    </header>
  );
}
