"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStudoraStore } from "@/lib/store";
import type { Note } from "@/lib/types";

export function NotesScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedNote = searchParams.get("note");
  const sessionId = searchParams.get("session");
  const searchQuery = searchParams.get("search") ?? "";
  const notes = useStudoraStore((state) => state.notes);
  const materials = useStudoraStore((state) => state.materials);
  const quizzes = useStudoraStore((state) => state.quizzes);
  const sessions = useStudoraStore((state) => state.studySessions);
  const completedIds = useStudoraStore((state) => state.completedStudySessionIds);
  const addNote = useStudoraStore((state) => state.addNote);
  const updateNote = useStudoraStore((state) => state.updateNote);
  const removeNote = useStudoraStore((state) => state.removeNote);
  const completeSession = useStudoraStore((state) => state.completeStudySession);
  const [query, setQuery] = useState(searchQuery);
  const [opened, setOpened] = useState<string | null>(requestedNote);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [materialId, setMaterialId] = useState("");
  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);
  useEffect(() => { setOpened(requestedNote); }, [requestedNote]);
  const filtered = useMemo(() => notes.filter((note) => `${note.title} ${note.source} ${note.kind}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"))), [notes, query]);
  const activeNote = notes.find((note) => note.id === opened);
  const linkedSession = sessions.find((session) => session.id === sessionId && session.contentId === activeNote?.id);
  const relatedQuiz = activeNote && quizzes.find((quiz) => quiz.id === activeNote.relatedQuizId);

  function startEdit(note?: Note) {
    setEditingId(note?.id ?? null);
    setTitle(note?.title ?? ""); setBody(note?.body ?? ""); setMaterialId(note?.materialId ?? "");
    setShowForm(true); setOpened(null);
    if (requestedNote) router.replace("/catatan-ringkasan");
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !body.trim()) return;
    const material = materials.find((item) => item.id === materialId);
    const patch = { title: title.trim(), body: body.trim(), materialId: materialId || undefined, source: material?.name ?? "Catatan pribadi" };
    if (editingId) updateNote(editingId, patch);
    else addNote({ id: `note-local-${crypto.randomUUID()}`, ...patch, kind: "Catatan", tone: "green", relatedQuizId: "", origin: "local" });
    setShowForm(false); setEditingId(null); setTitle(""); setBody("");
  }

  return <main className="page-content">
    <PageHeading title="Catatan & Ringkasan" description="Tulis catatan sendiri atau pelajari materi dari paket contoh." />
    <div className="page-toolbar"><Button onClick={() => startEdit()}><Plus size={15} />Tulis catatan</Button></div>
    {showForm ? <Card className="note-editor"><h2 className="card-title">{editingId ? "Ubah catatan" : "Catatan baru"}</h2><form onSubmit={save} className="stack">
      <label className="field-label">Judul<Input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required /></label>
      <label className="field-label">Materi terkait (opsional)<select className="input" value={materialId} onChange={(event) => setMaterialId(event.target.value)}><option value="">Tanpa materi terkait</option>{materials.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      <label className="field-label">Isi catatan<textarea className="textarea note-editor-body" value={body} onChange={(event) => setBody(event.target.value)} required placeholder="Tulis konsep, contoh, atau pertanyaan yang ingin Anda ingat." /></label>
      <div className="note-modal-actions"><Button type="submit">Simpan catatan</Button><Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button></div>
    </form></Card> : null}
    {activeNote ? <Card className="note-detail-card">
      <div className="note-detail-head"><Badge tone={activeNote.origin === "sample" ? "blue" : "green"}>{activeNote.origin === "sample" ? "Paket contoh" : "Catatan pribadi"}</Badge><Link className="text-link" href="/catatan-ringkasan">Semua catatan</Link></div>
      <h2>{activeNote.title}</h2><p className="muted">Sumber: {activeNote.source}</p>
      <div className="note-preview"><strong>Isi catatan</strong><p className="note-body-text">{activeNote.body}</p></div>
      <div className="note-modal-actions">
        {relatedQuiz ? <Link className="button button-secondary" href={`/kuis-latihan?quiz=${encodeURIComponent(relatedQuiz.id)}`}>Lanjut ke kuis terkait</Link> : null}
        {activeNote.origin !== "sample" ? <><Button variant="secondary" onClick={() => startEdit(activeNote)}><Pencil size={15} />Ubah</Button><Button variant="danger" onClick={() => { if (window.confirm(`Hapus catatan ${activeNote.title}?`)) { removeNote(activeNote.id); setOpened(null); } }}><Trash2 size={15} />Hapus</Button></> : null}
        {linkedSession ? <Button disabled={completedIds.includes(linkedSession.id)} onClick={() => completeSession(linkedSession.id)}><Check size={15} />{completedIds.includes(linkedSession.id) ? "Sesi selesai" : "Tandai sesi selesai"}</Button> : null}
      </div>
    </Card> : <>
      <div className="page-toolbar"><SearchInput value={query} onChange={setQuery} placeholder="Cari catatan" label="Cari catatan dan ringkasan" /></div>
      <Card className="notes-list">{filtered.map((note) => <article className="note-row" key={note.id}>
        <div className="note-icon"><FileText size={18} aria-hidden="true" /></div><div className="list-main"><strong>{note.title}</strong><span>{note.source}</span></div>
        <Badge tone={note.origin === "sample" ? "blue" : "green"}>{note.origin === "sample" ? "Contoh" : "Pribadi"}</Badge>
        <Link className="button button-secondary button-sm" href={`/catatan-ringkasan?note=${encodeURIComponent(note.id)}`}>Buka catatan</Link>
      </article>)}
      {filtered.length === 0 ? <EmptyState title={notes.length ? "Catatan tidak ditemukan" : "Belum ada catatan"} description={notes.length ? "Coba kata pencarian lain." : "Tulis catatan pertama Anda atau muat paket contoh dari Pustaka Materi."} /> : null}</Card>
    </>}
  </main>;
}
