import type { Metadata } from "next";
import { Suspense } from "react";
import { NotesScreen } from "@/components/screens/NotesScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat catatan…</div>}><NotesScreen /></Suspense>; }

export const metadata: Metadata = { title: "Catatan & Ringkasan" };
