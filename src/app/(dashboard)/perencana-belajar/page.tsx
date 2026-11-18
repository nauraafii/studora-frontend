import type { Metadata } from "next";
import { Suspense } from "react";
import { PlanScreen } from "@/components/screens/PlanScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat rencana…</div>}><PlanScreen /></Suspense>; }

export const metadata: Metadata = { title: "Perencana Belajar" };
