"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, CircleCheck, Circle } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { FilterTabs } from "@/components/shared/FilterTabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudoraStore } from "@/lib/store";
import { formatDueDate, getDaysUntil, resolveTaskDueDate } from "@/lib/dates";
import type { Task } from "@/lib/types";

const tabs = [
  { value: "all", label: "Semua" },
  { value: "open", label: "Terbuka" },
  { value: "overdue", label: "Terlambat" },
  { value: "done", label: "Selesai" },
] as const;

export function TasksScreen() {
  const searchParams = useSearchParams();
  const targetTask = searchParams.get("task");
  const tasks = useStudoraStore((state) => state.tasks);
  const toggleTask = useStudoraStore((state) => state.toggleTask);
  const addTask = useStudoraStore((state) => state.addTask);
  const updateTask = useStudoraStore((state) => state.updateTask);
  const removeTask = useStudoraStore((state) => state.removeTask);
  const [filter, setFilter] = useState<(typeof tabs)[number]["value"]>("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDueDate, setEditDueDate] = useState("");
  const openTasks = tasks.filter((task) => task.status === "open");
  const dueTodayOrTomorrow = openTasks.filter((task) => {
    const dueDate = resolveTaskDueDate(task);
    if (!dueDate) return false;
    const days = getDaysUntil(dueDate);
    return days >= 0 && days <= 1;
  }).length;
  const overdueCount = openTasks.filter((task) => {
    const dueDate = resolveTaskDueDate(task);
    return dueDate !== null && getDaysUntil(dueDate) < 0;
  }).length;
  const nextDueTask = openTasks.filter((task) => resolveTaskDueDate(task) !== null).sort((a, b) => (resolveTaskDueDate(a) ?? "").localeCompare(resolveTaskDueDate(b) ?? ""))[0];
  useEffect(() => {
    if (targetTask) document.getElementById(targetTask)?.scrollIntoView({ block: "center" });
  }, [targetTask]);
  const visible = useMemo(() => filter === "all" ? tasks : tasks.filter((task) => filter === "done"
    ? task.status === "done"
    : filter === "overdue"
      ? task.status === "open" && resolveTaskDueDate(task) !== null && getDaysUntil(resolveTaskDueDate(task)!) < 0
      : task.status === "open"), [filter, tasks]);

  const createTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;
    const task: Task = {
      id: `task-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      title: title.trim(),
      course: course.trim() || "Tugas pribadi",
      dueDate,
      status: "open",
      priority,
      origin: "local",
    };
    addTask(task);
    setTitle("");
    setCourse("");
    setDueDate("");
    setShowForm(false);
  };

  return (
    <main className="page-content">
      <PageHeading title="Tugas & Tenggat" description="Kelola tugas dan tenggat yang tersimpan di perangkat ini." aside={<Badge tone="violet">{openTasks.length} terbuka</Badge>} />
      <div className="page-toolbar"><FilterTabs items={[...tabs]} value={filter} onChange={setFilter} /><Button onClick={() => setShowForm((value) => !value)}><Plus size={15} />Tambah Tugas</Button></div>
      {showForm ? <Card className="task-form-card"><form onSubmit={createTask} className="inline-form">
        <Input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nama tugas" aria-label="Nama tugas" required />
        <Input value={course} onChange={(event) => setCourse(event.target.value)} placeholder="Mata kuliah (opsional)" aria-label="Mata kuliah tugas" />
        <Input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Tenggat tugas (opsional)" />
        <select className="input" value={priority} onChange={(event) => setPriority(event.target.value as Task["priority"])} aria-label="Prioritas tugas"><option value="low">Rendah</option><option value="medium">Sedang</option><option value="high">Tinggi</option></select>
        <Button type="submit">Simpan Tugas</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
      </form></Card> : null}
      <div className="content-aside-grid">
        <Card className="task-list">
          {visible.map((task) => {
            const taskDueDate = resolveTaskDueDate(task);
            const isOverdue = task.status === "open" && taskDueDate !== null && getDaysUntil(taskDueDate) < 0;
            return <div id={task.id} className={targetTask === task.id ? "task-row is-targeted" : "task-row"} key={task.id}>
            <button type="button" className={task.status === "done" ? "task-check is-done" : "task-check"} onClick={() => toggleTask(task.id)} aria-pressed={task.status === "done"} aria-label={`${task.status === "done" ? "Tandai belum selesai" : "Tandai selesai"}: ${task.title}`}>{task.status === "done" ? <CircleCheck size={18} /> : <Circle size={18} />}</button>
            <div className="list-main"><strong className={task.status === "done" ? "is-complete" : ""}>{task.title}</strong><span>{task.course}</span>{editingId === task.id ? <div className="inline-form task-edit"><Input type="date" value={editDueDate} onChange={(event) => setEditDueDate(event.target.value)} aria-label={`Tenggat ${task.title}`} /><button type="button" className="text-link" onClick={() => { updateTask(task.id, { dueDate: editDueDate || null }); setEditingId(null); }}>Simpan</button><button type="button" className="text-link" onClick={() => setEditingId(null)}>Batal</button></div> : null}</div>
            <div className="task-row-details">
              {task.status === "open" ? <Badge>Tugas</Badge> : <Badge tone="green">Selesai</Badge>}
              {task.status === "open" ? <Badge tone={isOverdue ? "red" : task.priority === "high" ? "amber" : "blue"}>{formatDueDate(taskDueDate)}</Badge> : null}
            {task.status === "open" ? <button type="button" className="text-link" onClick={() => { setEditingId(task.id); setEditDueDate(resolveTaskDueDate(task) ?? ""); }}>Ubah tenggat</button> : null}
            {task.origin !== "sample" ? <button type="button" className="text-link" onClick={() => { if (window.confirm(`Hapus tugas ${task.title}?`)) removeTask(task.id); }}>Hapus</button> : null}
            </div>
            </div>;
          })}
          {visible.length === 0 ? <p className="empty-copy">Belum ada tugas pada bagian ini.</p> : null}
        </Card>
        <aside className="stack">
          <Card><h2 className="card-title">Ringkasan tenggat</h2><dl className="summary-list"><div><dt>Tugas terbuka</dt><dd>{openTasks.length}</dd></div><div><dt>Jatuh tempo hari ini atau besok</dt><dd>{dueTodayOrTomorrow}</dd></div><div><dt>Terlambat</dt><dd>{overdueCount}</dd></div><div><dt>Tenggat berikutnya</dt><dd>{nextDueTask ? formatDueDate(resolveTaskDueDate(nextDueTask)) : "Tidak ada"}</dd></div></dl></Card>
          {overdueCount > 0 ? <div className="notice notice-amber" role="status">{overdueCount} tugas terlambat. Perbarui tenggat atau tandai jika sudah selesai.</div> : null}
          <Button variant="secondary" className="full-width" onClick={() => setShowForm(true)}>Tambah Tenggat</Button>
        </aside>
      </div>
    </main>
  );
}
