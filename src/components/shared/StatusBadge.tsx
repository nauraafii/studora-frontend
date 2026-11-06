import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  const tone = status === "Selesai" || status === "Aktif" ? "green"
    : status === "Perlu ditinjau" || status === "Menunggu" ? "amber"
    : status === "Dihentikan" ? "red"
    : status === "Baru" ? "violet"
    : "blue";
  return <Badge tone={tone}>{status}</Badge>;
}
