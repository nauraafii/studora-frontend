"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, FileText } from "lucide-react";
import { DeadlineItem } from "@/components/dashboard/DeadlineItem";
import { PageHeading } from "@/components/shared/PageHeading";
import { EmptyState } from "@/components/shared/EmptyState";
import { Progress } from "@/components/ui/progress";
import { dateAfterDays, formatDate, formatDueDate, getDaysUntil, resolveTaskDueDate } from "@/lib/dates";
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
  const openTasks = tasks.filter((task) => task.status === "open");
  const nextSession = studySessions
    .filter((session) => !completedSessionIds.includes(session.id))
    .filter((session) => (session.date ?? dateAfterDays(session.dayOffset)) >= dateAfterDays(0))
    .sort((a, b) => (a.date ?? dateAfterDays(a.dayOffset)).localeCompare(b.date ?? dateAfterDays(b.dayOffset)) || (sessionTimes[a.id] ?? a.startTime).localeCompare(sessionTimes[b.id] ?? b.startTime))[0];
  const nextTask = openTasks
    .filter((task) => resolveTaskDueDate(task) !== null)
    .sort((a, b) => (resolveTaskDueDate(a) ?? "").localeCompare(resolveTaskDueDate(b) ?? ""))[0];
  const overdueTask = nextTask && resolveTaskDueDate(nextTask) && getDaysUntil(resolveTaskDueDate(nextTask)!) < 0 ? nextTask : undefined;
  const todaySession = nextSession && (nextSession.date ?? dateAfterDays(nextSession.dayOffset)) === dateAfterDays(0) ? nextSession : undefined;
  const focus = overdueTask
    ? {
        eyebrow: "Tugas terlambat",
        title: overdueTask.title,
        detail: `${overdueTask.course} · ${formatDueDate(resolveTaskDueDate(overdueTask))}`,
        href: `/tugas-tenggat?task=${encodeURIComponent(overdueTask.id)}`,
        action: "Lihat tugas",
      }
    : todaySession
    ? {
        eyebrow: "Sesi belajar hari ini",
        title: todaySession.title,
        detail: `${todaySession.detail} · Hari ini, ${sessionTimes[todaySession.id] ?? todaySession.startTime} · ${todaySession.durationMinutes} menit`,
        href: sessionHref(todaySession.id, todaySession.type, todaySession.contentId),
        action: "Mulai sesi belajar",
      }
    : nextTask
      ? {
          eyebrow: "Tugas terdekat",
          title: nextTask.title,
          detail: `${nextTask.course} · ${formatDueDate(resolveTaskDueDate(nextTask))}`,
          href: `/tugas-tenggat?task=${encodeURIComponent(nextTask.id)}`,
          action: "Lihat tugas",
        }
      : nextSession
        ? { eyebrow: "Sesi belajar berikutnya", title: nextSession.title,
            detail: `${nextSession.detail} · ${formatDate(nextSession.date ?? dateAfterDays(nextSession.dayOffset), { day: "numeric", month: "short" })}, ${sessionTimes[nextSession.id] ?? nextSession.startTime} · ${nextSession.durationMinutes} menit`,
            href: sessionHref(nextSession.id, nextSession.type, nextSession.contentId), action: "Lihat sesi" }
        : null;
  const deadlines = openTasks
    .filter((task) => resolveTaskDueDate(task) !== null)
    .sort((a, b) => (resolveTaskDueDate(a) ?? "").localeCompare(resolveTaskDueDate(b) ?? ""))
    .slice(0, 3);
  const planProgress = studySessions.length
    ? Math.round((completedSessionIds.filter((id) => studySessions.some((session) => session.id === id)).length / studySessions.length) * 100)
    : 0;

  return (
    <main className="page-content">
      <div className="dashboard-welcome">
        <PageHeading title="Ruang belajar Anda" description="Kumpulkan materi, atur rencana, dan lanjutkan belajar dalam satu tempat." />
      </div>

      <section className="dashboard-overview" aria-label="Ringkasan ruang belajar">
        <Link href="/pustaka-materi"><span>Materi tersimpan</span><strong>{materials.length}</strong><small>Buka pustaka <ArrowRight size={13} aria-hidden="true" /></small></Link>
        <Link href="/tugas-tenggat"><span>Tugas terbuka</span><strong>{openTasks.length}</strong><small>Lihat tugas <ArrowRight size={13} aria-hidden="true" /></small></Link>
        <Link href="/perencana-belajar"><span>Sesi direncanakan</span><strong>{studySessions.length}</strong><small>Lihat rencana <ArrowRight size={13} aria-hidden="true" /></small></Link>
        <Link href="/perencana-belajar"><span>Sesi selesai</span><strong>{completedSessionIds.filter((id) => studySessions.some((session) => session.id === id)).length}</strong><small>Lihat kemajuan <ArrowRight size={13} aria-hidden="true" /></small></Link>
      </section>

      <section className="dashboard-focus" aria-labelledby="focus-title">
        <span className="dashboard-focus-icon"><FileText size={30} aria-hidden="true" /></span>
        <div className="dashboard-focus-copy">
          {focus ? <><span className="focus-kicker">{focus.eyebrow}</span><h2 id="focus-title">{focus.title}</h2><p>{focus.detail}</p></> : <><h2 id="focus-title">Mulai dari materi yang ingin dipelajari</h2><p>Tambahkan materi dan susun langkah belajar sesuai kebutuhan Anda.</p></>}
        </div>
        <Link className="button dashboard-focus-action" href={focus?.href ?? "/pustaka-materi"}>{focus?.action ?? (materials.length ? "Buka pustaka" : "Tambahkan materi")}<ArrowRight size={16} aria-hidden="true" /></Link>
      </section>

      <div className="dashboard-lower">
        <section className="dashboard-section" aria-labelledby="deadlines-title">
          <div className="section-heading">
            <div><h2 id="deadlines-title">Tenggat terdekat</h2><p>Tugas terbuka diurutkan dari tanggal paling dekat.</p></div>
            <Link className="text-link" href="/tugas-tenggat">Lihat semua<ArrowRight size={14} aria-hidden="true" /></Link>
          </div>
          <div className="dashboard-deadlines">
            {deadlines.length ? deadlines.map((task) => {
              const dueDate = resolveTaskDueDate(task);
              const dueInDays = dueDate ? getDaysUntil(dueDate) : null;
              return <Link className="dashboard-deadline-link" href={`/tugas-tenggat?task=${encodeURIComponent(task.id)}`} key={task.id}>
                <DeadlineItem item={{
                  title: task.title,
                  course: task.course,
                  due: formatDueDate(dueDate),
                  priority: dueInDays !== null && dueInDays < 0 ? "Terlambat" : task.priority === "high" ? "Tinggi" : task.priority === "medium" ? "Sedang" : "Rendah",
                }} />
              </Link>;
            }) : <EmptyState title="Tidak ada tenggat terbuka" description="Tugas yang Anda tambahkan akan muncul di sini." />}
          </div>
        </section>

        <aside className={studySessions.length ? "dashboard-progress" : "dashboard-progress is-empty"} aria-labelledby="progress-title">
          <div className="progress-heading"><span className="progress-icon"><CalendarDays size={17} aria-hidden="true" /></span><span>Rencana belajar</span></div>
          <h2 id="progress-title">{studySessions.length ? `${completedSessionIds.filter((id) => studySessions.some((session) => session.id === id)).length} dari ${studySessions.length} sesi selesai` : "Belum ada sesi belajar"}</h2>
          {studySessions.length ? <Progress value={planProgress} className="plan-progress-bar" /> : <p className="muted">Atur sesi agar waktu belajar lebih terarah.</p>}
          <Link className="text-link" href="/perencana-belajar">{studySessions.length ? "Lihat rencana" : "Buat rencana"}<ArrowRight size={14} aria-hidden="true" /></Link>
        </aside>
      </div>

      <section className="dashboard-section dashboard-materials" aria-labelledby="recent-materials-title">
        <div className="section-heading"><div><h2 id="recent-materials-title">Materi terbaru</h2><p>Lanjutkan dari materi yang tersimpan di perangkat ini.</p></div><Link className="text-link" href="/pustaka-materi">Buka pustaka<ArrowRight size={14} aria-hidden="true" /></Link></div>
        {materials.length ? <div className="dashboard-material-list">{[...materials].sort((a, b) => (Date.parse(b.addedAt) || 0) - (Date.parse(a.addedAt) || 0)).slice(0, 3).map((material) => <Link key={material.id} href={`/workspace-ai?material=${encodeURIComponent(material.id)}`} className="dashboard-material-row"><span className="dashboard-material-icon"><FileText size={17} aria-hidden="true" /></span><span><strong>{material.name}</strong><small>{material.course} · {material.format}{material.origin === "sample" ? " · Contoh" : ""}</small></span><ArrowRight size={16} aria-hidden="true" /></Link>)}</div> : <EmptyState title="Belum ada materi" description="Tambahkan materi di pustaka untuk memulai." />}
      </section>

      {!samplePackLoaded && materials.length === 0 ? <div className="sample-pack-prompt"><div><strong>Coba alur belajar dengan paket contoh</strong><p>Materi, catatan, kuis, dan rencana contoh akan ditambahkan ke ruang belajar lokal.</p></div><button type="button" className="button button-secondary" onClick={loadSamplePack}>Muat paket contoh</button></div> : null}
      <p className="sample-data-note"><BookOpenText size={14} aria-hidden="true" />Data belajar pada perangkat ini tidak tersinkron ke akun.</p>
    </main>
  );
}
