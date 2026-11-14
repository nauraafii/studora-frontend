"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, BookOpenText, Check, MessageSquareText, Send, Sparkles } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { AgentSelectorToggle } from "@/components/workspace/AgentSelectorToggle";
import { WorkflowSettings } from "@/components/workspace/WorkflowSettings";
import { Button } from "@/components/ui/button";
import { agents } from "@/lib/mock-data";
import { useStudoraStore } from "@/lib/store";
import type { StudyDraft, StudyDraftOptions, WorkspaceGoal } from "@/lib/types";

const defaultOptions: StudyDraftOptions = { summaryLength: "short", questionCount: 5, difficulty: "basic", revisionDays: 3, minutesPerDay: 30 };
const actions: { label: string; goal: WorkspaceGoal; prompt: string }[] = [
  { label: "Jelaskan konsep", goal: "understand", prompt: "Jelaskan konsep utama dengan bahasa sederhana." },
  { label: "Buat ringkasan", goal: "understand", prompt: "Buat ringkasan dari materi ini." },
  { label: "Latihan soal", goal: "practice", prompt: "Buatkan latihan soal dari materi ini." },
  { label: "Susun jadwal", goal: "schedule", prompt: "Bantu saya menyusun jadwal belajar untuk materi ini." },
];
const outputs: Record<WorkspaceGoal, string> = { understand: "Ringkasan", practice: "Soal latihan", schedule: "Rencana belajar" };
type ChatEntry = { id: number; prompt: string; materialId: string; materialName: string; goal: WorkspaceGoal; options: StudyDraftOptions };

