"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { AgentSelectorToggle } from "@/components/workspace/AgentSelectorToggle";
import { MaterialPicker } from "@/components/workspace/MaterialPicker";
import { WorkflowSettings } from "@/components/workspace/WorkflowSettings";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { agents } from "@/lib/mock-data";
import { useStudoraStore } from "@/lib/store";
import type { StudyDraft, StudyDraftOptions, WorkspaceGoal } from "@/lib/types";

const steps = ["Materi", "Tujuan", "Tinjau"] as const;
const goals: { id: WorkspaceGoal; label: string; description: string; output: string }[] = [
  { id: "understand", label: "Pahami konsep kunci", description: "Buat ringkasan singkat untuk membantu memahami topik.", output: "Ringkasan" },
  { id: "practice", label: "Latihan soal", description: "Gunakan pertanyaan untuk menguji ingatan Anda.", output: "Soal latihan" },
  { id: "schedule", label: "Susun jadwal revisi", description: "Atur sesi belajar harian sesuai waktu yang tersedia.", output: "Rencana belajar" },
];

const defaultOptions: StudyDraftOptions = {
  summaryLength: "short",
  questionCount: 5,
  difficulty: "basic",
  revisionDays: 3,
  minutesPerDay: 30,
};

function optionSummary(goal: WorkspaceGoal, options: StudyDraftOptions) {
  if (goal === "understand") return options.summaryLength === "short" ? "Ringkasan singkat" : "Ringkasan mendalam";
  if (goal === "practice") {
    const difficulty = { basic: "dasar", intermediate: "menengah", advanced: "lanjutan" }[options.difficulty];
    return `${options.questionCount} soal · ${difficulty}`;
  }
  return `${options.revisionDays} hari · ${options.minutesPerDay} menit per hari`;
}

