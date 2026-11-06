"use client";

import Link from "next/link";
import { BookOpenText, CircleCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { studySessions } from "@/lib/mock-data";
import { formatDuration, formatTimeRange } from "@/lib/dates";
import { useStudoraStore } from "@/lib/store";

export function StudyPlanCard() {
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const todaySessions = studySessions.filter((session) => session.dayOffset === 0);
  return (
    <Card>
      <div className="card-head"><h2 className="card-title">Rencana belajar hari ini</h2><Link className="text-link" href="/perencana-belajar">Buka rencana</Link></div>
      <div className="stack compact list-spaced">
        {todaySessions.map((session) => {
          const isComplete = completedIds.includes(session.id);
          const href = session.type === "Kuis"
            ? "/kuis-latihan?quiz=" + encodeURIComponent(session.contentId) + "&session=" + encodeURIComponent(session.id)
            : "/catatan-ringkasan?note=" + encodeURIComponent(session.contentId) + "&session=" + encodeURIComponent(session.id);
          return <Link className="list-row" href={href} key={session.id}>
            <span className={"status-icon " + (isComplete ? "is-green" : "is-blue")}>{isComplete ? <CircleCheck size={16} aria-hidden="true" /> : <BookOpenText size={15} aria-hidden="true" />}</span>
            <span className="list-main"><strong>{session.title}</strong><span>{formatTimeRange(session.startTime, session.durationMinutes)} · {formatDuration(session.durationMinutes)}</span></span>
            <Badge tone={isComplete ? "green" : "blue"}>{isComplete ? "Selesai" : "Rencana"}</Badge>
          </Link>;
        })}
      </div>
    </Card>
  );
}
