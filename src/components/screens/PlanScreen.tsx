"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, Check, CircleCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAILY_STUDY_LIMIT_MINUTES } from "@/lib/mock-data";
import { useStudoraStore } from "@/lib/store";
import { dateAfterDays, formatDate, formatDuration, formatTimeRange } from "@/lib/dates";
import type { StudySession } from "@/lib/types";

function sessionDate(session: StudySession) {
  return session.date ?? dateAfterDays(session.dayOffset);
}

export function PlanScreen() {
  const searchParams = useSearchParams();
  const requestedDay = searchParams.get("day");
  const sessions = useStudoraStore((state) => state.studySessions);
  const notes = useStudoraStore((state) => state.notes);
  const quizzes = useStudoraStore((state) => state.quizzes);
  const approved = useStudoraStore((state) => state.studyPlanApproved);
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const addSession = useStudoraStore((state) => state.addStudySession);
  const updateSession = useStudoraStore((state) => state.updateStudySession);
  const removeSession = useStudoraStore((state) => state.removeStudySession);
  const completeSession = useStudoraStore((state) => state.completeStudySession);
  const setApproved = useStudoraStore((state) => state.setStudyPlanApproved);
  const days = useMemo(() => [...new Set([...Array.from({ length: 7 }, (_, index) => dateAfterDays(index)), ...sessions.map(sessionDate)])].sort(), [sessions]);
  const [day, setDay] = useState(dateAfterDays(0));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [date, setDate] = useState(dateAfterDays(0));
  const [startTime, setStartTime] = useState("09:00");
  const [duration, setDuration] = useState(30);
  const [type, setType] = useState<StudySession["type"]>("Revisi");
  const [contentId, setContentId] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (requestedDay === null) return;
    const index = Number(requestedDay);
    if (Number.isInteger(index) && index >= 0 && index < days.length) setDay(days[index]);
  }, [requestedDay, days]);

  const visible = sessions.filter((session) => sessionDate(session) === day).sort((a, b) => a.startTime.localeCompare(b.startTime));
  const totalMinutes = sessions.reduce((total, session) => total + session.durationMinutes, 0);
  const overloaded = days.filter((value) => sessions.filter((session) => sessionDate(session) === value).reduce((total, session) => total + session.durationMinutes, 0) > DAILY_STUDY_LIMIT_MINUTES);
  const contentOptions = type === "Kuis" ? quizzes.map((item) => ({ id: item.id, title: item.title })) : notes.map((item) => ({ id: item.id, title: item.title }));

  function resetForm() {
    setEditingId(null); setShowForm(false); setTitle(""); setDetail(""); setContentId("");
  }
  function edit(session: StudySession) {
    setEditingId(session.id); setShowForm(true); setTitle(session.title); setDetail(session.detail);
    setDate(sessionDate(session)); setStartTime(session.startTime); setDuration(session.durationMinutes);
    setType(session.type); setContentId(session.contentId);
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !date || duration < 5 || duration > 240) return;
    const payload = { title: title.trim(), detail: detail.trim() || "Belajar mandiri", date, dayOffset: 0,
      startTime, durationMinutes: duration, type, contentId };
    if (editingId) updateSession(editingId, payload);
    else addSession({ id: `session-local-${crypto.randomUUID()}`, ...payload, origin: "local" });
    setDay(date); setNotice(editingId ? "Sesi diperbarui." : "Sesi ditambahkan."); resetForm();
  }

  return <main className="page-content">
    <PageHeading title="Perencana Belajar" description="Susun sesi belajar yang sesuai dengan waktu Anda." aside={<Badge tone={approved ? "green" : "blue"}>{approved ? "Rencana disetujui" : "Rencana lokal"}</Badge>} />
    <div className="page-toolbar"><Button onClick={() => { resetForm(); setDate(day); setShowForm(true); }}><Plus size={15} />Tambah sesi</Button></div>
    {showForm ? <Card className="plan-form-card"><h2 className="card-title">{editingId ? "Ubah sesi" : "Sesi baru"}</h2><form onSubmit={save} className="plan-form">
      <label className="field-label">Judul<Input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={120} /></label>
      <label className="field-label">Mata kuliah atau keterangan<Input value={detail} onChange={(event) => setDetail(event.target.value)} maxLength={80} /></label>
      <label className="field-label">Tanggal<Input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /></label>
      <label className="field-label">Mulai<Input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} required /></label>
      <label className="field-label">Durasi (menit)<Input type="number" min={5} max={240} value={duration} onChange={(event) => setDuration(Number(event.target.value))} required /></label>
      <label className="field-label">Jenis<select className="input" value={type} onChange={(event) => { setType(event.target.value as StudySession["type"]); setContentId(""); }}><option>Revisi</option><option>Kuis</option></select></label>
      <label className="field-label plan-form-wide">Konten terkait (opsional)<select className="input" value={contentId} onChange={(event) => setContentId(event.target.value)}><option value="">Tanpa tautan konten</option>{contentOptions.map((item) => <option value={item.id} key={item.id}>{item.title}</option>)}</select></label>
      <div className="plan-form-actions"><Button type="submit">Simpan sesi</Button><Button type="button" variant="secondary" onClick={resetForm}>Batal</Button></div>
    </form></Card> : null}
    {notice ? <p className="notice notice-green" role="status">{notice}</p> : null}
    <div className="content-aside-grid"><div className="stack">
      <Card className="week-strip" aria-label="Pilih hari rencana belajar">{days.map((value) => {
        const daySessions = sessions.filter((session) => sessionDate(session) === value);
        const done = daySessions.length > 0 && daySessions.every((session) => completedIds.includes(session.id));
        return <button type="button" aria-pressed={day === value} className={day === value ? "day-cell is-active" : "day-cell"} key={value} onClick={() => setDay(value)}><span>{formatDate(value, { weekday: "short" })}</span><strong>{formatDate(value, { day: "numeric" })}</strong><small>{done ? "Selesai" : `${daySessions.length} sesi`}</small></button>;
      })}</Card>
      <div className="day-caption">{formatDate(day, { weekday: "long", day: "numeric", month: "long" })}<span className="muted">{visible.length} sesi · {formatDuration(visible.reduce((total, session) => total + session.durationMinutes, 0))}</span></div>
      {visible.map((session) => {
        const isComplete = completedIds.includes(session.id);
        const hasContent = session.type === "Kuis" ? quizzes.some((item) => item.id === session.contentId) : notes.some((item) => item.id === session.contentId);
        const href = session.type === "Kuis" ? `/kuis-latihan?quiz=${encodeURIComponent(session.contentId)}&session=${encodeURIComponent(session.id)}` : `/catatan-ringkasan?note=${encodeURIComponent(session.contentId)}&session=${encodeURIComponent(session.id)}`;
        return <Card className={isComplete ? "session-row is-session-complete" : "session-row"} key={session.id}>
          <span className="session-time">{formatTimeRange(session.startTime, session.durationMinutes)}</span>
          <div className="list-main"><strong>{session.title}</strong><span>{session.detail} · {formatDuration(session.durationMinutes)}</span></div>
          <Badge tone={session.type === "Kuis" ? "amber" : "blue"}>{session.type}</Badge>
          {isComplete ? <Badge tone="green"><CircleCheck size={12} aria-hidden="true" />Selesai</Badge> : null}
          <div className="session-row-actions">
            {hasContent ? <Link className="text-link" href={href}>{session.type === "Kuis" ? "Buka kuis" : "Buka catatan"}</Link> : null}
            {!isComplete ? <button type="button" className="text-link" onClick={() => completeSession(session.id)}><Check size={13} />Selesai</button> : null}
            <button type="button" className="text-link" onClick={() => edit(session)} aria-label={`Ubah ${session.title}`}><Pencil size={13} />Ubah</button>
            <button type="button" className="text-link" onClick={() => { if (window.confirm(`Hapus sesi ${session.title}?`)) removeSession(session.id); }} aria-label={`Hapus ${session.title}`}><Trash2 size={13} />Hapus</button>
          </div>
        </Card>;
      })}
      {visible.length === 0 ? <Card className="empty-copy">Belum ada sesi pada hari ini. Tambahkan satu sesi untuk mulai menyusun rencana.</Card> : null}
    </div><aside className="stack">
      <Card><h2 className="card-title">Ringkasan rencana</h2><dl className="summary-list"><div><dt>Sesi</dt><dd>{sessions.length}</dd></div><div><dt>Selesai</dt><dd>{completedIds.filter((id) => sessions.some((session) => session.id === id)).length}</dd></div><div><dt>Total waktu</dt><dd>{formatDuration(totalMinutes)}</dd></div><div><dt>Batas harian</dt><dd>{formatDuration(DAILY_STUDY_LIMIT_MINUTES)}</dd></div></dl></Card>
      {overloaded.length ? <div className="notice notice-amber">{overloaded.length} hari melampaui batas harian.</div> : null}
      <Button className="full-width" onClick={() => setApproved(true)} disabled={approved || sessions.length === 0}><Check size={15} />{approved ? "Rencana disetujui" : "Setujui rencana"}</Button>
      <p className="muted">Rencana tersimpan di browser dan belum tersinkron ke kalender.</p>
    </aside></div>
  </main>;
}
