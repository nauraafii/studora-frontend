import { useStudoraStore } from "@/lib/store";

export function MaterialPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const materials = useStudoraStore((state) => state.materials);
  return (
    <label className="field-label">
      Pilih dari Materi Saya
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Pilih materi</option>
        {materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}
      </select>
    </label>
  );
}
