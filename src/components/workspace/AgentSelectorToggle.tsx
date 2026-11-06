import { Switch } from "@/components/ui/switch";

export function AgentSelectorToggle({ label, checked = true, onCheckedChange }: {
  label: string;
  checked?: boolean;
  onCheckedChange?: (value: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <span>{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={label} />
    </div>
  );
}