function makeId() {
  return `draft-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`;
}

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
  const [step, setStep] = useState(0);
  const [advancedOpen, setAdvancedOpen] = useState(searchParams.get("settings") === "1");
  const [showPreview, setShowPreview] = useState(false);
  const [draftOptions, setDraftOptions] = useState<StudyDraftOptions>(defaultOptions);
  const selectedMaterial = materials.find((material) => material.id === preferences.selectedMaterialId);
  const selectedGoal = goals.find((goal) => goal.id === preferences.selectedGoal) ?? goals[0];

  useEffect(() => {
    if (materialQuery && materials.some((material) => material.id === materialQuery)) {
      setPreference("selectedMaterialId", materialQuery);
      setStep(0);
    }
  }, [materialQuery, materials, setPreference]);

  useEffect(() => {
    if (!draftQuery) return;
    const draft = savedDrafts.find((item) => item.id === draftQuery);
    if (!draft) return;
    setPreference("selectedMaterialId", draft.materialId);
    setPreference("selectedGoal", draft.goal);
    setPreference("selectedOutputs", draft.outputs);
    setDraftOptions({ ...defaultOptions, ...draft.options });
    setStep(2);
  }, [draftQuery, savedDrafts, setPreference]);

  useEffect(() => {
    if (settingsQuery !== "1") return;
    setAdvancedOpen(true);
  }, [settingsQuery]);

  const workflowValues = [workflowPreferences.requireApproval, workflowPreferences.onlyOwnMaterials, workflowPreferences.showAgentActivity];
  function changeWorkflowSetting(index: number, value: boolean) {
    const keys = ["requireApproval", "onlyOwnMaterials", "showAgentActivity"] as const;
    setWorkflowPreference(keys[index], value);
  }

  function chooseGoal(goal: WorkspaceGoal) {
    const selected = goals.find((item) => item.id === goal) ?? goals[0];
    setPreference("selectedGoal", goal);
    setPreference("selectedOutputs", [selected.output]);
    setShowPreview(false);
  }

  function updateOption<Key extends keyof StudyDraftOptions>(key: Key, value: StudyDraftOptions[Key]) {
    setDraftOptions((current) => ({ ...current, [key]: value }));
    setShowPreview(false);
  }

  function saveDraft() {
    if (!selectedMaterial) return;
    const existingDraft = savedDrafts.some((item) => item.id === draftQuery);
    const draft: StudyDraft = {
      id: existingDraft && draftQuery ? draftQuery : makeId(),
      materialId: selectedMaterial.id,
      goal: selectedGoal.id,
      outputs: [selectedGoal.output],
      options: draftOptions,
      createdAt: new Date().toISOString(),
    };
    saveStudyDraft(draft);
    router.push(`/riwayat?draft=${encodeURIComponent(draft.id)}`);
  }

  return (
    <main className="page-content">
      <PageHeading title="Ruang Kerja AI" description="Pilih materi dan atur hasil belajar yang ingin dibuat nanti." />

      <ol className="workspace-stepper" aria-label="Langkah menyusun draf belajar">
        {steps.map((label, index) => <li className={index === step ? "is-active" : index < step ? "is-step-complete" : ""} key={label} aria-current={index === step ? "step" : undefined}>
          <span className="step-number">{index < step ? <Check size={15} aria-hidden="true" /> : index + 1}</span>
          <span>{label}</span>
        </li>)}
      </ol>

      <div className="workspace-service-note" role="status">
        <span className="service-status-indicator"><span aria-hidden="true" />AI belum tersambung</span>
        <span>Draf dapat disimpan di browser. Materi belum dianalisis AI.</span>
      </div>

      <div className="workspace-flow-layout">
        <section className="workspace-primary" aria-live="polite">
          {step === 0 ? <>
            <h2>Pilih materi</h2>
            <p className="workspace-intro">Pilih satu materi pribadi atau dari paket contoh untuk memulai.</p>
            <MaterialPicker value={preferences.selectedMaterialId} onChange={(value) => setPreference("selectedMaterialId", value)} />
            <p className="field-hint">{selectedMaterial ? (selectedMaterial.origin === "sample" ? "Materi dari paket contoh." : "Materi tersimpan di browser ini.") : "Belum ada materi yang dipilih."} <Link href="/pustaka-materi" className="text-link">Buka Pustaka Materi</Link></p>
            <div className="workspace-actions workspace-actions-end">
              <Button disabled={!selectedMaterial} onClick={() => setStep(1)}>Berikutnya: pilih tujuan<ArrowRight size={15} aria-hidden="true" /></Button>
            </div>
          </> : null}

          {step === 1 ? <>
            <h2>Tujuan belajar</h2>
            <p className="workspace-intro">Pilih satu hasil yang paling membantu Anda saat ini.</p>
            <fieldset className="goal-options">
              <legend className="visually-hidden">Pilih tujuan belajar</legend>
              {goals.map((goal) => <label className={preferences.selectedGoal === goal.id ? "goal-option is-selected" : "goal-option"} key={goal.id}>
                <input type="radio" name="workspace-goal" value={goal.id} checked={preferences.selectedGoal === goal.id} onChange={() => chooseGoal(goal.id)} />
                <span className="goal-radio" aria-hidden="true" /><span><strong>{goal.label}</strong><small>{goal.description}</small></span>
              </label>)}
            </fieldset>
            <fieldset className="goal-settings">
              <legend>Atur hasil</legend>
              {preferences.selectedGoal === "understand" ? <div className="goal-setting-group">
                <span>Panjang ringkasan</span>
                <div className="goal-setting-choices">
                  {([{ value: "short", label: "Singkat", hint: "Poin utama untuk tinjauan cepat" }, { value: "detailed", label: "Mendalam", hint: "Penjelasan lebih lengkap" }] as const).map((choice) => <label className={draftOptions.summaryLength === choice.value ? "goal-setting-choice is-selected" : "goal-setting-choice"} key={choice.value}>
                    <input type="radio" name="summary-length" checked={draftOptions.summaryLength === choice.value} onChange={() => updateOption("summaryLength", choice.value)} />
                    <strong>{choice.label}</strong><small>{choice.hint}</small>
                  </label>)}
                </div>
              </div> : null}
              {preferences.selectedGoal === "practice" ? <>
                <div className="goal-setting-group">
                  <span>Jumlah soal</span>
                  <div className="goal-setting-choices">
                    {([5, 10, 20] as const).map((count) => <label className={draftOptions.questionCount === count ? "goal-setting-choice is-selected" : "goal-setting-choice"} key={count}>
                      <input type="radio" name="question-count" checked={draftOptions.questionCount === count} onChange={() => updateOption("questionCount", count)} />
                      <strong>{count} soal</strong>
                    </label>)}
                  </div>
                </div>
                <div className="goal-setting-group">
                  <span>Tingkat kesulitan</span>
                  <div className="goal-setting-choices">
                    {([{ value: "basic", label: "Dasar" }, { value: "intermediate", label: "Menengah" }, { value: "advanced", label: "Lanjutan" }] as const).map((choice) => <label className={draftOptions.difficulty === choice.value ? "goal-setting-choice is-selected" : "goal-setting-choice"} key={choice.value}>
                      <input type="radio" name="difficulty" checked={draftOptions.difficulty === choice.value} onChange={() => updateOption("difficulty", choice.value)} />
                      <strong>{choice.label}</strong>
                    </label>)}
                  </div>
                </div>
              </> : null}
              {preferences.selectedGoal === "schedule" ? <>
                <div className="goal-setting-group">
                  <span>Rentang revisi</span>
                  <div className="goal-setting-choices">
                    {([3, 7, 14] as const).map((days) => <label className={draftOptions.revisionDays === days ? "goal-setting-choice is-selected" : "goal-setting-choice"} key={days}>
                      <input type="radio" name="revision-days" checked={draftOptions.revisionDays === days} onChange={() => updateOption("revisionDays", days)} />
                      <strong>{days} hari</strong>
                    </label>)}
                  </div>
                </div>
                <div className="goal-setting-group">
                  <span>Waktu belajar per hari</span>
                  <div className="goal-setting-choices">
                    {([20, 30, 45] as const).map((minutes) => <label className={draftOptions.minutesPerDay === minutes ? "goal-setting-choice is-selected" : "goal-setting-choice"} key={minutes}>
                      <input type="radio" name="minutes-per-day" checked={draftOptions.minutesPerDay === minutes} onChange={() => updateOption("minutesPerDay", minutes)} />
                      <strong>{minutes} menit</strong>
                    </label>)}
                  </div>
                </div>
              </> : null}
            </fieldset>
            <div className="workspace-actions">
              <Button variant="secondary" onClick={() => setStep(0)}>Kembali ke materi</Button>
              <Button onClick={() => setStep(2)}>Berikutnya: tinjau draf<ArrowRight size={15} aria-hidden="true" /></Button>
            </div>
          </> : null}

          {step === 2 ? <>
            <h2>Tinjau draf belajar</h2>
            <p className="workspace-intro">Pastikan materi dan tujuan sudah sesuai sebelum menyimpan.</p>
            <div className="draft-summary">
              <div><span>Materi</span><strong>{selectedMaterial?.name ?? "Pilih materi terlebih dahulu"}</strong></div>
              <div><span>Tujuan</span><strong>{selectedGoal.label}</strong></div>
              <div><span>Hasil draf</span><strong>{selectedGoal.output}</strong></div>
              <div><span>Pengaturan hasil</span><strong>{optionSummary(selectedGoal.id, draftOptions)}</strong></div>
            </div>
            <div className="sample-output">
              <div className="sample-output-heading"><h3>Gambaran format hasil</h3><Badge tone="blue">Ilustrasi</Badge></div>
              <p className="notice notice-blue">Struktur di bawah ini hanya ilustrasi. Isi materi belum dianalisis.</p>
              {showPreview ? <div className="sample-output-body">
                <strong>{selectedGoal.id === "practice" ? `Latihan: ${draftOptions.questionCount} soal` : selectedGoal.id === "schedule" ? `Rencana: ${draftOptions.revisionDays} hari` : `Ringkasan ${draftOptions.summaryLength === "short" ? "singkat" : "mendalam"}`}</strong>
                <p>{selectedGoal.id === "practice"
                  ? "Setiap soal akan memiliki pertanyaan, pilihan atau ruang jawaban, kunci, dan penjelasan. Topiknya akan mengikuti materi setelah layanan AI tersedia."
                  : selectedGoal.id === "schedule"
                    ? `Setiap hari akan berisi sesi sekitar ${draftOptions.minutesPerDay} menit, topik revisi, dan kegiatan penutup. Topiknya akan mengikuti materi setelah layanan AI tersedia.`
                    : "Hasil akan berisi konsep utama, penjelasan, dan poin yang perlu diingat. Isinya akan mengikuti materi setelah layanan AI tersedia."}</p>
              </div> : <button type="button" className="text-link preview-link" aria-expanded={showPreview} onClick={() => setShowPreview(true)}>Lihat format hasil<ArrowRight size={14} aria-hidden="true" /></button>}
            </div>
            <div className="workspace-actions">
              <Button variant="secondary" onClick={() => { setStep(1); setShowPreview(false); }}>Kembali ke tujuan</Button>
              <Button onClick={saveDraft} disabled={!selectedMaterial}><Check size={15} aria-hidden="true" />{draftQuery && savedDrafts.some((item) => item.id === draftQuery) ? "Simpan perubahan" : "Simpan draf"}</Button>
            </div>
          </> : null}
        </section>
        <aside className="workspace-selection" aria-labelledby="workspace-selection-title">
          <h2 id="workspace-selection-title">Ringkasan draf</h2>
          <p>Pilihan Anda selama menyusun rencana belajar.</p>
          <dl>
            <div><dt>Materi</dt><dd>{selectedMaterial?.name ?? "Belum dipilih"}</dd></div>
            <div><dt>Tujuan</dt><dd>{step > 0 ? selectedGoal.label : "Pilih pada langkah berikutnya"}</dd></div>
            {step > 0 ? <div><dt>Pengaturan hasil</dt><dd>{optionSummary(selectedGoal.id, draftOptions)}</dd></div> : null}
          </dl>
          <div className="workspace-selection-note">Draf disimpan di browser. Hasil belajar belum dibuat oleh AI.</div>
        </aside>
      </div>

      <details className="advanced-settings" id="pengaturan-lanjutan" open={advancedOpen} onToggle={(event) => setAdvancedOpen(event.currentTarget.open)}>
        <summary>Pengaturan lanjutan · agen dan preferensi</summary>
        <div className="advanced-settings-content">
          <section>
            <h3>Agen contoh</h3>
            <p className="muted">Pilihan ini hanya disimpan di browser; agen belum dijalankan.</p>
            <div className="stack compact settings-list">
              {agents.map((agent) => <AgentSelectorToggle key={agent.id} label={agent.name} checked={agent.required || preferences.enabledAgentIds.includes(agent.id)} onCheckedChange={(enabled) => {
                if (agent.required) return;
                setPreference("enabledAgentIds", enabled
                  ? [...new Set([...preferences.enabledAgentIds, agent.id])]
                  : preferences.enabledAgentIds.filter((id) => id !== agent.id));
              }} />)}
            </div>
          </section>
          <section>
            <h3>Preferensi alur kerja</h3>
            <WorkflowSettings values={workflowValues} onChange={changeWorkflowSetting} />
            <label className="field-label advanced-review">Preferensi tinjauan
              <select className="input" value={workflowPreferences.reviewPreference} onChange={(event) => setWorkflowPreference("reviewPreference", event.target.value)}>
                <option>Tandai item yang meragukan</option><option>Tinjau semua hasil</option><option>Tampilkan sumber saja</option>
              </select>
            </label>
            <label className="field-label advanced-review">Catatan untuk draf
              <textarea className="textarea" rows={3} value={preferences.description} onChange={(event) => setPreference("description", event.target.value)} />
            </label>
          </section>
        </div>
      </details>
    </main>
  );
}
