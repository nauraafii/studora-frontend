"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { PageHeading } from "@/components/shared/PageHeading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { clearLocalFiles } from "@/lib/local-files";
import { useStudoraStore } from "@/lib/store";

type Theme = "light" | "dark" | "system";

export function SettingsScreen() {
  const materials = useStudoraStore((state) => state.materials);
  const notes = useStudoraStore((state) => state.notes);
  const sessions = useStudoraStore((state) => state.studySessions);
  const samplePackLoaded = useStudoraStore((state) => state.samplePackLoaded);
  const removeSamplePack = useStudoraStore((state) => state.removeSamplePack);
  const resetData = useStudoraStore((state) => state.resetPrototypeData);
  const notificationPrefs = useStudoraStore((state) => state.notificationPreferences);
  const setNotificationPreference = useStudoraStore((state) => state.setNotificationPreference);
  const [theme, setTheme] = useState<Theme>("light");
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("studora-theme");
      if (stored === "light" || stored === "dark" || stored === "system") setTheme(stored);
    } catch { /* Browser storage may be unavailable. */ }
  }, []);
  function updateTheme(value: Theme) {
    setTheme(value);
    try { localStorage.setItem("studora-theme", value); } catch { /* Apply for this session. */ }
    const root = document.documentElement;
    root.dataset.themeChoice = value;
    root.dataset.theme = value === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : value;
  }
  async function clearData() {
    if (!window.confirm("Hapus seluruh materi lokal, catatan, tugas, rencana, draf, dan riwayat di browser ini? Tindakan ini tidak dapat dibatalkan.")) return;
    try {
      await clearLocalFiles();
      resetData();
      setNotice("Seluruh data belajar lokal berhasil dihapus.");
    } catch { setNotice("Penyimpanan berkas gagal dibersihkan. Data belum direset agar tidak terpisah."); }
  }
  function removeExamples() {
    if (!window.confirm("Hapus paket contoh beserta draf dan hasil kuis contohnya? Data pribadi tetap disimpan.")) return;
    removeSamplePack();
    setNotice("Paket contoh dihapus.");
  }
  return <main className="page-content">
    <PageHeading title="Pengaturan" description="Atur tampilan, pengingat, dan data pada perangkat ini." />
    <div className="content-aside-grid"><div className="stack">
      <Card><h2 className="card-title">Tampilan</h2><label className="field-label">Tema<select className="input" value={theme} onChange={(event) => updateTheme(event.target.value as Theme)}><option value="light">Terang</option><option value="dark">Gelap</option><option value="system">Sistem</option></select></label><p className="muted">Bahasa antarmuka: Bahasa Indonesia.</p></Card>
      <Card><h2 className="card-title">Pengingat lokal</h2><div className="stack compact settings-list">
        <div className="setting-row"><span>Tenggat tugas</span><Switch aria-label="Pengingat tenggat tugas" checked={notificationPrefs.deadlines} onCheckedChange={(value) => setNotificationPreference("deadlines", value)} /></div>
        <div className="setting-row"><span>Sesi belajar hari ini dan besok</span><Switch aria-label="Pengingat sesi belajar" checked={notificationPrefs.studyReminders} onCheckedChange={(value) => setNotificationPreference("studyReminders", value)} /></div>
      </div><p className="muted">Pengingat muncul saat aplikasi dibuka. Belum ada pesan push atau email.</p></Card>
      <Card><h2 className="card-title">Data pada perangkat ini</h2><dl className="summary-list"><div><dt>Materi</dt><dd>{materials.length}</dd></div><div><dt>Catatan</dt><dd>{notes.length}</dd></div><div><dt>Sesi belajar</dt><dd>{sessions.length}</dd></div></dl>
        {samplePackLoaded ? <Button variant="secondary" onClick={removeExamples}>Hapus paket contoh</Button> : null}
        <button type="button" className="danger-link" onClick={clearData}><Trash2 size={14} />Hapus semua data lokal</button>
        {notice ? <p className="muted" role="status">{notice}</p> : null}
      </Card>
    </div><aside className="stack">
      <Card id="akun"><h2 className="card-title">Akun</h2><Badge tone="amber">Belum tersambung</Badge><p className="muted">Studora saat ini berjalan sebagai ruang belajar lokal. Belum ada akun, sinkronisasi, atau pemulihan data lintas perangkat.</p><Link className="text-link" href="/login">Lihat rencana akses akun</Link></Card>
      <div className="notice notice-blue">AI belum memproses materi. Draf Ruang Kerja hanya menyimpan pilihan Anda di browser.</div>
      <Link className="button button-primary full-width" href="/">Kembali ke Dasbor</Link>
    </aside></div>
  </main>;
}
