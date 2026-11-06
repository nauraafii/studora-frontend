import { AgentSelectorToggle } from "@/components/workspace/AgentSelectorToggle";

export function WorkflowSettings({ values, onChange }: {
  values: boolean[];
  onChange: (index: number, value: boolean) => void;
}) {
  const settings = [
    "Minta persetujuan sebelum alur kerja dimulai",
    "Batasi alur kerja pada materi pilihan",
    "Tampilkan log aktivitas saat tersedia",
  ];
  return (
    <div className="stack compact">
      {settings.map((setting, index) => (
        <AgentSelectorToggle key={setting} label={setting} checked={values[index]} onCheckedChange={(value) => onChange(index, value)} />
      ))}
    </div>
  );
}
