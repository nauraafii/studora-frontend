"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BookOpenText,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  FileText,
  History,
  HelpCircle,
  LayoutDashboard,
  MoreHorizontal,
  NotebookPen,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const directItems = [
  { href: "/", label: "Dasbor", icon: LayoutDashboard },
  { href: "/pustaka-materi", label: "Materi", icon: BookOpenText },
  { href: "/perencana-belajar", label: "Rencana", icon: CalendarDays },
  { href: "/tugas-tenggat", label: "Tugas", icon: CheckSquare },
  { href: "/kuis-latihan", label: "Kuis", icon: NotebookPen },
  { href: "/workspace-ai", label: "AI", accessibleLabel: "Ruang Kerja AI", icon: Sparkles },
];

const moreItems = [
  { href: "/catatan-ringkasan", label: "Catatan & Ringkasan", icon: FileText },
  { href: "/agent-ai", label: "Agen AI", icon: Bot },
  { href: "/riwayat", label: "Riwayat", icon: History },
  { href: "/bantuan", label: "Bantuan", icon: HelpCircle },
  { href: "/pengaturan", label: "Pengaturan", icon: Settings },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (mobileOpen) navRef.current?.querySelector<HTMLAnchorElement>("a")?.focus();
  }, [mobileOpen]);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function closeNavigation() {
    onClose();
  }

  const moreIsActive = moreItems.some(({ href }) => isActive(href));

  return (
    <nav
      ref={navRef}
      className={`sidebar${mobileOpen ? " is-open" : ""}`}
      id="primary-navigation"
      aria-label="Navigasi utama"
    >
      <div className="nav-primary-links">
        {directItems.map(({ href, label, accessibleLabel, icon: Icon }) => (
          <Link
            className="nav-link nav-direct-link"
            href={href}
            key={href}
            aria-label={accessibleLabel}
            aria-current={isActive(href) ? "page" : undefined}
            onClick={closeNavigation}
          >
            <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className={`nav-link nav-group-trigger${moreIsActive ? " is-active" : ""}`}
              aria-label="Buka navigasi lainnya"
            >
              <MoreHorizontal size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>Lainnya</span>
              <ChevronDown className="nav-group-chevron" size={13} aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="nav-popover">
            {moreItems.map(({ href, label: itemLabel, icon: ItemIcon }) => (
              <DropdownMenuItem key={href} asChild>
                <Link
                  className="nav-link nav-popover-link"
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  onClick={closeNavigation}
                >
                  <ItemIcon size={16} strokeWidth={1.8} aria-hidden="true" />
                  <span>{itemLabel}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
