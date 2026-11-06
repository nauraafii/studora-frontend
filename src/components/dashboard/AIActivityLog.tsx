import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

export function AIActivityLog() {
  return (
    <Card>
      <div className="card-head"><h2 className="card-title">Aktivitas AI</h2><Link className="text-link" href="/riwayat">Buka riwayat</Link></div>
      <div className="list-row">
        <span className="status-icon is-blue"><Sparkles size={15} aria-hidden="true" /></span>
        <div className="list-main"><strong>Belum ada eksekusi AI</strong><span>Layanan AI belum tersambung. Draf lokal dan kuis tersimpan di Riwayat Belajar.</span></div>
      </div>
    </Card>
  );
}
