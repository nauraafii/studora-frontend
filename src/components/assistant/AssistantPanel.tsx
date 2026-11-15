"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bot, Check, Clock3, MessageSquarePlus, Send, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useStudoraStore } from "@/lib/store";
import type { AssistantMessage, AssistantThread, StudyDraftOptions, Task, WorkspaceGoal } from "@/lib/types";

const STORAGE_KEY = "studora-assistant-demo-v1";
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

function parseTaskRequest(text: string): Task | null {
  const match = text.trim().match(/(?:tambahkan|tambah|buat(?:kan)?)\s+(?:tugas|deadline|tenggat)\s+(?:baru\s+)?(.+)/i);
  if (!match) return null;
  let title = match[1].trim().replace(/[.!?]+$/, "");
  let dueDate: string | null = null;
  const iso = title.match(/(?:tenggat|deadline|jatuh tempo)\s*(?:tanggal\s*)?(\d{4}-\d{2}-\d{2})/i);
  if (iso) {
    dueDate = iso[1];
    title = title.replace(iso[0], "").trim().replace(/[,;–-]+$/, "").trim();
  }
  if (!title) return null;
  return { id: `assistant-${makeId()}`, title, course: "Tugas pribadi", dueDate, status: "open", priority: "medium", origin: "assistant" };
}

function migratePanelThreads(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw) as { threads?: Array<{ id?: string; title?: string; updatedAt?: string; messages?: Array<{ id?: string; role?: string; text?: string; createdAt?: string; task?: Task }> }> };
    const threads: AssistantThread[] = (saved.threads ?? []).flatMap((thread) => {
      if (!thread.id || !Array.isArray(thread.messages)) return [];
      return [{
        id: thread.id,
        title: thread.title || "Percakapan prototipe",
        updatedAt: thread.updatedAt || new Date().toISOString(),
        source: "demo",
        messages: thread.messages.flatMap((message) => {
          if ((message.role !== "user" && message.role !== "assistant") || typeof message.text !== "string") return [];
          return [{ id: message.id || makeId(), role: message.role, content: message.text, createdAt: message.createdAt || new Date().toISOString(), ...(message.task ? { task: message.task } : {}) } as AssistantMessage];
        }),
      }];
    });
    useStudoraStore.getState().importAssistantThreads(threads);
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Keep the old key intact if import fails, so the prototype transcript can be recovered.
  }
}

