import { Suspense } from "react";
import { PlanScreen } from "@/components/screens/PlanScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat rencana…</div>}><PlanScreen /></Suspense>; }
