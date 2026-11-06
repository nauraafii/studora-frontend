import { Search } from "lucide-react";

export function SearchInput({ value, onChange, placeholder = "Cari", label = "Cari daftar" }: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}) {
  return <label className="inline-search"><Search size={15} aria-hidden="true" /><input aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}
