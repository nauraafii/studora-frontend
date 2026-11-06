import { Suspense } from "react";
import { QuizScreen } from "@/components/screens/QuizScreen";
export default function Page() { return <Suspense fallback={<div className="page-content">Memuat kuis…</div>}><QuizScreen /></Suspense>; }
