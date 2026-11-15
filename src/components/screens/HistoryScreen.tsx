"use client";

import Link from "next/link";
import { ArrowRight, FileText, MessageSquareText, RotateCcw } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudoraStore } from "@/lib/store";

function formatTimestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function HistoryScreen() {
  const materials = useStudoraStore((state) => state.materials);
  const quizzes = useStudoraStore((state) => state.quizzes);
  const drafts = useStudoraStore((state) => state.studyDrafts);
  const assistantThreads = useStudoraStore((state) => state.assistantThreads);
  const attempts = useStudoraStore((state) => state.quizAttempts);
  const sessions = useStudoraStore((state) => state.studySessions);
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const sortedDrafts = [...drafts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const sortedAssistantThreads = [...assistantThreads].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const sortedAttempts = [...attempts].sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  return (
    <main className="page-content">
      <PageHeading title="Riwayat Belajar" description="Percakapan, draf, kuis, dan sesi yang tersimpan di perangkat ini." />
      <section className="stack chat-history-section" aria-labelledby="chat-history-heading">
        <div className="section-heading"><div><h2 id="chat-history-heading">Percakapan AI</h2><p>{assistantThreads.length} percakapan di Asisten AI</p></div><Badge tone="blue">{assistantThreads.length}</Badge></div>
        {sortedAssistantThreads.length ? <Card className="history-list">
          {sortedAssistantThreads.map((thread) => <button type="button" className="history-row history-entry chat-history-entry" key={thread.id} onClick={() => window.dispatchEvent(new CustomEvent("studora-open-assistant-thread", { detail: { threadId: thread.id } }))}>
            <span className="agent-icon history-entry-icon"><MessageSquareText size={16} aria-hidden="true" /></span>
            <span className="list-main"><strong>{thread.title}</strong><span>{thread.context?.materials.length ? `${thread.context.materials.length} materi · ` : ""}{thread.messages.length} pesan · {formatTimestamp(thread.updatedAt)}</span></span>
            <Badge>{thread.source === "legacy" ? "Sesi lama · prototipe" : "Lokal"}</Badge><span className="text-link">Buka di Asisten AI<ArrowRight size={14} aria-hidden="true" /></span>
          </button>)}
        </Card> : <div className="empty-panel"><EmptyState title="Belum ada percakapan" description="Sesi yang dijalankan dari Ruang Kerja AI akan otomatis muncul di sini." /><Link href="/workspace-ai" className="button button-primary">Mulai sesi belajar</Link></div>}
      </section>
      <div className="history-columns">
        <section className="stack" aria-labelledby="draft-history-heading">
          <div className="section-heading"><div><h2 id="draft-history-heading">Draf belajar</h2><p>{drafts.length} draf tersimpan secara lokal</p></div><Badge tone="blue">{drafts.length}</Badge></div>
          {sortedDrafts.length ? <Card className="history-list">
            {sortedDrafts.map((draft) => {
              const material = materials.find((item) => item.id === draft.materialId);
              const goalLabel = draft.goal === "practice" ? "Latihan soal" : draft.goal === "schedule" ? "Jadwal revisi" : "Pahami konsep kunci";
              const nextHref = draft.goal === "schedule" ? "/perencana-belajar" : draft.goal === "practice" ? "/kuis-latihan" : "/catatan-ringkasan";
              const nextLabel = draft.goal === "schedule" ? "Atur sesi" : draft.goal === "practice" ? "Lihat kuis" : "Tulis catatan";
              return <article className="history-row history-entry" key={draft.id}>
                <span className="agent-icon history-entry-icon"><FileText size={16} aria-hidden="true" /></span>
                <div className="list-main"><strong>{material?.name ?? "Materi tidak tersedia"}</strong><span>{goalLabel} · disimpan {formatTimestamp(draft.createdAt)}</span></div>
                <Link href={`/workspace-ai?draft=${encodeURIComponent(draft.id)}`} className="text-link">Lanjutkan draf<ArrowRight size={14} aria-hidden="true" /></Link>
                <Link href={nextHref} className="text-link">{nextLabel}</Link>
              </article>;
            })}
          </Card> : <div className="empty-panel"><EmptyState title="Belum ada draf tersimpan" description="Draf lama yang belum dijalankan akan tetap tersimpan di sini." /><Link href="/workspace-ai" className="button button-primary">Buka Ruang Kerja AI</Link></div>}
        </section>

        <section className="stack" aria-labelledby="quiz-history-heading">
          <div className="section-heading"><div><h2 id="quiz-history-heading">Percobaan kuis</h2><p>{attempts.length} percobaan tersimpan secara lokal</p></div><Badge>{attempts.length}</Badge></div>
          {sortedAttempts.length ? <Card className="history-list">
            {sortedAttempts.map((attempt) => {
              const quiz = quizzes.find((item) => item.id === attempt.quizId);
              return <article className="history-row history-entry" key={attempt.id}>
                <span className="agent-icon history-entry-icon"><span aria-hidden="true">{attempt.score}%</span></span>
                <div className="list-main"><strong>{quiz?.title ?? "Kuis tidak tersedia"}</strong><span>{attempt.correctCount} dari {attempt.questionCount} benar · {formatTimestamp(attempt.completedAt)}</span></div>
                <Badge tone={attempt.score >= 75 ? "green" : "amber"}>{attempt.score}%</Badge>
                {quiz ? <Link href={`/kuis-latihan?quiz=${encodeURIComponent(quiz.id)}`} className="text-link" aria-label={`Ulangi ${quiz.title}`}><RotateCcw size={14} aria-hidden="true" /> Ulangi</Link> : null}
              </article>;
            })}
          </Card> : <div className="empty-panel"><EmptyState title="Belum ada percobaan kuis" description="Hasil kuis akan muncul setelah Anda mengirim jawaban." /><Link href="/kuis-latihan" className="button button-secondary">Buka kuis</Link></div>}
        </section>
      </div>
      <section className="stack" aria-labelledby="session-history-heading"><div className="section-heading"><div><h2 id="session-history-heading">Sesi selesai</h2><p>Kegiatan yang Anda tandai selesai.</p></div><Badge tone="green">{completedIds.filter((id) => sessions.some((session) => session.id === id)).length}</Badge></div>
        {completedIds.some((id) => sessions.some((session) => session.id === id)) ? <Card className="history-list">{sessions.filter((session) => completedIds.includes(session.id)).map((session) => <article className="history-row history-entry" key={session.id}><span className="agent-icon history-entry-icon"><FileText size={16} aria-hidden="true" /></span><div className="list-main"><strong>{session.title}</strong><span>{session.detail} · {session.durationMinutes} menit</span></div><Link className="text-link" href="/perencana-belajar">Buka rencana<ArrowRight size={14} aria-hidden="true" /></Link></article>)}</Card> : <div className="empty-panel"><EmptyState title="Belum ada sesi selesai" description="Sesi yang Anda tandai selesai akan muncul di sini." /></div>}
      </section>
      <div className="history-primary-action"><Link className="button button-primary" href="/workspace-ai">Mulai sesi belajar<ArrowRight size={15} aria-hidden="true" /></Link></div>
    </main>
  );
}
