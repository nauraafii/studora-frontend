import { FileSearch } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state">
      <span className="empty-icon"><FileSearch size={18} /></span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
