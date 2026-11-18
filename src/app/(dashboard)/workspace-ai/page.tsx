import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkspaceScreen } from "@/components/screens/WorkspaceScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat ruang kerja…</div>}><WorkspaceScreen /></Suspense>; }

export const metadata: Metadata = { title: "Ruang Kerja AI" };
