"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays } from "lucide-react";
import { DeadlineItem } from "@/components/dashboard/DeadlineItem";
import { PageHeading } from "@/components/shared/PageHeading";
import { EmptyState } from "@/components/shared/EmptyState";
import { Progress } from "@/components/ui/progress";
import { dateAfterDays, formatDueDate, getDaysUntil, resolveTaskDueDate } from "@/lib/dates";
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
  const now = new Date();
  const jakartaTime = now.toLocaleTimeString("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const nextSession = studySessions
    .filter((session) => !completedSessionIds.includes(session.id))
    .filter((session) => {
      const date = session.date ?? dateAfterDays(session.dayOffset);
      return date > dateAfterDays(0) || (date === dateAfterDays(0) && (sessionTimes[session.id] ?? session.startTime) >= jakartaTime);
    })
    .sort((a, b) => (a.date ?? dateAfterDays(a.dayOffset)).localeCompare(b.date ?? dateAfterDays(b.dayOffset)) || (sessionTimes[a.id] ?? a.startTime).localeCompare(sessionTimes[b.id] ?? b.startTime))[0];
  const nextTask = openTasks
    .filter((task) => resolveTaskDueDate(task) !== null)
    .sort((a, b) => (resolveTaskDueDate(a) ?? "").localeCompare(resolveTaskDueDate(b) ?? ""))[0];
  const focus = nextSession
    ? {
        eyebrow: "Sesi belajar berikutnya",
        title: nextSession.title,
        detail: `${nextSession.detail} · ${nextSession.durationMinutes} menit`,
        href: sessionHref(nextSession.id, nextSession.type, nextSession.contentId),
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
      <PageHeading title="Ruang belajar Anda" description="Fokus belajar dan satu langkah berikutnya, tersimpan di perangkat ini." />

      <section className="dashboard-focus" aria-labelledby="focus-title">
        <div className="focus-kicker"><span className="focus-indicator" />Fokus hari ini</div>
        {focus ? <>
          <h2 id="focus-title">{focus.title}</h2>
          <p>{focus.detail}</p>
          <Link className="button button-primary" href={focus.href}>{focus.action}<ArrowRight size={16} aria-hidden="true" /></Link>
        </> : <>
          <h2 id="focus-title">Mulai dari materi yang ingin dipelajari</h2>
          <p>Pilih materi, lalu tentukan tujuan belajar Anda.</p>
          <Link className="button button-primary" href="/pustaka-materi">{materials.length ? "Buka pustaka" : "Tambahkan materi"}<ArrowRight size={16} aria-hidden="true" /></Link>
        </>}
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

        <aside className="dashboard-progress" aria-labelledby="progress-title">
          <div className="progress-heading"><span className="progress-icon"><CalendarDays size={17} aria-hidden="true" /></span><span>Rencana belajar</span></div>
          <h2 id="progress-title">{completedSessionIds.filter((id) => studySessions.some((session) => session.id === id)).length} dari {studySessions.length} sesi selesai</h2>
          <Progress value={planProgress} className="plan-progress-bar" />
          <Link className="text-link" href="/perencana-belajar">{studySessions.length ? "Lihat rencana" : "Buat rencana"}<ArrowRight size={14} aria-hidden="true" /></Link>
        </aside>
      </div>

      {!samplePackLoaded && materials.length === 0 ? <div className="sample-pack-prompt"><div><strong>Coba alur belajar dengan paket contoh</strong><p>Materi, catatan, kuis, dan rencana contoh akan ditambahkan ke ruang belajar lokal.</p></div><button type="button" className="button button-secondary" onClick={loadSamplePack}>Muat paket contoh</button></div> : null}
      <p className="sample-data-note"><BookOpenText size={14} aria-hidden="true" />Data belajar pada perangkat ini tidak tersinkron ke akun.</p>
    </main>
  );
}
