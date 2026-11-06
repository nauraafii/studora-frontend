import type { HTMLAttributes } from "react";

export function MetricCard({ label, value, note, ...props }: HTMLAttributes<HTMLElement> & {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <article className="metric-card" {...props}>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <span className="metric-note">{note}</span>
    </article>
  );
}
