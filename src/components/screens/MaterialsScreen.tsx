"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight, FileText, Plus, Trash2 } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { SearchInput } from "@/components/shared/SearchInput";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UPLOAD_LIMIT_MB } from "@/lib/mock-data";
import { deleteLocalFile, getLocalFile, saveLocalFile } from "@/lib/local-files";
import { useStudoraStore } from "@/lib/store";
import type { Document } from "@/lib/types";

function formatOf(file: File): Document["format"] | null {
  const extension = file.name.split(".").pop()?.toUpperCase();
  return extension === "PDF" || extension === "DOCX" || extension === "PPTX" || extension === "TXT" ? extension : null;
}

export function MaterialsScreen() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [query, setQuery] = useState(searchQuery);
  const [subject, setSubject] = useState("Semua");
  const [course, setCourse] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const materials = useStudoraStore((state) => state.materials);
  const notes = useStudoraStore((state) => state.notes);
  const samplePackLoaded = useStudoraStore((state) => state.samplePackLoaded);
  const loadSamplePack = useStudoraStore((state) => state.loadSamplePack);
  const addMaterial = useStudoraStore((state) => state.addMaterial);
  const removeMaterial = useStudoraStore((state) => state.removeMaterial);
  useEffect(() => { setQuery(searchQuery); }, [searchQuery]);

  const subjects = useMemo(() => ["Semua", ...new Set(materials.map((item) => item.course))], [materials]);
  const filtered = useMemo(() => materials.filter((item) =>
    (subject === "Semua" || item.course === subject) &&
    `${item.name} ${item.course} ${item.format}`.toLocaleLowerCase("id-ID").includes(query.trim().toLocaleLowerCase("id-ID"))
  ), [materials, subject, query]);

  async function importFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!useStudoraStore.persist) {
      setNotice("Penyimpanan browser tidak tersedia. Aktifkan izin penyimpanan lalu muat ulang halaman.");
      return;
    }
    const format = formatOf(file);
    if (!format || file.size === 0 || file.size > UPLOAD_LIMIT_MB * 1048576) {
      setNotice(`Pilih PDF, DOCX, PPTX, atau TXT dengan ukuran maksimal ${UPLOAD_LIMIT_MB} MB.`);
      return;
    }
    const id = `local-${crypto.randomUUID()}`;
    setBusy(true);
    let fileSaved = false;
    try {
      await saveLocalFile(id, file);
      fileSaved = true;
      addMaterial({ id, name: file.name, course: course.trim() || "Materi pribadi", format,
        sizeMb: Math.round(file.size / 104857.6) / 10, addedAt: new Date().toISOString(), origin: "local" });
      setNotice(`${file.name} tersimpan di browser ini.`);
    } catch {
      if (fileSaved) {
        try { removeMaterial(id); } catch { /* Restore the in-memory list even if localStorage is unavailable. */ }
        try { await deleteLocalFile(id); } catch { setNotice("Penyimpanan gagal dan berkas sementara tidak dapat dibersihkan. Periksa ruang penyimpanan browser."); return; }
      }
      setNotice("Berkas gagal disimpan. Periksa izin dan ruang penyimpanan browser, lalu coba lagi.");
    } finally { setBusy(false); }
  }

  async function openFile(item: Document) {
    const tab = item.format === "PDF" || item.format === "TXT" ? window.open("about:blank", "_blank") : null;
    try {
      const blob = await getLocalFile(item.id);
      if (!blob) { tab?.close(); setNotice("Berkas tidak ditemukan di browser ini."); return; }
      const safeBlob = item.format === "PDF" ? new Blob([blob], { type: "application/pdf" })
        : item.format === "TXT" ? new Blob([blob], { type: "text/plain;charset=utf-8" }) : blob;
      const url = URL.createObjectURL(safeBlob);
      if (tab) tab.location.href = url;
      else {
        const anchor = document.createElement("a");
        anchor.href = url; anchor.download = item.name; anchor.click();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { tab?.close(); setNotice("Berkas tidak dapat dibuka."); }
  }

  async function removeFile(item: Document) {
    if (!useStudoraStore.persist) { setNotice("Penyimpanan browser tidak tersedia. Materi belum dihapus."); return; }
    if (!window.confirm(`Hapus ${item.name}? Draf terkait akan dihapus. Catatan pribadi tetap disimpan tanpa tautan materi.`)) return;
    const previous = useStudoraStore.getState();
    try {
      removeMaterial(item.id);
      await deleteLocalFile(item.id);
      setNotice("Materi lokal dihapus.");
    } catch {
      try { useStudoraStore.setState({ materials: previous.materials, notes: previous.notes, studyDrafts: previous.studyDrafts, workspacePreferences: previous.workspacePreferences }); } catch { /* Keep the previous state in memory. */ }
      setNotice("Materi gagal dihapus. Periksa penyimpanan browser dan coba lagi.");
    }
  }

  return <main className="page-content">
    <PageHeading title="Pustaka Materi" description="Simpan materi di browser dan pilih bahan untuk ruang kerja belajar." />
    <Card className="library-import">
      <div><h2 className="card-title">Tambahkan materi</h2><p className="muted">PDF, DOCX, PPTX, TXT · maksimal {UPLOAD_LIMIT_MB} MB. Berkas tetap di perangkat ini.</p></div>
      <div className="library-import-actions">
        <Input value={course} onChange={(event) => setCourse(event.target.value)} placeholder="Mata kuliah (opsional)" aria-label="Mata kuliah materi baru" />
        <label className="button button-primary"><Plus size={15} />{busy ? "Menyimpan..." : "Pilih berkas"}<input className="visually-hidden" type="file" accept=".pdf,.docx,.pptx,.txt" disabled={busy} onChange={importFile} /></label>
      </div>
    </Card>
    {notice ? <p className="notice notice-blue" role="status">{notice}</p> : null}
    {!samplePackLoaded ? <div className="sample-pack-prompt"><div><strong>Ingin mencoba alur Studora?</strong><p>Tambahkan paket contoh berisi materi, catatan, kuis, dan rencana belajar.</p></div><Button variant="secondary" onClick={loadSamplePack}>Muat paket contoh</Button></div> : null}
    <div className="page-toolbar">
      <label className="field-label library-filter-label">Mata kuliah<select className="input" value={subject} onChange={(event) => setSubject(event.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
      <SearchInput value={query} onChange={setQuery} placeholder="Cari materi" label="Cari materi" />
    </div>
    <div className="content-aside-grid">
      <Card><div className="card-head"><h2 className="card-title">{filtered.length} materi</h2><span className="muted">Tersimpan di browser</span></div><div className="material-list">
        {filtered.map((item) => <article className="material-row" key={item.id}>
          <span className="file-icon"><FileText size={18} aria-hidden="true" /></span>
          <div className="list-main"><strong>{item.name}</strong><span>{item.origin === "sample" ? "Bahan bacaan paket contoh" : `${item.format} · ${item.sizeMb.toLocaleString("id-ID")} MB`} · {item.course}</span></div>
          <Badge tone={item.origin === "sample" ? "violet" : "green"}>{item.origin === "sample" ? "Contoh" : "Lokal"}</Badge>
          {item.origin === "sample" && notes.find((note) => note.source === item.name) ? <Link className="text-link" href={`/catatan-ringkasan?note=${encodeURIComponent(notes.find((note) => note.source === item.name)!.id)}`}>Baca contoh</Link> : null}
          {item.origin !== "sample" ? <button type="button" className="text-link" onClick={() => openFile(item)}>{item.format === "DOCX" || item.format === "PPTX" ? "Unduh" : "Buka"}</button> : null}
          <Link className="button button-secondary button-sm" href={`/workspace-ai?material=${encodeURIComponent(item.id)}`}>Pilih untuk draf</Link>
          {item.origin !== "sample" ? <button type="button" className="icon-button" onClick={() => removeFile(item)} aria-label={`Hapus ${item.name}`}><Trash2 size={15} /></button> : null}
        </article>)}
        {filtered.length === 0 ? <EmptyState title={materials.length ? "Materi tidak ditemukan" : "Pustaka masih kosong"} description={materials.length ? "Coba pencarian atau mata kuliah lain." : "Tambahkan berkas Anda atau muat paket contoh untuk mulai belajar."} /> : null}
      </div></Card>
      <aside className="stack"><Card><h2 className="card-title">Ringkasan pustaka</h2><dl className="summary-list"><div><dt>Total materi</dt><dd>{materials.length}</dd></div><div><dt>Mata kuliah</dt><dd>{new Set(materials.map((item) => item.course)).size}</dd></div><div><dt>Materi lokal</dt><dd>{materials.filter((item) => item.origin !== "sample").length}</dd></div></dl></Card><Link href="/workspace-ai" className="button button-primary full-width">Buka Ruang Kerja AI <ArrowUpRight size={15} /></Link></aside>
    </div>
  </main>;
}