export function WorkspaceScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialQuery = searchParams.get("material");
  const draftQuery = searchParams.get("draft");
  const settingsQuery = searchParams.get("settings");
  const preferences = useStudoraStore((state) => state.workspacePreferences);
  const workflowPreferences = useStudoraStore((state) => state.workflowPreferences);
  const savedDrafts = useStudoraStore((state) => state.studyDrafts);
  const materials = useStudoraStore((state) => state.materials);
  const setPreference = useStudoraStore((state) => state.setWorkspacePreference);
  const setWorkflowPreference = useStudoraStore((state) => state.setWorkflowPreference);
  const saveStudyDraft = useStudoraStore((state) => state.saveStudyDraft);
  const [advancedOpen, setAdvancedOpen] = useState(settingsQuery === "1");
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<StudyDraftOptions>(defaultOptions);
  const [messages, setMessages] = useState<ChatEntry[]>([]);
  const selectedMaterial = materials.find((material) => material.id === preferences.selectedMaterialId);
  const existingDraft = savedDrafts.find((item) => item.id === draftQuery);
  const workflowValues = [workflowPreferences.requireApproval, workflowPreferences.onlyOwnMaterials, workflowPreferences.showAgentActivity];

  useEffect(() => {
    if (materialQuery && materials.some((material) => material.id === materialQuery)) setPreference("selectedMaterialId", materialQuery);
  }, [materialQuery, materials, setPreference]);
  useEffect(() => {
    if (!draftQuery) return;
    const draft = savedDrafts.find((item) => item.id === draftQuery);
    if (!draft) return;
    setPreference("selectedMaterialId", draft.materialId);
    setPreference("selectedGoal", draft.goal);
    setPreference("selectedOutputs", draft.outputs);
    setOptions({ ...defaultOptions, ...draft.options });
    setPrompt(draft.prompt ?? "");
  }, [draftQuery, savedDrafts, setPreference]);
  useEffect(() => { if (settingsQuery === "1") setAdvancedOpen(true); }, [settingsQuery]);

  function selectAction(action: typeof actions[number]) {
    setPreference("selectedGoal", action.goal);
    setPreference("selectedOutputs", [outputs[action.goal]]);
    setPrompt(action.prompt);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMaterial || !prompt.trim()) return;
    setMessages((current) => [...current, { id: Date.now(), prompt: prompt.trim(), materialId: selectedMaterial.id, materialName: selectedMaterial.name, goal: preferences.selectedGoal, options: { ...options } }]);
  }
  function saveDraft() {
    if (!selectedMaterial) return;
    const draftPrompt = prompt.trim();
    if (!draftPrompt) return;
    const draft: StudyDraft = {
      id: existingDraft?.id ?? `draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
      materialId: selectedMaterial.id, goal: preferences.selectedGoal, outputs: [outputs[preferences.selectedGoal]],
      options, prompt: draftPrompt, createdAt: new Date().toISOString(),
    };
    saveStudyDraft(draft);
    router.push(`/riwayat?draft=${encodeURIComponent(draft.id)}`);
  }
  function changeWorkflowSetting(index: number, value: boolean) {
    const keys = ["requireApproval", "onlyOwnMaterials", "showAgentActivity"] as const;
    setWorkflowPreference(keys[index], value);
  }

  return <main className="page-content">
    <PageHeading title="Ruang Kerja AI" description="Pilih materi, tulis permintaan, lalu lihat contoh respons." />
    <div className="chat-service-status" role="status"><span aria-hidden="true" /> <strong>Mode simulasi</strong><span>AI belum tersambung. Materi belum dianalisis.</span></div>
    <div className="chat-workspace">
      <section className="chat-panel" aria-label="Percakapan belajar">
        <div className="chat-panel-header"><div><h2>Percakapan belajar</h2><p>Percakapan ini hanya simulasi dan tidak disimpan sebagai riwayat chat.</p></div><MessageSquareText size={19} aria-hidden="true" /></div>
        <div className="chat-thread" aria-live="polite" aria-relevant="additions text">
          <div className="chat-welcome"><span className="chat-avatar"><Sparkles size={18} aria-hidden="true" /></span><div><strong>Mulai dari apa yang ingin Anda pahami</strong><p>Pilih materi, lalu tulis pertanyaan atau gunakan salah satu pilihan di bawah.</p><div className="chat-actions">{actions.map((action) => <button type="button" key={action.label} onClick={() => selectAction(action)}>{action.label}<ArrowRight size={13} aria-hidden="true" /></button>)}</div></div></div>
          {messages.map((message) => <div className="chat-exchange" key={message.id}>
            <div className="chat-user-message"><span>Anda · {message.materialName}</span><p>{message.prompt}</p></div>
            <div className="chat-simulation"><span className="chat-avatar"><Sparkles size={16} aria-hidden="true" /></span><div><strong>Contoh respons · Simulasi</strong><p>AI belum tersambung dan isi materi belum dianalisis. Permintaan ini belum menghasilkan jawaban belajar.</p><p>{message.goal === "practice" ? `Setelah AI tersedia, hasil dapat berupa ${message.options.questionCount} soal dengan tingkat kesulitan ${message.options.difficulty === "basic" ? "dasar" : message.options.difficulty === "intermediate" ? "menengah" : "lanjutan"}.` : message.goal === "schedule" ? `Setelah AI tersedia, hasil dapat berupa rencana ${message.options.revisionDays} hari selama ${message.options.minutesPerDay} menit per hari.` : "Setelah AI tersedia, hasil dapat mencakup penjelasan dan ringkasan berdasarkan materi yang dipilih."}</p></div></div>
          </div>)}
        </div>
        <form className="chat-composer" onSubmit={submit}>
        <label className="field-label">Materi<select className="input" value={selectedMaterial?.id ?? ""} onChange={(event) => setPreference("selectedMaterialId", event.target.value)}><option value="">Pilih materi</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select></label>
        <p className="chat-context-hint">{selectedMaterial ? (selectedMaterial.origin === "sample" ? "Materi dari paket contoh." : "Materi tersimpan di browser ini.") : "Tambahkan atau pilih materi untuk memulai."} <Link href="/pustaka-materi" className="text-link">Buka pustaka</Link></p>
          <label className="chat-input-label" htmlFor="study-prompt">Permintaan belajar</label>
          <textarea id="study-prompt" className="textarea" rows={3} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Contoh: Jelaskan konsep utama dengan bahasa sederhana…" />
          <div className="chat-composer-footer"><span>{selectedMaterial ? `Materi: ${selectedMaterial.name}` : "Pilih materi untuk mengirim simulasi."}</span><Button type="submit" disabled={!selectedMaterial || !prompt.trim()}>Lihat simulasi <Send size={15} aria-hidden="true" /></Button></div>
          <div className="chat-save-row"><Button type="button" variant="secondary" disabled={!selectedMaterial || !prompt.trim()} onClick={saveDraft}><Check size={15} aria-hidden="true" />{existingDraft ? "Simpan perubahan draf" : "Simpan permintaan sebagai draf"}</Button><p>Yang disimpan: materi, teks di atas, dan pengaturan hasil. Draf tersedia di Riwayat.</p></div>
        </form>
      </section>
      <details className="chat-context chat-options">
        <summary className="chat-context-heading"><BookOpenText size={18} aria-hidden="true" />Pengaturan hasil <span>Opsional</span></summary><div className="chat-options-body"><p className="chat-context-hint">Pilih bentuk hasil yang diinginkan. Teks pesan tidak mengubah pengaturan ini secara otomatis.</p>
        <label className="field-label">Tujuan<select className="input" value={preferences.selectedGoal} onChange={(event) => { const goal = event.target.value as WorkspaceGoal; setPreference("selectedGoal", goal); setPreference("selectedOutputs", [outputs[goal]]); }}><option value="understand">Pahami konsep / ringkasan</option><option value="practice">Latihan soal</option><option value="schedule">Jadwal revisi</option></select></label>
        {preferences.selectedGoal === "understand" ? <label className="field-label">Panjang ringkasan<select className="input" value={options.summaryLength} onChange={(event) => setOptions({ ...options, summaryLength: event.target.value as StudyDraftOptions["summaryLength"] })}><option value="short">Singkat</option><option value="detailed">Mendalam</option></select></label> : null}
        {preferences.selectedGoal === "practice" ? <><label className="field-label">Jumlah soal<select className="input" value={options.questionCount} onChange={(event) => setOptions({ ...options, questionCount: Number(event.target.value) as StudyDraftOptions["questionCount"] })}>{[5, 10, 20].map((n) => <option key={n} value={n}>{n} soal</option>)}</select></label><label className="field-label">Tingkat kesulitan<select className="input" value={options.difficulty} onChange={(event) => setOptions({ ...options, difficulty: event.target.value as StudyDraftOptions["difficulty"] })}><option value="basic">Dasar</option><option value="intermediate">Menengah</option><option value="advanced">Lanjutan</option></select></label></> : null}
        {preferences.selectedGoal === "schedule" ? <><label className="field-label">Rentang revisi<select className="input" value={options.revisionDays} onChange={(event) => setOptions({ ...options, revisionDays: Number(event.target.value) as StudyDraftOptions["revisionDays"] })}>{[3, 7, 14].map((n) => <option key={n} value={n}>{n} hari</option>)}</select></label><label className="field-label">Waktu per hari<select className="input" value={options.minutesPerDay} onChange={(event) => setOptions({ ...options, minutesPerDay: Number(event.target.value) as StudyDraftOptions["minutesPerDay"] })}>{[20, 30, 45].map((n) => <option key={n} value={n}>{n} menit</option>)}</select></label></> : null}
        </div>
      </details>
    </div>
    <details className="advanced-settings" id="pengaturan-lanjutan" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
      <summary>Pengaturan lanjutan · agen dan preferensi</summary><div className="advanced-settings-content">
        <section><h3>Agen contoh</h3><p className="muted">Pilihan ini hanya disimpan di browser; agen belum dijalankan.</p><div className="stack compact settings-list">{agents.map((agent) => <AgentSelectorToggle key={agent.id} label={agent.name} checked={agent.required || preferences.enabledAgentIds.includes(agent.id)} onCheckedChange={(enabled) => { if (agent.required) return; setPreference("enabledAgentIds", enabled ? [...new Set([...preferences.enabledAgentIds, agent.id])] : preferences.enabledAgentIds.filter((id) => id !== agent.id)); }} />)}</div></section>
        <section><h3>Preferensi alur kerja</h3><WorkflowSettings values={workflowValues} onChange={changeWorkflowSetting} /><label className="field-label advanced-review">Preferensi tinjauan<select className="input" value={workflowPreferences.reviewPreference} onChange={(event) => setWorkflowPreference("reviewPreference", event.target.value)}><option>Tandai item yang meragukan</option><option>Tinjau semua hasil</option><option>Tampilkan sumber saja</option></select></label><label className="field-label advanced-review">Catatan untuk draf<textarea className="textarea" rows={3} value={preferences.description} onChange={(event) => setPreference("description", event.target.value)} /></label></section>
      </div>
    </details>
  </main>;
}
