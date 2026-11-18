import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryScreen } from "@/components/screens/HistoryScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat riwayat…</div>}><HistoryScreen /></Suspense>; }

export const metadata: Metadata = { title: "Riwayat Belajar" };
