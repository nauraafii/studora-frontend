"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenText, Bot, CalendarDays, ClipboardCheck, History,
  ChevronLeft, ChevronRight, LayoutDashboard, NotebookPen, Sparkles, X,
} from "lucide-react";

const groups = [
  { label: "", items: [{ href: "/", label: "Dasbor", icon: LayoutDashboard }] },
  { label: "Materi", items: [
    { href: "/pustaka-materi", label: "Pustaka Materi", icon: BookOpenText },
    { href: "/catatan-ringkasan", label: "Catatan & Ringkasan", icon: NotebookPen },
  ]},
  { label: "Belajar", items: [
    { href: "/perencana-belajar", label: "Perencana Belajar", icon: CalendarDays },
    { href: "/tugas-tenggat", label: "Tugas & Tenggat", icon: ClipboardCheck },
    { href: "/kuis-latihan", label: "Kuis & Latihan", icon: BookOpenText },
  ]},
  { label: "Alat AI", items: [
    { href: "/workspace-ai", label: "Ruang Kerja AI", icon: Sparkles },
    { href: "/agent-ai", label: "Agen AI", icon: Bot },
    { href: "/riwayat", label: "Riwayat", icon: History },
  ]},
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setCollapsed(document.documentElement.dataset.sidebarCollapsed === "true");
  }, []);

  useEffect(() => {
    if (mobileOpen) navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [mobileOpen]);

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);
    document.documentElement.dataset.sidebarCollapsed = String(next);
    try {
      window.localStorage.setItem("studora-sidebar-collapsed", String(next));
    } catch {
      // The sidebar still responds for this session when storage is unavailable.
    }
  }

  return (
    <aside className={mobileOpen ? "sidebar is-open" : "sidebar"}>
      <div className="sidebar-header">
        <Link href="/" className="brand" aria-label="Studora — AI Study Partner" title={collapsed ? "Studora — AI Study Partner" : undefined}>
          <span className="brand-mark"><BookOpenText size={19} strokeWidth={2} /></span>
          <span className="brand-lockup"><strong>Studora</strong><small>AI Study Partner</small></span>
        </Link>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleCollapsed}
          aria-expanded={!collapsed}
          aria-controls="primary-navigation"
          aria-label={collapsed ? "Perlebar navigasi" : "Ciutkan navigasi"}
          title={collapsed ? "Perlebar navigasi" : "Ciutkan navigasi"}
        >
          {collapsed ? <ChevronRight size={17} aria-hidden="true" /> : <ChevronLeft size={17} aria-hidden="true" />}
        </button>
        <button type="button" className="mobile-menu" onClick={onClose} aria-controls="primary-navigation" aria-label="Tutup navigasi"><X size={18} /></button>
      </div>
      <nav ref={navRef} id="primary-navigation" aria-label="Navigasi utama">
        {groups.map((group) => (
          <div className="nav-section" key={group.label || "dashboard"}>
            {group.label ? <div className="nav-label">{group.label}</div> : null}
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link className="nav-link" href={href} key={href} aria-current={active ? "page" : undefined} aria-label={label} data-tooltip={collapsed ? label : undefined} onClick={onClose}>
                  <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span className="nav-link-label">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
