import { Suspense } from "react";
import { MaterialsScreen } from "@/components/screens/MaterialsScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat pustaka…</div>}><MaterialsScreen /></Suspense>; }
