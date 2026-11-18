import type { Metadata } from "next";
import { Suspense } from "react";
import { QuizScreen } from "@/components/screens/QuizScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat kuis…</div>}><QuizScreen /></Suspense>; }

export const metadata: Metadata = { title: "Kuis & Latihan" };
