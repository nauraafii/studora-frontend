import { Suspense } from "react";
import { TasksScreen } from "@/components/screens/TasksScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat tugas…</div>}><TasksScreen /></Suspense>; }
