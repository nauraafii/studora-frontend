"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Layers3,
} from "lucide-react";
import { WeeklyProgressChart } from "@/components/dashboard/WeeklyProgressChart";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeading } from "@/components/shared/PageHeading";
import { dateAfterDays, formatDate, formatDuration, formatDueDate, formatTimeRange, getDaysUntil, getTodayISO, resolveTaskDueDate } from "@/lib/dates";
import { useStudoraStore } from "@/lib/store";

function sessionHref(sessionId: string, kind: "Revisi" | "Kuis", contentId: string) {
  if (!contentId) return "/perencana-belajar";
  const route = kind === "Kuis" ? "/kuis-latihan" : "/catatan-ringkasan";
  const key = kind === "Kuis" ? "quiz" : "note";
  return `${route}?${key}=${encodeURIComponent(contentId)}&session=${encodeURIComponent(sessionId)}`;
}

export function DashboardScreen() {
  const materials = useStudoraStore((state) => state.materials);
  const studySessions = useStudoraStore((state) => state.studySessions);
  const samplePackLoaded = useStudoraStore((state) => state.samplePackLoaded);
  const loadSamplePack = useStudoraStore((state) => state.loadSamplePack);
  const tasks = useStudoraStore((state) => state.tasks);
  const sessionTimes = useStudoraStore((state) => state.studySessionTimes);
  const completedSessionIds = useStudoraStore((state) => state.completedStudySessionIds);
  const today = getTodayISO();
  const completedSessions = completedSessionIds.filter((id) => studySessions.some((session) => session.id === id)).length;
  const openTasks = tasks.filter((task) => task.status === "open");
  const nextSession = studySessions
    .filter((session) => !completedSessionIds.includes(session.id))
    .filter((session) => (session.date ?? dateAfterDays(session.dayOffset)) >= today)
    .sort((a, b) =>
      (a.date ?? dateAfterDays(a.dayOffset)).localeCompare(b.date ?? dateAfterDays(b.dayOffset))
      || (sessionTimes[a.id] ?? a.startTime).localeCompare(sessionTimes[b.id] ?? b.startTime),
    )[0];
  const deadlines = openTasks
    .filter((task) => resolveTaskDueDate(task) !== null)
    .sort((a, b) => (resolveTaskDueDate(a) ?? "").localeCompare(resolveTaskDueDate(b) ?? ""))
    .slice(0, 3);
  const recentMaterials = [...materials]
    .sort((a, b) => (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0))
    .slice(0, 3);

  return (
    <main className="page-content dashboard-page">
      <div className="dashboard-welcome">
        <PageHeading title="Ruang belajar Anda" description="Kumpulkan materi, atur rencana, dan lanjutkan belajar dalam satu tempat." />
      </div>

      <section className="dashboard-overview" aria-label="Ringkasan ruang belajar">
        <Link href="/pustaka-materi" aria-label={`${materials.length} materi tersimpan, buka pustaka`}>
          <span className="dashboard-overview-icon"><Layers3 size={20} aria-hidden="true" /></span>
          <span className="dashboard-overview-copy"><span>Materi tersimpan</span><strong>{materials.length}</strong></span>
        </Link>
        <Link href="/tugas-tenggat" aria-label={`${openTasks.length} tugas terbuka, lihat tugas`}>
          <span className="dashboard-overview-icon"><ClipboardCheck size={20} aria-hidden="true" /></span>
          <span className="dashboard-overview-copy"><span>Tugas terbuka</span><strong>{openTasks.length}</strong></span>
        </Link>
        <Link href="/perencana-belajar" aria-label={`${studySessions.length} sesi direncanakan, lihat rencana`}>
          <span className="dashboard-overview-icon"><CalendarDays size={20} aria-hidden="true" /></span>
          <span className="dashboard-overview-copy"><span>Sesi direncanakan</span><strong>{studySessions.length}</strong></span>
        </Link>
        <Link href="/riwayat" aria-label={`${completedSessions} sesi selesai, lihat riwayat`}>
          <span className="dashboard-overview-icon"><CheckCircle2 size={20} aria-hidden="true" /></span>
          <span className="dashboard-overview-copy"><span>Sesi selesai</span><strong>{completedSessions}</strong></span>
        </Link>
      </section>

      <div className="dashboard-primary-grid">
        <WeeklyProgressChart />

        <section className="dashboard-deadline-panel" aria-labelledby="deadlines-title">
          <div className="section-heading">
            <div>
              <h2 id="deadlines-title">Tenggat terdekat</h2>
              <p>Tugas terbuka yang memiliki tanggal tenggat.</p>
            </div>
            <Link className="text-link" href="/tugas-tenggat">Lihat semua<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          {deadlines.length ? (
            <div className="dashboard-deadline-list">
              {deadlines.map((task) => {
                const dueDate = resolveTaskDueDate(task);
                const daysUntil = dueDate ? getDaysUntil(dueDate) : null;
                const dateTone = daysUntil !== null && daysUntil < 0 ? "is-overdue" : daysUntil !== null && daysUntil <= 1 ? "is-urgent" : "";
                return (
                  <Link
                    className="dashboard-deadline-item"
                    href={`/tugas-tenggat?task=${encodeURIComponent(task.id)}`}
                    key={task.id}
                  >
                    <span className="dashboard-deadline-icon"><FileText size={17} aria-hidden="true" /></span>
                    <span className="dashboard-deadline-copy"><strong>{task.title}</strong><small>{task.course}</small></span>
                    <span className={`dashboard-deadline-date ${dateTone}`}>{formatDueDate(dueDate)}</span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-deadline-empty">
              <EmptyState
                title={openTasks.length ? "Belum ada tenggat yang diatur" : "Belum ada tugas terbuka"}
                description={openTasks.length ? "Tugas tanpa tanggal tidak ditampilkan sebagai tenggat." : "Tugas yang Anda tambahkan akan muncul di sini."}
              />
              <Link className="text-link" href="/tugas-tenggat">Buka daftar tugas<ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-secondary-grid">
        <section className="dashboard-section dashboard-next-session" aria-labelledby="next-session-title">
          <div className="section-heading">
            <div><h2 id="next-session-title">Sesi belajar berikutnya</h2><p>Lanjutkan sesuai waktu yang sudah Anda rencanakan.</p></div>
            <Link className="text-link" href="/perencana-belajar">Lihat rencana<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          {nextSession ? (() => {
            const sessionDate = nextSession.date ?? dateAfterDays(nextSession.dayOffset);
            const isToday = sessionDate === today;
            const href = sessionHref(nextSession.id, nextSession.type, nextSession.contentId);
            const startTime = sessionTimes[nextSession.id] ?? nextSession.startTime;
            return (
              <div className="dashboard-next-session-card">
                <span className="dashboard-next-session-icon"><CalendarDays size={24} aria-hidden="true" /></span>
                <div className="dashboard-next-session-copy">
                  <span className="dashboard-session-kicker">{isToday ? "Hari ini" : formatDate(sessionDate, { weekday: "long" })}</span>
                  <h3>{nextSession.title}</h3>
                  <p>{nextSession.detail}</p>
                  <div className="dashboard-session-meta">
                    <span><CalendarDays size={14} aria-hidden="true" />{formatDate(sessionDate, { day: "numeric", month: "short" })}</span>
                    <span>{startTime}–{formatTimeRange(startTime, nextSession.durationMinutes).split("–")[1]}</span>
                    <span>{formatDuration(nextSession.durationMinutes)}</span>
                  </div>
                </div>
                <Link className="button button-primary dashboard-session-action" href={href}>
                  {nextSession.type === "Kuis" ? "Mulai kuis" : "Mulai sesi"}<ArrowRight size={15} aria-hidden="true" />
                </Link>
              </div>
            );
          })() : (
            <div className="dashboard-next-session-empty">
              <EmptyState title="Belum ada sesi belajar" description="Susun sesi agar materi terbagi menjadi langkah yang lebih teratur." />
              <Link className="button button-primary" href="/perencana-belajar">Buat rencana belajar<ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-materials" aria-labelledby="recent-materials-title">
          <div className="section-heading">
            <div><h2 id="recent-materials-title">Materi terbaru</h2><p>Materi yang terakhir disimpan.</p></div>
            <Link className="text-link" href="/pustaka-materi">Lihat semua<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          {recentMaterials.length ? (
            <div className="dashboard-material-list">
              {recentMaterials.map((material) => (
                <Link key={material.id} href={`/workspace-ai?material=${encodeURIComponent(material.id)}`} className="dashboard-material-row">
                  <span className="dashboard-material-icon"><BookOpenText size={17} aria-hidden="true" /></span>
                  <span><strong>{material.name}</strong><small>{material.course} · {material.format}{material.origin === "sample" ? " · Contoh" : ""}</small></span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="dashboard-material-empty">
              <EmptyState title="Belum ada materi" description="Tambahkan materi di pustaka untuk memulai." />
              <Link className="text-link" href="/pustaka-materi">Buka pustaka materi<ArrowRight size={14} aria-hidden="true" /></Link>
            </div>
          )}
        </section>
      </div>

      {!samplePackLoaded && materials.length === 0 ? (
        <div className="sample-pack-prompt">
          <div><strong>Coba alur belajar dengan paket contoh</strong><p>Materi, catatan, kuis, dan rencana contoh akan ditambahkan ke ruang belajar lokal.</p></div>
          <button type="button" className="button button-secondary" onClick={loadSamplePack}>Muat paket contoh</button>
        </div>
      ) : null}
      <p className="sample-data-note"><BookOpenText size={14} aria-hidden="true" />Data belajar pada perangkat ini tidak tersinkron ke akun.</p>
    </main>
  );
}
