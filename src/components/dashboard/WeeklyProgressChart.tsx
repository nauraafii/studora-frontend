"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { studySessions } from "@/lib/mock-data";
import { useStudoraStore } from "@/lib/store";

export function WeeklyProgressChart() {
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const completed = completedIds.filter((id) => studySessions.some((session) => session.id === id)).length;
  const progress = studySessions.length ? Math.round((completed / studySessions.length) * 100) : 0;
  return (
    <Card>
      <h2 className="card-title">Kemajuan rencana belajar</h2>
      <p className="muted chart-caption">{completed} dari {studySessions.length} sesi selesai · progres dihitung dari sesi yang Anda tandai selesai.</p>
      <Progress value={progress} />
      <Link className="text-link" href="/perencana-belajar">Lihat rencana 3 hari<ArrowRight size={14} aria-hidden="true" /></Link>
    </Card>
  );
}

export { WeeklyProgressChart as ProgressChart };
