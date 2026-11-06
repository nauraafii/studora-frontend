import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Deadline = { title: string; course: string; due: string; priority: string };

export function DeadlineItem({ item }: { item: Deadline }) {
  const urgent = item.priority === "Tinggi" || item.priority === "Terlambat";
  const tone = item.priority === "Terlambat" ? "red" : item.priority === "Tinggi" ? "amber" : item.priority === "Sedang" ? "amber" : "neutral";
  return (
    <div className="list-row">
      <span className={"status-icon " + (item.priority === "Terlambat" ? "is-red" : urgent ? "is-amber" : "is-blue")}><Circle size={13} fill="currentColor" /></span>
      <div className="list-main"><strong>{item.title}</strong><span>{item.course} · {item.due}</span></div>
      <Badge tone={tone}>{item.priority}</Badge>
    </div>
  );
}
