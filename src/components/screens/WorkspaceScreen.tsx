"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpenText, CalendarDays, ChevronDown, Clock3, ListChecks, MessageSquareText, Play, Plus, Sparkles, type LucideIcon } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { AgentSelectorToggle } from "@/components/workspace/AgentSelectorToggle";
import { WorkflowSettings } from "@/components/workspace/WorkflowSettings";
import { MaterialPicker } from "@/components/workspace/MaterialPicker";
import { Button } from "@/components/ui/button";
import { agents } from "@/lib/mock-data";
import { useStudoraStore } from "@/lib/store";
import type { StudyChatMessage, StudyChatSession, StudyDraftOptions, StudyDraft, WorkspaceGoal } from "@/lib/types";

const defaultOptions: StudyDraftOptions = { summaryLength: "short", questionCount: 5, difficulty: "basic", revisionDays: 3, minutesPerDay: 30 };
const actions: { label: string; description: string; goal: WorkspaceGoal; prompt: string; icon: LucideIcon }[] = [
  { label: "Pahami materi", description: "Minta penjelasan atau ringkasan.", goal: "understand", prompt: "Bantu saya memahami pokok materi ini. Jelaskan konsep penting dengan bahasa sederhana.", icon: BookOpenText },
  { label: "Latihan soal", description: "Uji pemahaman dengan beberapa pertanyaan.", goal: "practice", prompt: "Buatkan latihan soal dari materi ini.", icon: ListChecks },
  { label: "Susun jadwal", description: "Rencanakan sesi revisi yang realistis.", goal: "schedule", prompt: "Bantu saya menyusun jadwal belajar untuk materi ini.", icon: CalendarDays },
];
const outputs: Record<WorkspaceGoal, string> = { understand: "Ringkasan", practice: "Soal latihan", schedule: "Rencana belajar" };
const goalLabels: Record<WorkspaceGoal, string> = { understand: "Pahami materi", practice: "Latihan soal", schedule: "Susun jadwal" };

function createId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
}

function formatSessionTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Waktu tidak tersedia" : new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function WorkspaceScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const materialQuery = searchParams.get("material");
  const draftQuery = searchParams.get("draft");
  const sessionQuery = searchParams.get("session");
  const settingsQuery = searchParams.get("settings");
  const preferences = useStudoraStore((state) => state.workspacePreferences);
  const workflowPreferences = useStudoraStore((state) => state.workflowPreferences);
  const savedDrafts = useStudoraStore((state) => state.studyDrafts);
  const chatSessions = useStudoraStore((state) => state.studyChatSessions);
  const materials = useStudoraStore((state) => state.materials);
  const setPreference = useStudoraStore((state) => state.setWorkspacePreference);
  const setWorkflowPreference = useStudoraStore((state) => state.setWorkflowPreference);
  const createChatSession = useStudoraStore((state) => state.createStudyChatSession);
  const appendChatMessage = useStudoraStore((state) => state.appendStudyChatMessage);
  const [advancedOpen, setAdvancedOpen] = useState(settingsQuery === "1");
  const [prompt, setPrompt] = useState("");
  const [promptPreserved, setPromptPreserved] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [options, setOptions] = useState<StudyDraftOptions>(defaultOptions);
  const [storeReady, setStoreReady] = useState(false);
  const lastSuggestedPrompt = useRef("");
  const promptRef = useRef("");
  const selectedMaterials = preferences.selectedMaterialIds
    .map((id) => materials.find((material) => material.id === id))
    .filter((material): material is (typeof materials)[number] => Boolean(material));
  const existingDraft = savedDrafts.find((item) => item.id === draftQuery);
  const activeSession = chatSessions.find((item) => item.id === sessionQuery);
  const workflowValues = [workflowPreferences.requireApproval, workflowPreferences.onlyOwnMaterials, workflowPreferences.showAgentActivity];

  useEffect(() => {
    const persistence = useStudoraStore.persist;
    if (!persistence || persistence.hasHydrated()) {
      setStoreReady(true);
      return;
    }
    return persistence.onFinishHydration(() => setStoreReady(true));
  }, []);

  useEffect(() => {
    if (!materialQuery || !materials.some((material) => material.id === materialQuery)) return;
    const selectedIds = useStudoraStore.getState().workspacePreferences.selectedMaterialIds;
    if (!selectedIds.includes(materialQuery)) setPreference("selectedMaterialIds", [...selectedIds, materialQuery]);
  }, [materialQuery, materials, setPreference]);

  useEffect(() => {
    if (!draftQuery || sessionQuery) return;
    const draft = savedDrafts.find((item) => item.id === draftQuery);
    if (!draft) return;
    setPreference("selectedMaterialIds", [draft.materialId]);
    setPreference("selectedGoal", draft.goal);
    setPreference("selectedOutputs", draft.outputs);
    setOptions({ ...defaultOptions, ...draft.options });
    lastSuggestedPrompt.current = "";
    setPromptPreserved(false);
    promptRef.current = draft.prompt ?? "";
    setPrompt(promptRef.current);
  }, [draftQuery, sessionQuery, savedDrafts, setPreference]);

  useEffect(() => {
    if (draftQuery || sessionQuery) return;
    const action = actions.find((item) => item.goal === preferences.selectedGoal);
    if (!action) return;
    const currentPrompt = promptRef.current.trim();
    if (!currentPrompt) {
      lastSuggestedPrompt.current = action.prompt;
      promptRef.current = action.prompt;
      setPrompt(action.prompt);
      return;
    }
    if (lastSuggestedPrompt.current && currentPrompt === lastSuggestedPrompt.current && currentPrompt !== action.prompt) {
      lastSuggestedPrompt.current = action.prompt;
      promptRef.current = action.prompt;
      setPrompt(action.prompt);
    }
  }, [draftQuery, sessionQuery, preferences.selectedGoal]);

  useEffect(() => { if (settingsQuery === "1") setAdvancedOpen(true); }, [settingsQuery]);
  useEffect(() => { setChatInput(""); }, [sessionQuery]);

  function selectAction(goal: WorkspaceGoal) {
    const action = actions.find((item) => item.goal === goal);
    if (!action) return;
    setPreference("selectedGoal", goal);
    setPreference("selectedOutputs", [outputs[goal]]);
    const currentPrompt = promptRef.current.trim();
    if (currentPrompt && currentPrompt !== lastSuggestedPrompt.current) {
      setPromptPreserved(true);
      return;
    }
    lastSuggestedPrompt.current = action.prompt;
    promptRef.current = action.prompt;
    setPrompt(action.prompt);
    setPromptPreserved(false);
  }

  function startSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedMaterials.length || !prompt.trim()) return;
    const now = new Date().toISOString();
    const firstMessage: StudyChatMessage = { id: createId("message"), role: "user", content: prompt.trim(), createdAt: now };
    const session: StudyChatSession = {
      id: createId("chat"),
      materials: selectedMaterials.map(({ id, name }) => ({ id, name })),
      goal: preferences.selectedGoal,
      options: { ...options },
      status: "waiting_for_ai",
      messages: [firstMessage],
      createdAt: now,
      updatedAt: now,
    };
    createChatSession(session);
    router.push(`/workspace-ai?session=${encodeURIComponent(session.id)}`);
  }

  function sendFollowUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeSession || !chatInput.trim()) return;
    const message: StudyChatMessage = { id: createId("message"), role: "user", content: chatInput.trim(), createdAt: new Date().toISOString() };
    appendChatMessage(activeSession.id, message);
    setChatInput("");
  }

  function changeWorkflowSetting(index: number, value: boolean) {
    const keys = ["requireApproval", "onlyOwnMaterials", "showAgentActivity"] as const;
    setWorkflowPreference(keys[index], value);
  }

  const selectedAction = actions.find((action) => action.goal === preferences.selectedGoal);

  return <main className="page-content chat-page-content">
    {sessionQuery && activeSession ? <>
      <PageHeading title="Percakapan belajar" description={`${activeSession.materials.length} materi dalam sesi ini`} aside={<span className="badge">Sesi tersimpan</span>} />
      <div className="chat-session-toolbar">
        <span><MessageSquareText size={15} aria-hidden="true" />{goalLabels[activeSession.goal]} · {activeSession.materials.length} materi · {activeSession.messages.length} pesan · diperbarui {formatSessionTime(activeSession.updatedAt)}</span>
        <Link href="/workspace-ai" className="button button-secondary"><Plus size={15} aria-hidden="true" />Sesi baru</Link>
      </div>
      <section className="chat-panel chat-session-panel" aria-label="Percakapan belajar">
        <div className="chat-panel-header">
          <div><h2>Materi sesi</h2><p>{goalLabels[activeSession.goal]} · materi tersimpan bersama sesi ini</p><ul className="chat-session-material-list">{activeSession.materials.map((material) => <li key={material.id}>{material.name}</li>)}</ul></div>
          <Clock3 className="chat-panel-header-icon" size={19} aria-hidden="true" />
        </div>
        <div className="chat-session-messages" aria-live="polite" aria-relevant="additions">
          {activeSession.messages.map((message) => <article className={message.role === "user" ? "chat-user-message" : "chat-ai-message"} key={message.id}>
            <span>{message.role === "user" ? "Anda" : "Studora"} · {formatSessionTime(message.createdAt)}</span>
            <p>{message.content}</p>
          </article>)}
          <div className="chat-ai-unavailable" role="status">
            <span className="chat-avatar"><Sparkles size={16} aria-hidden="true" /></span>
            <div><strong>AI belum tersambung</strong><p>Sesi dan pesan Anda tersimpan di perangkat ini. Jawaban AI akan tersedia setelah layanan tersambung.</p></div>
          </div>
        </div>
        <form className="chat-session-composer" onSubmit={sendFollowUp} aria-label="Kirim pesan lanjutan">
          <label className="chat-followup-label" htmlFor="chat-follow-up">Pesan lanjutan</label>
          <textarea id="chat-follow-up" className="textarea" rows={2} value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Tulis pesan lanjutan…" />
          <Button type="submit" disabled={!chatInput.trim()}><MessageSquareText size={15} aria-hidden="true" />Kirim pesan</Button>
        </form>
        <p className="chat-session-local-note">Percakapan ini disimpan di browser ini dan belum disinkronkan ke akun.</p>
      </section>
    </> : sessionQuery ? storeReady ? <section className="chat-session-missing"><h1>Sesi tidak ditemukan</h1><p>Sesi ini mungkin sudah dihapus dari penyimpanan perangkat.</p><Link className="button button-primary" href="/riwayat">Buka Riwayat</Link></section> : <p role="status">Memuat sesi…</p> : <>
      <PageHeading title="Ruang Kerja AI" description="Pilih materi, tentukan jenis bantuan, lalu tulis permintaan." />
      <div className="chat-service-status" role="status"><span aria-hidden="true" /><strong>Mode simulasi</strong><span>AI belum tersambung; materi belum dianalisis.</span></div>
      <form className="chat-workspace" onSubmit={startSession} aria-label="Siapkan sesi belajar">
        <section className="chat-panel" aria-label="Penyusun sesi belajar">
          <div className="chat-panel-header"><div><h2>Siapkan sesi belajar</h2><p>Pilih materi, bantuan yang dibutuhkan, lalu tulis instruksi.</p></div><Sparkles className="chat-panel-header-icon" size={20} aria-hidden="true" /></div>
          <div className="chat-composer">
            <MaterialPicker materials={materials} selectedIds={preferences.selectedMaterialIds} onChange={(ids) => setPreference("selectedMaterialIds", ids)} />
            <p className="chat-context-hint"><Link href="/pustaka-materi" className="text-link">Buka pustaka materi</Link> untuk menambahkan file baru.</p>
            <fieldset className="chat-kind-fieldset">
              <legend>Jenis bantuan</legend><p className="chat-context-hint">Pilih satu. Rincian hasil menyesuaikan pilihan ini.</p>
              <div className="chat-choice-grid">{actions.map((action) => { const Icon = action.icon; const isSelected = preferences.selectedGoal === action.goal; return <label className={`chat-choice${isSelected ? " is-selected" : ""}`} key={action.goal}><input type="radio" name="study-goal" value={action.goal} checked={isSelected} onChange={() => selectAction(action.goal)} /><Icon size={19} aria-hidden="true" /><span className="chat-choice-copy"><strong>{action.label}</strong><small>{action.description}</small></span></label>; })}</div>
            </fieldset>
            <details className="chat-options">
              <summary><span>Sesuaikan hasil</span><span className="chat-options-optional">Opsional</span><ChevronDown size={16} aria-hidden="true" /></summary>
              <div className="chat-options-body">
                <p className="chat-context-hint">Pengaturan ini ikut disimpan bersama sesi.</p><div className="chat-options-grid">
                  {preferences.selectedGoal === "understand" ? <label className="field-label">Panjang ringkasan<select className="input" value={options.summaryLength} onChange={(event) => setOptions({ ...options, summaryLength: event.target.value as StudyDraftOptions["summaryLength"] })}><option value="short">Singkat</option><option value="detailed">Mendalam</option></select></label> : null}
                  {preferences.selectedGoal === "practice" ? <><label className="field-label">Jumlah soal<select className="input" value={options.questionCount} onChange={(event) => setOptions({ ...options, questionCount: Number(event.target.value) as StudyDraftOptions["questionCount"] })}>{[5, 10, 20].map((n) => <option key={n} value={n}>{n} soal</option>)}</select></label><label className="field-label">Tingkat kesulitan<select className="input" value={options.difficulty} onChange={(event) => setOptions({ ...options, difficulty: event.target.value as StudyDraftOptions["difficulty"] })}><option value="basic">Dasar</option><option value="intermediate">Menengah</option><option value="advanced">Lanjutan</option></select></label></> : null}
                  {preferences.selectedGoal === "schedule" ? <><label className="field-label">Rentang revisi<select className="input" value={options.revisionDays} onChange={(event) => setOptions({ ...options, revisionDays: Number(event.target.value) as StudyDraftOptions["revisionDays"] })}>{[3, 7, 14].map((n) => <option key={n} value={n}>{n} hari</option>)}</select></label><label className="field-label">Waktu belajar per hari<select className="input" value={options.minutesPerDay} onChange={(event) => setOptions({ ...options, minutesPerDay: Number(event.target.value) as StudyDraftOptions["minutesPerDay"] })}>{[20, 30, 45].map((n) => <option key={n} value={n}>{n} menit</option>)}</select></label></> : null}
                </div>
              </div>
            </details>
            <div className="chat-prompt-field">
              <label className="chat-input-label" htmlFor="study-prompt">Permintaan Anda</label>
              <textarea id="study-prompt" className="textarea" rows={3} value={prompt} onChange={(event) => { promptRef.current = event.target.value; setPrompt(event.target.value); setPromptPreserved(false); }} aria-describedby="study-prompt-help" placeholder="Contoh: Ringkas bab ini, lalu jelaskan konsep yang paling sulit." />
              <p id="study-prompt-help" className="chat-context-hint">Ubah instruksi agar sesuai dengan hal yang ingin Anda pelajari.</p>
              {promptPreserved ? <p className="chat-prompt-preserved" role="status">Teks permintaan Anda dipertahankan. Jenis bantuan sudah berubah.</p> : null}
            </div>
            <div className="chat-composer-footer">
              <span>{selectedMaterials.length ? `${selectedMaterials.length} materi dipilih` : "Pilih materi dan tulis permintaan untuk melanjutkan."}</span>
              <Button type="submit" disabled={!selectedMaterials.length || !prompt.trim()}><Play size={15} aria-hidden="true" />Jalankan sesi</Button>
            </div>
            <p className="chat-disclaimer">Sesi langsung tersimpan di Riwayat. AI belum memproses materi saat ini.</p>
          </div>
        </section>
      </form>
    </>}

    <details className="advanced-settings chat-advanced-settings" id="pengaturan-lanjutan" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
      <summary>Pengaturan lanjutan · agen dan preferensi</summary><div className="advanced-settings-content">
        <section><h3>Agen contoh</h3><p className="muted">Pilihan ini hanya disimpan di browser; agen belum dijalankan.</p><div className="stack compact settings-list">{agents.map((agent) => <AgentSelectorToggle key={agent.id} label={agent.name} checked={agent.required || preferences.enabledAgentIds.includes(agent.id)} onCheckedChange={(enabled) => { if (agent.required) return; setPreference("enabledAgentIds", enabled ? [...new Set([...preferences.enabledAgentIds, agent.id])] : preferences.enabledAgentIds.filter((id) => id !== agent.id)); }} />)}</div></section>
        <section><h3>Preferensi alur kerja</h3><WorkflowSettings values={workflowValues} onChange={changeWorkflowSetting} /><label className="field-label advanced-review">Preferensi tinjauan<select className="input" value={workflowPreferences.reviewPreference} onChange={(event) => setWorkflowPreference("reviewPreference", event.target.value)}><option>Tandai item yang meragukan</option><option>Tinjau semua hasil</option><option>Tampilkan sumber saja</option></select></label><label className="field-label advanced-review">Catatan untuk draf<textarea className="textarea" rows={3} value={preferences.description} onChange={(event) => setPreference("description", event.target.value)} /></label></section>
      </div>
    </details>
  </main>;
}
