"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useStudoraStore } from "@/lib/store";
import { dateAfterDays, formatDueDate, getDaysUntil, resolveTaskDueDate } from "@/lib/dates";
import type { StudyNotification } from "@/lib/types";

type Filter = "all" | "unread" | "task" | "study";

export function NotificationsScreen() {
  const router = useRouter();
  const tasks = useStudoraStore((state) => state.tasks);
  const sessions = useStudoraStore((state) => state.studySessions);
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const readIds = useStudoraStore((state) => state.readNotificationIds);
  const prefs = useStudoraStore((state) => state.notificationPreferences);
  const setPreference = useStudoraStore((state) => state.setNotificationPreference);
  const markRead = useStudoraStore((state) => state.markLocalNotificationsRead);
  const [filter, setFilter] = useState<Filter>("all");
  const items = useMemo(() => {
    const derived: StudyNotification[] = [];
    if (prefs.deadlines) for (const task of tasks) {
      const due = resolveTaskDueDate(task);
      if (task.status !== "open" || !due || getDaysUntil(due) > 3) continue;
      const id = `task:${task.id}:${due}`;
      derived.push({ id, title: getDaysUntil(due) < 0 ? "Tugas terlambat" : "Tenggat tugas mendekat",
        detail: task.title, time: formatDueDate(due), kind: "task", unread: !readIds.includes(id),
        actionLabel: "Lihat tugas", href: `/tugas-tenggat?task=${encodeURIComponent(task.id)}` });
    }
    if (prefs.studyReminders) for (const session of sessions) {
      const date = session.date ?? dateAfterDays(session.dayOffset);
      if (completedIds.includes(session.id) || date < dateAfterDays(0) || date > dateAfterDays(1)) continue;
      const id = `study:${session.id}:${date}`;
      derived.push({ id, title: "Sesi belajar terjadwal", detail: session.title, time: date,
        kind: "study", unread: !readIds.includes(id), actionLabel: "Lihat rencana", href: "/perencana-belajar" });
    }
    return derived;
  }, [tasks, sessions, completedIds, readIds, prefs.deadlines, prefs.studyReminders]);
  const unreadCount = items.filter((item) => item.unread).length;
  const filters: { value: Filter; label: string }[] = [
    { value: "all", label: `Semua ${items.length}` }, { value: "unread", label: `Belum dibaca ${unreadCount}` },
    { value: "task", label: "Tugas" }, { value: "study", label: "Belajar" },
  ];
  const filtered = items.filter((item) => filter === "all" || (filter === "unread" ? item.unread : item.kind === filter));
  function open(item: StudyNotification) {
    markRead([item.id]);
    if (item.href) router.push(item.href);
  }
  return <main className="page-content">
    <PageHeading title="Notifikasi" description="Pengingat lokal dari tenggat dan rencana belajar Anda." aside={<span className="badge badge-violet">{unreadCount} belum dibaca</span>} />
    <div className="content-aside-grid"><section>
      <FilterTabs items={filters} value={filter} onChange={setFilter} />
      <div className="notification-list">{filtered.map((item) => <Card className={item.unread ? "notification-row is-unread" : "notification-row"} key={item.id}>
        <span className={item.unread ? "notification-dot is-active" : "notification-dot"} aria-hidden="true" />
        <div className="list-main"><strong>{item.title}</strong><span>{item.detail}</span></div>
        <span className="muted">{item.time}</span>
        <button type="button" className="text-link" onClick={() => open(item)}>{item.actionLabel}</button>
      </Card>)}
      {filtered.length === 0 ? <p className="empty-copy">{items.length ? "Tidak ada notifikasi pada bagian ini." : "Belum ada pengingat. Tambahkan tenggat atau sesi belajar untuk melihat pembaruan di sini."}</p> : null}</div>
    </section><aside className="stack">
      <Card><h2 className="card-title">Preferensi notifikasi</h2><div className="stack compact settings-list">
        <div className="setting-row"><span>Tenggat tugas</span><Switch aria-label="Tenggat tugas" checked={prefs.deadlines} onCheckedChange={(value) => setPreference("deadlines", value)} /></div>
        <div className="setting-row"><span>Sesi belajar hari ini dan besok</span><Switch aria-label="Sesi belajar" checked={prefs.studyReminders} onCheckedChange={(value) => setPreference("studyReminders", value)} /></div>
      </div></Card>
      <p className="muted"><Bell size={15} aria-hidden="true" /> Pengingat hanya tampil saat Studora dibuka; belum ada push atau email.</p>
      <Button className="full-width" disabled={unreadCount === 0} onClick={() => markRead(items.map((item) => item.id))}><Check size={15} />Tandai semua dibaca</Button>
    </aside></div>
  </main>;
}