export function AssistantPanel() {
  const addTask = useStudoraStore((state) => state.addTask);
  const threads = useStudoraStore((state) => state.assistantThreads);
  const activeId = useStudoraStore((state) => state.activeAssistantThreadId);
  const setActiveId = useStudoraStore((state) => state.setActiveAssistantThreadId);
  const open = useStudoraStore((state) => state.assistantPanelOpen);
  const setOpen = useStudoraStore((state) => state.setAssistantPanelOpen);
  const createThread = useStudoraStore((state) => state.createAssistantThread);
  const appendMessage = useStudoraStore((state) => state.appendAssistantMessage);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const active = threads.find((thread) => thread.id === activeId);

  useEffect(() => {
    const persistence = useStudoraStore.persist;
    const initialize = () => {
      useStudoraStore.getState().migrateLegacyStudyChats();
      migratePanelThreads();
    };
    if (persistence.hasHydrated()) initialize();
    else return persistence.onFinishHydration(initialize);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        setOpen(!useStudoraStore.getState().assistantPanelOpen);
      }
      if (event.key === "Escape" && useStudoraStore.getState().assistantPanelOpen) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  useEffect(() => {
    const openAssistant = () => setOpen(true);
    const openThread = (event: Event) => {
      const threadId = (event as CustomEvent<{ threadId?: string }>).detail?.threadId;
      if (!threadId) return;
      setActiveId(threadId);
      setOpen(true);
    };
    const startStudySession = (event: Event) => {
      const detail = (event as CustomEvent<{ text: string; title: string; materialIds: string[]; materials: Array<{ id: string; name: string }>; goal: WorkspaceGoal; options: StudyDraftOptions }>).detail;
      if (!detail?.text) return;
      const now = new Date().toISOString();
      const thread: AssistantThread = {
        id: `thread-${makeId()}`,
        title: detail.title || detail.text.slice(0, 42),
        updatedAt: now,
        source: "demo",
        context: { materialIds: detail.materialIds, materials: detail.materials, goal: detail.goal, options: detail.options },
        messages: [
          { id: makeId(), role: "user", content: detail.text, createdAt: now },
          { id: makeId(), role: "assistant", content: "Permintaan sesi tersimpan dalam percakapan simulasi ini. Layanan AI belum tersambung, jadi materi belum dianalisis.", createdAt: now },
        ],
      };
      createThread(thread);
      setOpen(true);
    };
    window.addEventListener("studora-open-assistant", openAssistant);
    window.addEventListener("studora-open-assistant-thread", openThread);
    window.addEventListener("studora-start-study-session", startStudySession);
    return () => {
      window.removeEventListener("studora-open-assistant", openAssistant);
      window.removeEventListener("studora-open-assistant-thread", openThread);
      window.removeEventListener("studora-start-study-session", startStudySession);
    };
  }, [createThread, setActiveId, setOpen]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(timer);
  }, [open, activeId]);

  function newThread() {
    const now = new Date().toISOString();
    createThread({ id: `thread-${makeId()}`, title: "Percakapan baru", updatedAt: now, source: "demo", messages: [] });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text || active?.source === "legacy") return;
    const now = new Date().toISOString();
    const thread = active ?? { id: `thread-${makeId()}`, title: text.slice(0, 42), updatedAt: now, source: "demo" as const, messages: [] };
    if (!active) createThread(thread);
    const task = parseTaskRequest(text);
    const reply: AssistantMessage = task
      ? { id: makeId(), role: "assistant", content: `Simulasi: tugas “${task.title}” ditambahkan${task.dueDate ? ` dengan tenggat ${task.dueDate}` : " tanpa tenggat"}. Tugas muncul di Tugas & Tenggat pada perangkat ini.`, createdAt: now, task }
      : { id: makeId(), role: "assistant", content: "Mode simulasi belum memahami perintah ini. Coba: “Tambahkan tugas Laporan praktikum tenggat 2026-11-20”. Untuk aksi AI sungguhan, layanan backend perlu tersambung.", createdAt: now };
    appendMessage(thread.id, { id: makeId(), role: "user", content: text, createdAt: now });
    appendMessage(thread.id, reply);
    setActiveId(thread.id);
    setDraft("");
    if (task) addTask(task);
  }

  return <>
    {open ? <>
      <button className="assistant-backdrop" type="button" aria-label="Tutup Asisten AI" onClick={() => setOpen(false)} />
      <aside id="assistant-panel" className="assistant-drawer" aria-label="Asisten AI" data-ai-hide>
        <header className="assistant-head"><div className="assistant-head-icon"><Sparkles size={17} /></div><div className="assistant-head-copy"><strong>Asisten belajar</strong><span>Mode simulasi · belum tersambung</span></div><button className="assistant-icon" type="button" aria-label="Percakapan baru" onClick={newThread}><MessageSquarePlus size={17} /></button><button className="assistant-icon" type="button" aria-label="Tutup" onClick={() => setOpen(false)}><X size={18} /></button></header>
        <div className="assistant-threadbar"><label htmlFor="assistant-thread-select">Percakapan</label><select id="assistant-thread-select" value={activeId ?? ""} onChange={(event) => setActiveId(event.target.value || null)}><option value="">Percakapan baru</option>{threads.map((thread) => <option key={thread.id} value={thread.id}>{thread.title}{thread.source === "legacy" ? " · sesi lama" : ""}</option>)}</select></div>
        <div className="assistant-messages" role="log" aria-live="polite" aria-label="Pesan Asisten AI">
          {!active ? <div className="assistant-empty"><div className="assistant-orbit"><Bot size={24} /></div><h2>Ada yang ingin dipelajari?</h2><p>Tanyakan materi atau kelola tugas lewat percakapan. Percakapan dan tugas demo tersimpan di browser ini.</p><div className="assistant-suggestions"><button type="button" onClick={() => setDraft("Tambahkan tugas Laporan praktikum")}>Tambahkan tugas</button><Link href="/tugas-tenggat" onClick={() => setOpen(false)}>Lihat tugas</Link><Link href="/workspace-ai" onClick={() => setOpen(false)}>Mulai sesi belajar</Link></div></div> : <>
            {active.source === "legacy" ? <div className="assistant-demo-notice" role="status">Sesi lama dari prototipe · hanya dapat dibaca</div> : null}
            {active.messages.map((message) => <article className={`assistant-message is-${message.role}`} key={message.id}><div className="assistant-message-role">{message.role === "user" ? "Anda" : active.source === "legacy" ? "Studora · prototipe" : "Studora · Simulasi"}</div><p>{message.content}</p>{message.task ? <div className="assistant-action-card"><span className="assistant-action-icon"><Check size={15} /></span><div><strong>Tugas ditambahkan</strong><span>{message.task.title}</span><small><Clock3 size={12} />{message.task.dueDate ?? "Tanpa tenggat"}</small></div><Link href={`/tugas-tenggat?task=${encodeURIComponent(message.task.id)}`} onClick={() => setOpen(false)}>Lihat</Link></div> : null}</article>)}
          </>}
        </div>
        <div className="assistant-footer">{active?.source === "legacy" ? <p className="assistant-demo-notice">Mulai percakapan baru untuk melanjutkan dengan konteks yang masih berlaku.</p> : <><div className="assistant-demo-notice"><span className="assistant-demo-dot" /> Simulasi lokal. AI belum tersambung ke backend.</div><form className="assistant-composer" onSubmit={submit}><textarea ref={inputRef} value={draft} maxLength={4000} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Tulis permintaan, misalnya: Tambahkan tugas ..." aria-label="Pesan untuk Asisten AI" rows={3} /><button type="submit" disabled={!draft.trim()} aria-label="Kirim pesan"><Send size={16} /></button></form><div className="assistant-footer-meta"><span>Enter untuk mengirim · Shift+Enter untuk baris baru</span><span>{draft.length}/4000</span></div></>}</div>
      </aside>
    </> : null}
  </>;
}
