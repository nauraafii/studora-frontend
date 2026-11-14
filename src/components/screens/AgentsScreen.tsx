"use client";

import Link from "next/link";
import { ArrowRight, Bot, ShieldCheck, Sparkles } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { agents } from "@/lib/mock-data";
import { useStudoraStore } from "@/lib/store";

export function AgentsScreen() {
  const enabledAgentIds = useStudoraStore((state) => state.workspacePreferences.enabledAgentIds);
  return (
    <main className="page-content">
      <PageHeading title="Agen AI" description="Kenali peran agen dan atur peran opsional untuk draf belajar Anda." aside={<Badge tone="blue">Konfigurasi draf</Badge>} />
      <div className="notice notice-blue page-notice"><ShieldCheck size={15} aria-hidden="true" />Pilihan agen tersimpan sebagai preferensi lokal. Belum ada agen yang dijalankan atau materi yang dianalisis.</div>
      <ol className="agent-catalog" aria-label="Urutan peran agen AI">
        {agents.map((agent, index) => (
          <li key={agent.id}><Card className="agent-catalog-card">
            <div className="agent-card-head"><span className="agent-icon"><Bot size={17} aria-hidden="true" /></span><Badge>{String(index + 1).padStart(2, "0")}</Badge></div>
            <h2>{agent.name}</h2>
            <p>{agent.description}</p>
            <div className="agent-catalog-foot"><Sparkles size={14} aria-hidden="true" /><span>{agent.required ? "Selalu disertakan" : enabledAgentIds.includes(agent.id) ? "Dipilih pada draf" : "Tidak dipilih"}</span></div>
          </Card></li>
        ))}
      </ol>
      <Card className="agent-catalog-cta">
        <div><h2>Atur preferensi untuk draf Anda</h2><p>Di Ruang Kerja, Anda dapat meninjau pilihan agen dan batas materi yang dipakai saat layanan tersedia.</p></div>
        <Link className="button button-primary" href="/workspace-ai?settings=1">Buka pengaturan alur<ArrowRight size={15} aria-hidden="true" /></Link>
      </Card>
    </main>
  );
}
