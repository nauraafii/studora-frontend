import { Suspense } from "react";
import { NotesScreen } from "@/components/screens/NotesScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat catatan…</div>}><NotesScreen /></Suspense>; }
