import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "blue" | "violet" | "green" | "amber" | "red";

export function Badge({ tone = "neutral", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return <span className={("badge " + (tone === "neutral" ? "" : "badge-" + tone) + " " + className).trim()} {...props} />;
}
